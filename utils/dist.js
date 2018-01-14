#!/usr/bin/env node

require('crx')

const fs = require('fs')
const PEM_FILE = process.env.PEM_FILE || './build.pem'
const path = require('path')
const appDir = path.resolve(__dirname, '..')
const pkg = require(path.join(appDir, 'package.json'))
const buildDir = path.join(appDir, 'build')
const distDir = path.join(appDir, 'dist')
const outputFile = path.join(distDir, `chrome-extensions-manager_v${pkg.version}`)
const cp = require('child_process')

if (!fs.existsSync(PEM_FILE)) {
  console.error(`Invalid pem files: ${PEM_FILE}`)
  process.exit(1)
}

const cmd = `npx crx pack ${buildDir} -o ${outputFile}.crx --zip-output ${outputFile}.zip -p ${PEM_FILE}`
cp.exec(cmd, function (err, stdout, stderr) {
  if (err) throw err
  if (stderr) {
    console.error(stdout)
  }
  if (stdout) {
    console.log(stdout)
  }
})
