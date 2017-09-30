chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request)
  switch (request.action) {
    case 'listExtensions':
      chrome.management.getAll(extensions => {
        chrome.management.getSelf(self => {
          let exts = extensions
            .filter(ext => ext.type === 'extension' && ext.id !== self.id)
            .map(ext => {
              let {id, shortName, description, enabled, icons} = ext
              return {id, name: shortName, description, enabled, icon: icons[icons.length - 1].url}
            })
          sendResponse(exts)
        })
      })
      return true
    case 'changeExtensionsStatus':
      let {extensions} = request
      extensions.map(ext => {
        console.log(ext.id, ext.enabled)
        chrome.management.setEnabled(ext.id, ext.enabled)
      })
      return true
  }
})
