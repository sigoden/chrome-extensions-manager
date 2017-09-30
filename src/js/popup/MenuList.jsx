import React, { Component } from 'react'
import update from 'immutability-helper'
import classNames from 'classnames'

import * as storage from '../storage'

class MenuList extends Component {
  constructor (props) {
    super(props)

    this.state = {
      tempDisableAll: storage.load('tempDisableAll') || false,
      isolateCategory: storage.load('isolateCategory') || '',
      categories: storage.load('categories') || []
    }
  }

  tempDisableAll = () => {
    if (this.state.tempDisableAll) {
      let extensions = storage.load('extensions')
      chrome.runtime.sendMessage({action: 'changeExtensionsStatus', extensions})
      storage.save('tempDisableAll', false)
      this.setState({
        tempDisableAll: false
      })
    } else {
      let extensions = this.props.chromeExtensions
      chrome.runtime.sendMessage({
        action: 'changeExtensionsStatus',
        extensions: extensions.map(ext => ({id: ext.id, enabled: false}))
      })
      this.setState({
        tempDisableAll: true
      })
      storage.save('extensions', extensions)
      storage.save('tempDisableAll', true)
    }
  }

  changeCategoryStatus = (index) => {
    let {categories} = this.state
    let category = categories[index]
    category.enabled = !category.enabled
    let updatedCategories = update(categories, {
      $splice: [[index, 1, category]]
    })
    this.setState({
      categories: updatedCategories
    })
    chrome.runtime.sendMessage({
      action: 'changeExtensionsStatus',
      extensions: category.extensions.map(ext => ({id: ext.id, enabled: category.enabled}))
    })
    storage.save('categories', categories)
  }

  unisolateCategory = () => {
    let {isolateCategory} = this.state
    if (isolateCategory) {
      let {category} = this.findCategory(isolateCategory)
      if (category) {
        let extensions = storage
          .load('extensions')
          .filter(ext => ext.enabled)
          .map(ext => ({id: ext.id, enabled: true}))
        if (category.enabled) {
          extensions = extensions.concat(category.extensions.map(ext => ({id: ext.id, enabled: true})))
        }
        chrome.runtime.sendMessage({
          action: 'changeExtensionsStatus',
          extensions
        })
      }
    }
    this.setState({
      isolateCategory: ''
    })
    storage.save('isolateCategory', '')
  }

  isolateCategory = (index) => {
    let {categories} = this.state
    let category = categories[index]
    let extensions = storage.load('extensions')
    let categoryExtensionIds = category.extensions.map(ext => ext.id)
    let uncontrolledExtensions = extensions.filter(ext => categoryExtensionIds.indexOf(ext.id) < 0)
    chrome.runtime.sendMessage({
      action: 'changeExtensionsStatus',
      extensions: uncontrolledExtensions.map(ext => ({id: ext.id, enabled: false})).concat(categoryExtensionIds.map(id => ({id, enabled: true})))
    })
    this.setState({
      isolateCategory: category.name
    })
    storage.save('isolateCategory', category.name)
    storage.save('extensions', uncontrolledExtensions)
  }

  findCategory (name) {
    let {categories} = this.state
    let index = categories.findIndex(g => g.name === name)
    return { index, category: categories[index] }
  }

  render () {
    let {categories, isolateCategory, tempDisableAll} = this.state
    return (
      <div>
        <div className='menu-list'>
          {
            categories.map((cat, index) => {
              return (
                <div
                  className='menu-item'
                  key={cat.name}
                >
                  <h3 className='menu-title'>{cat.name}</h3>
                  <div className='menu-btn-groups'>
                    <button
                      title='Isolate'
                      onClick={_ => this.isolateCategory(index)}
                      className='menu-btn menu-btn-isolate'
                    >
                      &#9734;
                    </button>
                    <button
                      title='Enable/Disable'
                      className='menu-btn menu-btn-status'
                      onClick={_ => this.changeCategoryStatus(index)}
                      dangerouslySetInnerHTML={{__html: cat.enabled ? '&#9745;' : '&#9744;'}}
                    />
                  </div>
                </div>
              )
            })
          }
        </div>
        <a
          className='footer-btn'
          onClick={this.tempDisableAll}
        >
          Temporary Disabled All
        </a>
        <div
          className={classNames('modal', (isolateCategory || tempDisableAll) && 'modal-show')}
        >
          {
            isolateCategory ? (
              <div className='modal-content'>
                <div className='modal-action modal-action-unisolate' onClick={this.unisolateCategory}>
                  Unisolate
                </div>
              </div>
            ) : (
              <div className='modal-content'>
                <div className='modal-action modal-action-restore' onClick={this.tempDisableAll}>
                  Restore
                </div>
              </div>
            )
          }
        </div>
      </div>
    )
  }
}

export default MenuList
