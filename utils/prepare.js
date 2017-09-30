let fileSystem = require('fs-extra')
let path = require('path')

// clean de dist folder
fileSystem.emptyDirSync(path.join(__dirname, '../build'))

require('./generate_manifest')
