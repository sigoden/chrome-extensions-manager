// 快照: 记录 chrome 扩展程序的状态, 可以一键将 chrome 扩展程序同步到快照记录的状态

// CHROME 当前扩展程序的状态快照
let currentSnapshot

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
  {name: SNAPSHOT_NONE, indexes: []},
  {name: SNAPSHOT_ALL, indexes: currentSnapshot.indexes},
  {name: SNAPSHOT_LAST, indexes: null},
]


fetchExtensions(pruneExtensionObject).then(extensions => {
  currentSnapshot = createCurrentSnapshot(extensions)
})

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

// 批量启用/禁用扩展
function setExtensionsEnable (indexes, state) {
  for (let id of indexes) {
    chrome.management.setEnable(id, state, () => {
      // 同步扩展的状态变更到当前快照中
      currentSnapshot.hashed[id].enabled = false
    })
  }
}

function createCurrentSnapshot (extensions) {
  let indexes = extensions.map(ext => ext.id)
  let hashed = extensions.reduce((acc, ext) => {
    acc[ext.id] = ext
    return acc
  }, {})
  return {indexes, hashed}
}

function applySnapshot (name) {
  let foundIndex = findSnapshot(name)
  let snapshot = snapshotStore[foundIndex]

  backupSnapshot()
  let indexesWillEnable = snapshot.indexes
  let indexesWillDisable = arraySubtract(currentSnapshot.indexes, snapshot.indexes)

  setExtensionsEnable(indexesWillEnable, true)
  setExtensionsEnable(indexesWillDisable, false)

  updateLastSnapshot(indexes)
}

function arraySubtract (coll, subt) {
  return coll.filter(item => subt.indexOf(item) === -1)
}

function backupSnapshot () {
  let lastIndex = findSnapshot(SNAPSHOT_LAST)
  snapshotStore[lastIndex].indexes = indexes
}

function upsertSnapshot (name, indexes) {
  let foundIndex = findSnapshot(name)
  if (foundIndex === -1) {
    snapshotStore.push({name, indexes})
  }
  snapshotStore[foundIndex].indexes = indexes
  chrome.storage.save({store: snapshotStore})
}

function removeSnapshot (name, indexes) {
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
  chrome.storage.save({store: snapshotStore})
}

