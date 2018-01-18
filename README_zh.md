# 基于快照的 Chrome 扩展应用管理器

## 特点

- 直观的启用/禁用扩展
- 便捷的跳转到扩展选项设置页
- 一键启用/禁用所有扩展
- 快照管理
  - 生成: 抓取浏览器扩展的当前启用/禁用状态生成快照
  - 应用: 一键还原浏览器的扩展状态到快照里记录的状态
  - 删除: 清理无效的快照
  - 还原: 如果您错误的应用了快照，可以恢复

## 背景

  使用 Chrome 过程中，针对不同的场景会开启不同的扩展程序。例如正常浏览网页时会开启一些翻译，收藏分享，代理之类的插件；开发调试时又会把这些全部关掉，而启用一些像 Recat, Redux 之类的开发工具类插件，有些时候如性能测试时甚至还禁用所有插件。而 Chrome 中关闭/开启插件却相当繁琐。所以我开发了这款插件。

  它除了让插件的开启/关闭变得更容易外，还提供了快照功能。它能以快照的形式记录您浏览网页的时的插件状态，您 web 开发时的插件状态，在您准备从一个状态切换到另一个状态的时候，一键将所有的插件状态切换到您期望的状态。

![demo](./docs/demo.gif)

## 安装

 - 在 [Chrome 网上应用店](https://chrome.google.com/webstore/detail/bcjfhbahclaolcbkdkckdnnenfeakhbk)安装
 - [下载 .crx 安装包](https://github.com/sigoden/chrome-extensions-manager/releases/latest)手动安装

## 相关链接

 + [发布日志](https://github.com/sigoden/netease-music-crx/releases)
 + [报告问题或提议新功能](https://github.com/sigoden/netease-music-crx/issues/new)


## 许可

[GNU General Public License Version 3](https://www.gnu.org/licenses/gpl.html)