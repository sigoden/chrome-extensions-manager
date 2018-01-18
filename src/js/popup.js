import React from 'react'
import { render } from 'react-dom'

import '../css/icon.css'
import store from './popup/store'
import App from './popup/App'

window.i18n = function (name) {
  return chrome.i18n.getMessage(name)
}

store.initStore().then(_ => {
  return render(<App store={store} />, document.getElementById('app'))
})
