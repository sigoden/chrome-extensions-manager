let webpack = require('webpack')
let path = require('path')
let fileSystem = require('fs')
let env = require('./utils/env')
let HtmlWebpackPlugin = require('html-webpack-plugin')
let WriteFilePlugin = require('write-file-webpack-plugin')
let CopyWebpackPlugin = require('copy-webpack-plugin')

// load the secrets
let alias = {}

let secretsPath = path.join(__dirname, ('secrets.' + env.NODE_ENV + '.js'))

let fileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'eot', 'otf', 'svg', 'ttf', 'woff', 'woff2']

if (fileSystem.existsSync(secretsPath)) {
  alias['secrets'] = secretsPath
}

let options = {
  entry: {
    popup: path.join(__dirname, 'src', 'js', 'popup.js'),
    options: path.join(__dirname, 'src', 'js', 'options.js'),
    background: path.join(__dirname, 'src', 'js', 'background.js')
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
        exclude: /node_modules/
      },
      {
        test: new RegExp('\\.(' + fileExtensions.join('|') + ')$'),
        loader: 'file-loader?name=[name].[ext]',
        exclude: /node_modules/
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    alias: alias,
    extensions: fileExtensions.map(extension => ('.' + extension)).concat(['.jsx', '.js', '.css'])
  },
  plugins: [
    // expose and write the allowed env vars on the compiled bundle
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV)
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'popup.html'),
      filename: 'popup.html',
      chunks: ['popup']
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'options.html'),
      filename: 'options.html',
      chunks: ['options']
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'background.html'),
      filename: 'background.html',
      chunks: ['background']
    }),
    new CopyWebpackPlugin([
      {from: path.join(__dirname, 'src', 'img')}
    ]),
    new WriteFilePlugin()
  ]
}

if (env.NODE_ENV === 'development') {
  options.devtool = 'cheap-module-source-map'
}

module.exports = options
