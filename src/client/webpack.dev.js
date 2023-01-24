const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

// Read up more at
//  - https://webpack.js.org/guides/production/
//  - https://vue-loader.vuejs.org/en/workflow/production.html
//
module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
});
