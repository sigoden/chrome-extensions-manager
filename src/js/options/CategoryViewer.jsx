import React from 'react'

import img404 from '../../img/404.png'

const CategoryViewer = (props) => {
  let {
    model: {name, extensions},
    chromeExtensions,
    editCategory,
    removeCategory,
    canMove,
    setMoveable
  } = props
  let chromeExtensionIds = chromeExtensions.map(ext => ext.id)
  return (
    <div className='category'>
      <div className='category-content'>
        <div className='category-header'>
          <h3 className='category-title category-title-viewing'>{name}</h3>
          <div className='category-controlbtn-list'>
            {canMove &&
              <button
                className='category-controlbtn-item'
                title='Drag to reorder'
                onMouseEnter={_ => setMoveable(true)}
                onMouseLeave={_ => setMoveable(false)}
              >
                &#10683;
              </button>
            }
            <button
              title='Edit'
              className='category-controlbtn-item'
              onClick={editCategory}
            >
              &#9998;
            </button>
            <button
              className='category-controlbtn-item'
              title='Remove'
              onClick={removeCategory}
            >
              &#10008;
            </button>
          </div>
        </div>
        <ul className='category-ext-list category-ext-list-viewing'>
          {
            extensions.map(ext => {
              let removed = chromeExtensionIds.indexOf(ext.id) < 0
              return (
                <li className='category-ext-item' key={ext.id}>
                  {
                    removed
                      ? <img className='category-ext-icon' title={ext.name + '-- Unintalled'} src={img404} />
                      : <img className='category-ext-icon' title={ext.name} src={ext.icon} />
                  }
                </li>
              )
            })
          }
        </ul>
      </div>
    </div>
  )
}

export default CategoryViewer
