var webpack = require('webpack')
var merge = require('webpack-merge')
var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

const baseConfig = require('./webpack.base.conf')

module.exports = merge(baseConfig,{
  mode: 'development',
  optimization: {
    noEmitOnErrors: true,
  },
  devtool: '#cheap-module-eval-source-map',
  performance: {
    hints: false
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new FriendlyErrorsPlugin()
  ]
})
