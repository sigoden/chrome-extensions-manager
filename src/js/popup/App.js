import React, { Component } from 'react'
import { observer } from 'mobx-react'
import './App.css'
import classNames from 'classnames'

function openChromePage (url) {
  chrome.tabs.create({url})
}

const Extension = (props) => {
  let {ext, store, enabled} = props
  return (
    <li
      className={classNames('extension', {'extension-disabled': !enabled})}
      onClick={_ => store.updateExtensionsState({indexes: [ext.id], state: !enabled})}
    >
      <img className='extension-icon' src={ext.icon} />
      <p className='extension-name truncate'>{ext.name}</p>
      {ext.optionsUrl &&
          (
            <a
              className={classNames('extension-optbtn btn', {'btn-disabled': !enabled})}
              title={i18n('popup_btn_title_opturl')}
              onClick={e => { e.stopPropagation(); openChromePage(ext.optionsUrl) }}
            >
              <i className='icon icon-option' />
            </a>
          )
      }
    </li>
  )
}

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showForm: false,
      name: '',
    }
  }

  createSnapshot () {
    let {upsertSnapshot, currentSnapshot: {enabled, disabled}} = this.props.store
    if (!this.state.name) return false
    upsertSnapshot({
      snapshot: {
        name: this.state.name,
        enabled,
        disabled,
      },
    }).then(() => {
      this.state = {
        showForm: false,
        name: '',
      }
    })
  }

  render () {
    let store = this.props.store
    let {
      extensionHashs,
      currentSnapshot,
      snapshotStore,
      removeSnapshot,
      applySnapshot,
      disabledMe,
    } = store
    return (
      <div className='app'>
        <div className='toolbar'>
          <a className='btn' onClick={_ => disabledMe()}>
            {i18n('popup_btn_name_disable_me')}
          </a>
          <a onClick={_ => openChromePage('chrome://extensions')} className='btn'>
            {i18n('popup_btn_name_more')}
          </a>
        </div>
        <section className='card card-snapshot'>
          {this.state.showForm
            ? (
              <div className='card-title'>
                <form className='new-form'>
                  <input placeholder={i18n('popup_input_placeholder_snapshot_name')} autoFocus type='text' onChange={e => this.setState({name: e.target.value})} />
                  <div className='new-form-btns'>
                    <button className='card-title-btn btn' title={i18n('popup_btn_title_submit')} onClick={_ => this.createSnapshot()}>
                      <i className='icon icon-submit' />
                    </button>
                    <button className='card-title-btn btn' title={i18n('popup_btn_title_cancel')} onClick={e => { e.preventDefault(); this.setState({showForm: false, name: ''}) }}>
                      <i className='icon icon-cancel' />
                    </button>
                  </div>
                </form>
              </div>
            )
            : (
              <div className='card-title'>
                <h2 className='card-title-text'>{i18n('popup_snapshot_title')}</h2>
                <button className='card-title-btn btn' title={i18n('popup_btn_title_add')} onClick={_ => { this.setState({showForm: true}) }}>
                  <i className='icon icon-add' />
                </button>
              </div>
            )
          }
          <ul className='snapshot-list'>
            {snapshotStore.filter(snapshot => {
              if (snapshot.builtin && (snapshot.enabled.length + snapshot.disabled.length === 0)) {
                return false
              }
              return true
            }).map(snapshot => {
              let {name, title, builtin} = snapshot
              return (
                <li className='snapshot' key={name}>
                  <p className='snapshot-name truncate'>{title || name}</p>
                  <div className='snapshot-btns'>
                    <button className='btn' onClick={_ => applySnapshot({name})}>
                      <i className='icon icon-apply' />
                    </button>
                    <button className={classNames('btn', {'btn-disabled': builtin})} onClick={_ => removeSnapshot({name})}>
                      <i className='icon icon-del' />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
        <section className='card card-extension'>
          <h2 className='card-title'>{i18n('popup_extension_title')}</h2>
          <ul className='extension-list'>
            {currentSnapshot.enabled.map(id => {
              let ext = extensionHashs[id]
              return (<Extension enabled store={store} key={id} ext={ext} />)
            })}
            {currentSnapshot.disabled.map(id => {
              let ext = extensionHashs[id]
              return (<Extension enabled={false} store={store} key={id} ext={ext} />)
            })}
          </ul>
        </section>
      </div>
    )
  }
}

export default observer(App)
