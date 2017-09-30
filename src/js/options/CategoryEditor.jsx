import React, { Component } from 'react'
import classNames from 'classnames'
import update from 'immutability-helper'

import img404 from '../../img/404.png'

class CategoryEditor extends Component {
  constructor (props) {
    super(props)
    this.state = {
      name: props.model.name,
      extensions: mergeExtensions(props.model.extensions, props.chromeExtensions)
    }
  }

  componentDidMount () {
    this.nameInput.value = this.state.name
    this.nameInput.focus()
  }

  handleNameChange = e => {
    this.setState({
      name: e.target.value
    })
  }

  saveCategory = () => {
    let {name, extensions} = this.state
    let {enabled} = this.props.model
    let checkedExtensions = extensions.filter(ext => ext.checked === true)
    this.props.saveCategory({name, extensions: checkedExtensions, isNew: false, editing: false, enabled})
  }

  toggleExtensionCheckStatus = (index) => {
    let {extensions} = this.state
    let extension = extensions[index]
    extension.checked = !extension.checked
    this.setState(update(extensions, {
      $splice: [
        [index, 1, extension]
      ]
    }))
  }

  render () {
    let {extensions} = this.state
    let {
      removeCategory
    } = this.props
    return (
      <div className='category'>
        <div className='category-content'>
          <div className='category-header'>
            <input
              ref={input => { this.nameInput = input }}
              className='category-title category-title-editing'
              title='Drag to reorder'
              type='text'
              onChange={this.handleNameChange}
            />
            <div className='category-controlbtn-list'>
              <button
                title='Save'
                className='category-controlbtn-item'
                onClick={_ => this.saveCategory()}
              >
                &#10004;
              </button>
              <button
                title='Remove'
                className='category-controlbtn-item'
                onClick={removeCategory}
              >
                &#10008;
              </button>
            </div>
          </div>
          <ul className='category-ext-list category-ext-list-editing'>
            {
              extensions.map((ext, index) => {
                return (
                  <li
                    className={classNames('category-ext-item',
                      ext.removed && 'category-ext-item-disabled')}
                    key={ext.id}
                  >
                    <input
                      type='checkbox'
                      className='category-ext-check'
                      checked={ext.checked}
                      onChange={_ => this.toggleExtensionCheckStatus(index)}
                    />
                    <img className='category-ext-icon' src={ext.removed ? img404 : ext.icon} />
                    <p className='category-ext-label'>{ext.name}</p>
                  </li>
                )
              })
            }
          </ul>
        </div>
      </div>
    )
  }
}

function mergeExtensions (categoryExtensions, chromeExtensions) {
  for (let chromeExt of chromeExtensions) {
    let categoryIndex = categoryExtensions.findIndex(ext => ext.id === chromeExt.id)
    if (categoryIndex < 0) {
      chromeExt.checked = false
    } else {
      chromeExt.checked = true
      categoryExtensions.splice(categoryIndex, 1)
    }
    chromeExt.removed = false
  }
  return chromeExtensions.concat(categoryExtensions.map(ext => {
    ext.checked = true
    ext.removed = true
    return ext
  }))
}

export default CategoryEditor
