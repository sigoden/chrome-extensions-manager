#!/usr/bin/env node

require('crx')

const fs = require('fs')
const PEM_FILE = process.env.PEM_FILE || './build.pem'
const path = require('path')
const appDir = path.resolve(__dirname, '..')
const buildDir = path.join(appDir, 'build')
const distDir = path.join(appDir, 'dist')
const cp = require('child_process')

if (!fs.existsSync(PEM_FILE)) {
  console.error(`Invalid pem files: ${PEM_FILE}`)
  process.exit(1)
}

let manifestPath = path.join(buildDir, 'manifest.json')
let manifestContent = fs.readFileSync(manifestPath, {encoding: 'utf8'})
let manifest = JSON.parse(manifestContent)
let outputFile = path.join(distDir, `chrome-extensions-manager_v${manifest.version}`)

let cmd = `npx crx pack ${buildDir} -o ${outputFile}.crx --zip-output ${outputFile}.zip -p ${PEM_FILE}`
cp.exec(cmd, function (err, stdout, stderr) {
  if (err) throw err
  if (stderr) {
    console.error(stdout)
  }
  manifest.update_url = 'http://localhost:3000/update2/crx'
  fs.writeFileSync(manifestPath, JSON.stringify(manifest))
  cmd = `npx crx pack ${buildDir} -o ${outputFile}.crx -p ${PEM_FILE}`
  cp.exec(cmd, function (err, stdout, stderr) {
    fs.writeFileSync(manifestPath, manifestContent)
    if (err) throw err
    if (stderr) {
      console.error(stdout)
    }
  })
})
