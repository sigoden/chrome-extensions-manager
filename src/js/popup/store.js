import {observable, extendObservable} from 'mobx'

const store = observable({})

const ACTIONS = [
  'initStore',
  'upsertSnapshot',
  'removeSnapshot',
  'updateExtensionsState',
  'applySnapshot',
  'disabledMe',
]

for (let action of ACTIONS) {
  store[action] = (data) => {
    return new Promise((resolve, reject) => {
      // console.log(action, params)
      chrome.runtime.sendMessage({
        action,
        ...data,
      }, response => {
        // console.log(response)
        if (response) {
          if (response.ok) {
            if (typeof response.data === 'object') {
              extendObservable(store, response.data)
            }
            return resolve()
          }
          return reject(response.err)
        }
        return resolve()
      })
    })
  }
}

export default store
