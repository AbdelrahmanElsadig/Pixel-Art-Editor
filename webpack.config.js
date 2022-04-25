const path = require('path');

module.exports = {
    mode: 'production',
    entry: path.resolve(__dirname,'scripts/app.js'),
    output: {
        path: path.resolve(__dirname),
        filename: 'bundle.js'
    },
    module: {
        rules: [
          {
            test: __dirname +'/scripts/app.js',
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env'],
                plugins: ['@babel/plugin-proposal-object-rest-spread']
              }
            }
          }
        ]
      }
}