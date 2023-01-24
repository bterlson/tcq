var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

function resolve(dir) {
  return path.join(__dirname, '..', dir);
}

module.exports = {
  entry: {
    app: './src/client/pages/meeting/meeting.ts',
    home: './src/client/pages/home/home.ts',
    new: './src/client/pages/new/new.ts'
  },
  output: {
    path: path.resolve(__dirname, '../../dist/client/'),
    filename: '[name].build.js',
    publicPath: '/'
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
        exclude: [
          resolve('client/pages/meeting/meeting.html'),
          resolve('client/pages/home/home.html'),
          resolve('client/pages/new/new.html')
        ],
        options: {
          scoped: true
        }
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
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
      filename: './meeting.html',
      chunks: ['common', 'app'],
      template: './src/client/pages/meeting/meeting.html'
    }),
    new HtmlWebpackPlugin({
      filename: './new.html',
      chunks: ['common', 'new'],
      template: './src/client/pages/new/new.html'
    }),
    new HtmlWebpackPlugin({
      filename: './home.html',
      chunks: ['common', 'home'],
      inject: 'head',
      template: './src/client/pages/home/home.html'
    }),
    new MiniCssExtractPlugin(),
  ],
};
