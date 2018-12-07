const fse = require('fs-extra')
const hasha = require('hasha')

module.exports = class Plugin {
  apply (compiler) {
    compiler.plugin('compilation', (compilation, callback) => {

      compilation.plugin('html-webpack-plugin-before-html-processing', (htmlPluginData, callback) => {
        let outerScripts = htmlPluginData.plugin.options.outerScripts
        if (!isArray(outerScripts)  ) {
          return callback()
        }
        outerScripts = outerScripts.filter((option) => {
            return typeof option === 'object'
        })
        if (!outerScripts.length) {
          return callback()
        }
        const tasks = []
        outerScripts.forEach((option) => {
          tasks.push(readFile(option.chunk))
        })
        runTasks(tasks)
          .then((fileStrings) => {
            const assets = outerScripts.map((el, index) => {
              const { chunk, filename } = el
              const content = fileStrings[index]
              return {
                chunk,
                content,
                filename: generateHash(content, filename)
              }
            })
            appendAssetsToWebpack(assets, compilation)
            injectAssetsToHTML(assets, htmlPluginData, compiler.options.output.publicPath)
            callback(null, {})
          })
          .catch((e) => {
            throw new Error(`outer-script-html-webpack-plugin: ${e.message}`)
          })
      })
    })
  }
} 

function injectAssetsToHTML (assets, htmlPluginData, publicPath) {
  const files = assets.map((el) => {
    return `${publicPath}${el.filename}`
  })
  htmlPluginData.assets.js.unshift(...files)
}

function  hash (source) {
  return hasha(source, { 
    algorithm: 'md5'
  }).substring(0, 20)
}

function generateHash (content, filename) {
  return filename.replace(/\[chunkhash\]/g, hash(content))
}

function appendAssetsToWebpack (assets, compilation) {
  assets.forEach((el) => {
    compilation.assets[el.filename] = {
      source: () => {
        return el.content
      },
      size: () => {
        return el.content.size
      }
    }
  })
}

function runTasks (tasks) {
  return Promise.all(tasks)
}

function readFile (path) {
  return fse.readFile(path, 'utf-8')
}

function isArray(a) {
  return Object.prototype.toString.call(a) === '[object Array]'
}