# A snapshot based chrome extensions manager

Read this in other languages: [中文文档](./README_zh.md)

## Features

- Easy to enable/disable the extension
- Direct access to the option page of any extension
- Enable/disable all the extensions with one click
- Snapshot Management
  - Create: capture the state of chrome's current extensions as a snapshot, a restore point
  - Apply: choose a snapshot, restore the all extension's disable/enable state to that snapshot
  - Delete: clear the outdated snapshot
  - Undo: undo an accidental applying snapshot

## Background

  In different scene, we need different chrome extensions; When reading, we maybe need the extension to translate, to take a note or to make a share; When writing, When developing the web app, we maybe need the extension like react/vue/redux dev-tools;

  But it's not easy to enable/disable the extension in the chrome, you have to type chrome://extensions in address bar or follow the menus. 

  This extension try to make it easy to enable/disable the extension. What's more, it can take a snapshot which save the state of the chrome extension. For example, you made two snapshot, one for normal using, one for developing; When you want to use chrome to develop something, you apply the developing snapshot, all the extensions about developing is enabled, while the rest is disabled. When you want to exit developing mode, you apply the normal using snapshot, it turn back.

  That's it. Hope it help you.

![demo](./docs/demo.gif)

## Install

 - [Install from chrome web store](https://chrome.google.com/webstore/detail/bcjfhbahclaolcbkdkckdnnenfeakhbk) **Recommend**
 - [install with .crx package manually](https://github.com/sigoden/chrome-extensions-manager/releases/latest)

## Links

 + [Releases](https://github.com/sigoden/netease-music-crx/releases)
 + [Issues or RP](https://github.com/sigoden/netease-music-crx/issues/new)


## License

[GNU General Public License Version 3](https://www.gnu.org/licenses/gpl.html)
