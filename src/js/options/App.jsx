import React from 'react'

import CategoryList from './CategoryList'

export default (props) => {
  return (
    <div>
      <CategoryList chromeExtensions={props.chromeExtensions} />
    </div>
  )
}
