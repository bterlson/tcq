var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/client/app.ts',
  output: {
    path: path.resolve(__dirname, '../../dist/client/'),
    filename: 'build.js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      'socket.io-client': 'socket.io-client/dist/socket.io.slim.js'
    }
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },
  performance: {
    hints: false
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/client/index.html'
    })
  ]
};
