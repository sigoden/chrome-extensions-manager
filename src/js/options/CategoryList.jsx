import React, { Component } from 'react'
import update from 'immutability-helper'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import Category from './Category'

import * as storage from '../storage'

const CATEGORY_NAME_PREFIX = 'Category'

class CategoryList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isolateCategory: storage.load('isolateCategory') || '',
      categories: storage.load('categories') || [],
      editingTick: 0,
      addedTick: 0
    }
  }

  generateCategoryName = () => {
    let names = this.state.categories.map(cat => cat.name)
    let addedTick = this.state.addedTick
    let candidate
    do {
      addedTick++
      candidate = CATEGORY_NAME_PREFIX + addedTick
    } while (names.indexOf(candidate) > -1)
    return {addedTick, name: candidate}
  }

  addCategory = (index) => {
    let {name, addedTick} = this.generateCategoryName()
    let category = {
      name,
      extensions: [],
      isNew: true,
      editing: true,
      enabled: false
    }
    this.setState({
      addedTick,
      editingTick: this.state.editingTick + 1,
      categories: this.state.categories.concat(category)
    })
  }

  editCategory = (index) => {
    let {categories, editingTick} = this.state
    let category = categories[index]
    category.editing = !category.editing
    this.setState({
      editingTick: editingTick + 1,
      categories: update(categories, {
        $splice: [[index, 1, category]]
      })
    })
  }

  saveCategory = (index, category) => {
    let editingTick = this.state.editingTick - 1
    let categories = update(this.state.categories, {
      $splice: [[index, 1, category]]
    })
    this.setState({editingTick, categories})
    storage.save('categories', categories)
  }

  removeCategory = (index) => {
    let {categories, editingTick, isolateCategory} = this.state
    let category = categories[index]
    if (category.editing) editingTick--
    let updatedCategories = update(categories, {
      $splice: [[index, 1]]
    })
    this.setState({categories: updatedCategories, editingTick})
    if (category.name === isolateCategory) {
      storage.save('isolateCategory', '')
    }
    storage.save('categories', updatedCategories)
  }

  moveCategory = (dragIndex, hoverIndex) => {
    let {categories} = this.state
    const category = categories[dragIndex]
    let updatedCategories = update(categories, {
      $splice: [
        [dragIndex, 1],
        [hoverIndex, 0, category]
      ]
    })
    this.setState({categories: updatedCategories})
    storage.save('categories', updatedCategories)
  }

  render () {
    let {categories, editingTick} = this.state
    return (
      <div className='category-list'>
        {categories.map((category, i) => (
          <Category
            key={category.name}
            id={category.name}
            index={i}
            chromeExtensions={this.props.chromeExtensions.map(ext => Object.assign({}, ext))}
            canMove={editingTick === 0}
            model={category}
            moveCategory={this.moveCategory}
            editCategory={this.editCategory}
            saveCategory={this.saveCategory}
            removeCategory={this.removeCategory}
          />
        ))}
        <div className='category-footerbtns'>
          <button className='category-addbtn' onClick={_ => this.addCategory(categories.length)}>
            Add
          </button>
        </div>
      </div>
    )
  }
}

export default DragDropContext(HTML5Backend)(CategoryList)
