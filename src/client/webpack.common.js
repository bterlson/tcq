var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
function resolve (dir) {
  return path.join(__dirname, '..', dir)
}



function resolve (dir) {

  return path.join(__dirname, '..', dir)

}
module.exports = {
  entry: './src/client/components/app.ts',
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
      },
      {
        test: /\.html$/,
        loader: 'vue-template-loader',
        exclude: resolve('client/index.html'),
        options: {
            scoped: true
        }
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
      template: './src/client/index.html',
      inject: true
    })
  ]
};
