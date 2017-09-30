import React from 'react'
import { render } from 'react-dom'

import '../css/popup.css'

import App from './popup/App.jsx'

chrome.runtime.sendMessage({action: 'listExtensions'}, exts => {
  render(
    <App chromeExtensions={exts} />,
    document.getElementById('app')
  )
})
