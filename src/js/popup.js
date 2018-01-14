import React from 'react'
import { render } from 'react-dom'

import '../css/icon.css'
import store from './popup/store'
import App from './popup/App'

store.initStore().then(_ => {
  return render(<App store={store} />, document.getElementById('app'))
})
