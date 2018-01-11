// 快照: 记录 chrome 扩展程序的状态, 可以一键将 chrome 扩展程序同步到快照记录的状态

// 当前扩展程序的状态快照
let currentSnapshot = {
  enabled: [], // 启用组
  disabled: [], // 禁用组
}

// CHROME 已安装的扩展程序
let extensionHashs = {}

// 扩展程序 ID 索引, 主要用来排序
let extensionIndexes = []

// 内置快照列表，用户无法创建名称与会此产生冲突的快照
const SNAPSHOT_NONE = 'none'    // 用于一键禁用所以扩展
const SNAPSHOT_ALL = 'all'      // 用于一键禁用所以扩展
const SNAPSHOT_LAST = 'last'    // 保存执行快照操作前的快照, 以便还原

const BUILDIN_SNAPSHOT_NAMES = [
  SNAPSHOT_NONE,
  SNAPSHOT_ALL,
  SNAPSHOT_NONE,
]

// 快照库，用户能自由的添加删除, 会实时同步到 sync storage 中
let snapshotStore = [
  {name: SNAPSHOT_NONE, enabled: [], disabled: extensionIndexes},
  {name: SNAPSHOT_ALL, enabled: extensionIndexes, disabled: []},
  {name: SNAPSHOT_LAST, enabled: currentSnapshot.enabled, disabled: currentSnapshot.disabled},
]

fetchExtensions(pruneExtensionObject).then(extensions => {
  for (let ext of extensions) {
    let {id, enabled} = ext
    extensionIndexes.push(id)
    extensionHashs[id] = ext
    let abled = enabled ? currentSnapshot.enabled : currentSnapshot.disabled
    abled.push(id)
  }
})

loadSnapshotStore()

// 获取所以安装的扩展
function fetchExtensions (prejectionFunc) {
  return new Promise((resolve, reject) => {
    chrome.management.getAll(extensions => {
      let exts = extensions.filter(
        extension => extension.type === 'extension'
      ).map(extension => {
        return prejectionFunc(extension)
      })
      resolve(exts)
    })
  })
}

// 仅选取需要的字段
function pruneExtensionObject (extension) {
  let {
    enabled,
    name,
    id,
    optionsUrl,
  } = extension
  return {
    enabled,
    name,
    id,
    optionsUrl,
  }
}

function loadSnapshotStore () {
  chrome.storage.sync.get(['store'], function (store) {
    if (store) {
      store.forEach(snapshot => {
        snapshotStore.push(snapshot)
      })
    }
  })
}

// 批量启用/禁用扩展
function updateExtensionsState (indexes, state) {
  for (let id of indexes) {
    chrome.management.setEnable(id, state, () => {
      // 同步扩展的状态变更到当前快照中
      syncExtensionStateToCurrentSnapshot(id, state)
    })
  }
}

// 同步扩展程序的启用/禁用变更到当前快照
function syncExtensionStateToCurrentSnapshot (id, state) {
  let {enabled, disabled} = currentSnapshot
  let enabledIndex = enabled.indexOf(id)
  let disabledIndex = disabled.indexOf(id)
  if (state === true) { // 启用
    if (enabledIndex > -1) {
      enabled.splice(enabled, 1)
    }
    if (disabledIndex === -1) {
      disabled.push(id)
    }
  } else {
    if (disabledIndex > -1) {
      disabledIndex.splice(enabled, 1)
    }
    if (enabled === -1) {
      enabled.push(id)
    }
  }
}

function applySnapshot (name) {
  let foundIndex = findSnapshot(name)
  backupSnapshot()

  let {enabled, disabled} = snapshotStore[foundIndex]

  updateExtensionsState(enabled, true)
  updateExtensionsState(disabled, false)
}

function backupSnapshot () {
  let lastIndex = findSnapshot(SNAPSHOT_LAST)
  let snapshot = snapshotStore[lastIndex]
  snapshot.enabled = currentSnapshot.enabled
  snapshot.disabled = currentSnapshot.disabled
}

function upsertSnapshot (snapshot) {
  let {name, enabled, disabled} = snapshot
  let foundIndex = findSnapshot(name)
  if (foundIndex === -1) {
    snapshotStore.push({name, enabled, disabled})
  }
  snapshotStore[foundIndex].enabled = enabled
  snapshotStore[foundIndex].disabled = disabled
  chrome.storage.save({store: snapshotStore})
}

function removeSnapshot (name) {
  let foundIndex = findSnapshot(name)
  if (foundIndex === -1) { return }
  snapshotStore.splice(foundIndex, 1)
  saveSnapshotStore()
}

function findSnapshot (name) {
  if (BUILDIN_SNAPSHOT_NAMES.indexOf(name) > -1) {
    throw new Error(`conflict with buildin snapshot ${name}`)
  }
  return snapshotStore.findIndex(snapshot => snapshot.name === name)
}

function saveSnapshotStore () {
  chrome.storage.save({store: snapshotStore.slice(3)})
}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'getExtensionsInfo':
          sendResponse({
            extensionHashs,
            extensionIndexes,
            currentSnapshot,
          })
          return true
        case 'upsertSnapshot':
          upsertSnapshot(request.snapshot)
          return
        case 'removeSnapshot':
          removeSnapshot(request.name)
          return
        case 'updateExtensionsState':
          updateExtensionsState(request.indexes, request.state)
          return
        case 'applySnapshot':
          applySnapshot(name)
          return
        default:
          sendResponse({ok: false, err: `Action ${request.action} Unsupported`})
          return true
      }
    } catch (e) {
      sendResponse({ok: false, err: e.message})
      return true
    }
  })
