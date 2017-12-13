const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'common',
    //   filename: 'common.js'
    // }),
    new ExtractTextPlugin({ filename: '[name].css', allChunks: true })
  ],
  entry: {
    index: './src/entry/index.jsx',
    'map-jian-ce-dian': './src/entry/map-jian-ce-dian.jsx'
  },
  output: {
    path: path.join(__dirname, '/public/dist'),
    filename: '[name].js'
  },

  resolve: {
    modules: [path.resolve(__dirname, 'node_modules'), path.join(__dirname, 'src')],
    extensions: ['.web.js', '.jsx', '.js', '.json'],
  },

  module: {
    noParse: [/moment.js/],
    rules: [
      {
        test: /\.jsx$/, exclude: /node_modules/, loader: 'babel-loader',
        options: {
          plugins: [
            'external-helpers', // why not work?
            ["transform-runtime", { polyfill: false }],
            ["import", [{ "style": "css", "libraryName": "antd-mobile" }]]
          ],
          presets: ['es2015', 'stage-0', 'react']
          // presets: [['es2015', { modules: false }], 'stage-0', 'react'] // tree-shaking
        }
      },
      { test: /\.(jpg|png)$/, loader: "url-loader?limit=8192" },
      {
        test: /\.(svg)$/i, loader: 'svg-sprite-loader', include: [
          require.resolve('antd-mobile').replace(/warn\.js$/, ''),  // 1. 属于 antd-mobile 内置 svg 文件
          // path.resolve(__dirname, 'src/my-project-svg-foler'),  // 自己私人的 svg 存放目录
        ]
      },
      // 注意：如下不使用 ExtractTextPlugin 的写法，不能单独 build 出 css 文件
      // { test: /\.less$/i, loaders: ['style-loader', 'css-loader', 'less-loader'] },
      // { test: /\.css$/i, loaders: ['style-loader', 'css-loader'] },
      {
        test: /\.less$/i, use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader', 'less-loader'
          ]
        })
      },
      {
        test: /\.css$/i, use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader'
          ]
        })
      }
    ]
  },
  externals: {
    "react": "React",
    "react-dom": "ReactDOM"
  },
}
