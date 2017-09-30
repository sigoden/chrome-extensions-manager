## 目标

对 chrome 插件编组，统一管理

## 背景

开发者在 Chrome 浏览器中使用了大量 chrome 插件，有些只需要在特定场景下开启，有些希望在特定场景下关闭。比如在正常浏览页面时，希望关闭 Redux Devtools、React Developer Tools 之类的工具，但是在调试代码时，由希望关闭 Vimium，TransOver 之类的工具，它们对页面有嵌入，干扰调试。我们需要基于当前环境批量启用或禁用插件。对我个人来说，我可能将 Vimium, TransOve，Proxy SwitchyOmega 归为“Daily”组，将 Redux Devtools，React Developer Tools 归为“React”组，平时浏览页面时开启“Daily”组，在进行 React 开发时开启“React”组

## 实现

- 架构: 通过 Chrome 插件实现需求
    - background.js 与 chrome api 交互
    - options.html 处理界面和逻辑

- 技术栈: ValliaJS

## 参考

Disable Extensions Temporarily
http://farhadi.ir/projects/html5sortable/

## 需求

- 获取所有插件
- 对插件进行编组
    - 新建组
    - 删除组
    - 重命名组
    - 删除组中插件
    - 向组中添加插件
- 启用/关闭组
- 独占组
- 设置存储在 localStorage，后期可能使用 chrome.storage 存储
- 临时禁用所有插件


## 资源

- id: chrome-extensions-manager
- name: Extensions Manager
- logo: **LINK**

## UI

**LINK**
