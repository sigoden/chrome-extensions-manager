let manifest = require('../src/manifest.json')
let fileSystem = require('fs')
let path = require('path')

manifest.version = process.env.npm_package_version

fileSystem.writeFileSync(
  path.join(__dirname, '../build/manifest.json'),
  JSON.stringify(manifest)
)
