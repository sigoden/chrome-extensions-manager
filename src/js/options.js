import React from 'react'
import { render } from 'react-dom'

import '../css/options.css'

import App from './options/App.jsx'

chrome.runtime.sendMessage({action: 'listExtensions'}, exts => {
  render(
    <App chromeExtensions={exts} />,
    document.getElementById('app')
  )
})
