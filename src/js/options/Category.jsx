import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import { DragSource, DropTarget } from 'react-dnd'

import CategoryViewer from './CategoryViewer.jsx'
import CategoryEditor from './CategoryEditor.jsx'

const ItemTypes = {
  CATEGORY: 'category'
}

const categorySource = {
  beginDrag (props) {
    return {
      id: props.model.name,
      index: props.index
    }
  }
}

const categoryTarget = {
  hover (props, monitor, component) {
    const dragIndex = monitor.getItem().index
    const hoverIndex = props.index

    if (dragIndex === hoverIndex) {
      return
    }

    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect()

    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

    const clientOffset = monitor.getClientOffset()

    const hoverClientY = clientOffset.y - hoverBoundingRect.top

    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return
    }

    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return
    }

    props.moveCategory(dragIndex, hoverIndex)

    monitor.getItem().index = hoverIndex
  }
}

class Category extends Component {
  constructor (props) {
    super(props)
    this.state = {
      moveable: false
    }
  }

  setMoveable = (moveable) => {
    this.setState({
      moveable
    })
  }

  render () {
    const {
      isDragging,
      connectDragSource,
      connectDropTarget,
      index,
      model,
      canMove,
      chromeExtensions,
      editCategory,
      removeCategory,
      saveCategory
    } = this.props
    const opacity = isDragging ? 0 : 1

    let dropTarget = connectDropTarget(
      <div style={{ opacity }}>
        {model.editing
          ? <CategoryEditor
            model={model}
            chromeExtensions={chromeExtensions}
            saveCategory={category => saveCategory(index, category)}
            removeCategory={_ => removeCategory(index)}
          />
          : <CategoryViewer
            model={model}
            canMove={canMove}
            editCategory={_ => editCategory(index)}
            chromeExtensions={chromeExtensions}
            removeCategory={_ => removeCategory(index)}
            setMoveable={this.setMoveable}
          />
        }
      </div>
    )

    if (this.state.moveable && canMove) {
      return connectDragSource(dropTarget)
    }

    return dropTarget
  }
}

export default DropTarget(ItemTypes.CATEGORY, categoryTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))(DragSource(ItemTypes.CATEGORY, categorySource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))(Category))
