# outer-script-html-webpack-plugin
Inject js into html without webpack compiler.

# Install
```sh
$ npm install outer-script-html-webpack-plugin --save-dev
```

# Usage
webpack.config.js
```js
const HtmlWebpackPlugin = require('html-webpack-plugin')
const OuterScriptPlugin = require('outer-script-html-webpack-plugin')

module.exports = {
  ...
  output: {
    publicPath: '/public/'
  },
  plugins: [
    ...
    new OuterScriptPlugin(),
    new HtmlWebpackPlugin({
      ...
      outerScripts:[ 
        {
          chunk: '/absolute/path/to/a.js',
          filename: 'js/a.js'
        },
        {
          chunk: '/absolute/path/to/b.[chunkhash].js',
          filename: 'js/b.[chunkhash].js'
        }
      ]
    })
  ]
}
```
ouput html:
```html
  ...
  <script type="text/javascript" src="/public/js/a.js">
  <script type="text/javascript" src="/public/js/b.c57c86c1b956c3a01175.js">
  // outer scripts will be injected before other scripts
  <script type="text/javascript" src="/public/others.js">
  ...
```