import React from 'react'

import MenuList from './MenuList.jsx'

const App = (props) => {
  return (
    <div>
      <MenuList chromeExtensions={props.chromeExtensions} />
      <div>
        <a className='footer-btn' href='./options.html' target='_blank'>Options</a>
      </div>
    </div>
  )
}

export default App
