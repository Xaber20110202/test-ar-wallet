const CompressionWebpackPlugin = require('compression-webpack-plugin')
const EncodingPlugin = require('webpack-encoding-plugin')
const isProduction = process.env.NODE_ENV === 'production'
module.exports = {
  // 配置webpack
  // 打包优化参考：https://juejin.cn/post/6844903961154207757
  configureWebpack: config => {
    if (isProduction) {
      config.plugins.push(new EncodingPlugin({
        encoding: 'UTF-8'
      }))

      // 开启gzip压缩
      config.plugins.push(new CompressionWebpackPlugin({
        algorithm: 'gzip',
        test: /\.(js|html|json|css|svg)$/,
        threshold: 10240,
        compressionOptions: { level: 9 },
        minRatio: 0.8
      }))

      config.optimization = {
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: Infinity,
          minSize: 50000,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name (module) {
                // get the name. E.g. node_modules/packageName/not/this/part.js
                // or node_modules/packageName
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1]
                // npm package names are URL-safe, but some servers don't like @ symbols
                return `npm.${packageName.replace('@', '')}`
              }
            }
          }
        }
      }
    }
  }
}
