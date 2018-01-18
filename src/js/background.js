// 快照: 记录 chrome 扩展程序的状态, 可以一键将 chrome 扩展程序同步到快照记录的状态

// 当前扩展程序的状态快照
let currentSnapshot = {
  enabled: [], // 启用组
  disabled: [], // 禁用组
}

window.i18n = function (name) {
  return chrome.i18n.getMessage(name)
}

let mid = chrome.runtime.id

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
  {name: SNAPSHOT_NONE, builtin: true, title: i18n('background_snapshot_none'),  enabled: [], disabled: extensionIndexes},
  {name: SNAPSHOT_ALL, builtin: true, title: i18n('background_snapshot_all'), enabled: extensionIndexes, disabled: []},
  {name: SNAPSHOT_LAST, builtin: true, title: i18n('background_snapshot_last'),  enabled: [], disabled: []},
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
        extension => extension.type === 'extension' && extension.id !== mid
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
    icons,
  } = extension
  return {
    enabled,
    name,
    icon: icons[0].url,
    id,
    optionsUrl,
  }
}

function loadSnapshotStore () {
  chrome.storage.sync.get('store', function (res) {
    if (res && res.store) {
      res.store.forEach(snapshot => {
        snapshotStore.push(snapshot)
      })
    }
  })
}

// 批量启用/禁用扩展
function updateExtensionsState (indexes, state) {
  for (let id of indexes) {
    // 确保扩展程序存在
    if (extensionIndexes.indexOf(id) > -1) {
      chrome.management.setEnabled(id, state)
      // 同步扩展的状态变更到当前快照中
      syncExtensionStateToCurrentSnapshot(id, state)
    }
  }
}

// 同步扩展程序的启用/禁用变更到当前快照
function syncExtensionStateToCurrentSnapshot (id, state) {
  let {enabled, disabled} = currentSnapshot
  if (state) { // 启用
    exchange(id, disabled, enabled, extensionIndexes)
  } else {
    exchange(id, enabled, disabled, extensionIndexes)
  }
}

// 从一个集合中移动一个元素到另一个集合，并保证顺序
function exchange (ele, srcColl, dstColl, sortRef) {
  let index = srcColl.indexOf(ele)
  if (index === -1) { return }
  srcColl.splice(index, 1)

  let refIndexEle = sortRef.indexOf(ele)
  if (refIndexEle === -1) {
    dstColl.push(ele)
    return
  }
  let insertIndex
  for (insertIndex = 0; insertIndex < dstColl.length; insertIndex++) {
    let item = dstColl[insertIndex]
    let refIndexItem = sortRef.indexOf(item)
    if (refIndexItem < refIndexEle) {
      continue
    }
    break
  }
  dstColl.splice(insertIndex, 0, ele)
}

function applySnapshot (name) {
  let foundIndex = snapshotStore.findIndex(snapshot => snapshot.name === name)
  if (name !== SNAPSHOT_LAST) {
    // backup
    snapshotStore[2].enabled = currentSnapshot.enabled.slice()
    snapshotStore[2].disabled = currentSnapshot.disabled.slice()
  }
  let {enabled, disabled} = snapshotStore[foundIndex]
  updateExtensionsState(enabled, true)
  updateExtensionsState(disabled, false)
}

function upsertSnapshot (snapshot) {
  let {name} = snapshot
  if (BUILDIN_SNAPSHOT_NAMES.indexOf(name) > -1) {
    throw new Error('cannot modify buildin snapshot')
  }
  let foundIndex = snapshotStore.findIndex(snapshot => snapshot.name === name)
  if (foundIndex === -1) {
    snapshotStore.push(snapshot)
  } else {
    Object.assign(snapshotStore[foundIndex], snapshot)
  }
  saveSnapshotStore()
}

function removeSnapshot (name) {
  if (BUILDIN_SNAPSHOT_NAMES.indexOf(name) > -1) {
    throw new Error('cannot modify buildin snapshot')
  }
  let foundIndex = snapshotStore.findIndex(snapshot => snapshot.name === name)
  if (foundIndex === -1) { return }
  snapshotStore.splice(foundIndex, 1)
  saveSnapshotStore()
}

function saveSnapshotStore () {
  console.log(snapshotStore.slice(3))
  chrome.storage.sync.set({store: snapshotStore.slice(3)})
}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    console.log(request)
    try {
      switch (request.action) {
        case 'initStore':
          sendResponse({
            ok: true,
            data: {
              extensionHashs,
              currentSnapshot,
              snapshotStore,
            },
          })
          return true
        case 'upsertSnapshot':
          upsertSnapshot(request.snapshot)
          sendResponse({
            ok: true,
            data: {
              snapshotStore,
            },
          })
          return true
        case 'removeSnapshot':
          removeSnapshot(request.name)
          sendResponse({
            ok: true,
            data: {
              snapshotStore,
            },
          })
          return true
        case 'updateExtensionsState':
          updateExtensionsState(request.indexes, request.state)
          sendResponse({
            ok: true,
            data: {
              currentSnapshot,
            },
          })
          return true
        case 'disabledMe':
          chrome.management.setEnabled(mid, false)
          sendResponse({
            ok: true,
          })
          return true
        case 'applySnapshot':
          applySnapshot(request.name)
          sendResponse({
            ok: true,
            data: {
              snapshotStore,
              currentSnapshot,
            },
          })
          return true
        default:
          sendResponse({ok: false, err: `Action ${request.action} Unsupported`})
          return true
      }
    } catch (e) {
      sendResponse({ok: false, err: e.message})
      return true
    }
  })
