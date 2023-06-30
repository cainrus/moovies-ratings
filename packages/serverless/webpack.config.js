const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
module.exports = {
  entry: path.resolve(__dirname, './src/index.ts'),
  target: 'node',
  node: false,
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    clean: true,
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        minify: TerserPlugin.swcMinify,
        // `terserOptions` options will be passed to `swc` (`@swc/core`)
        // Link to options - https://swc.rs/docs/config-js-minify
        terserOptions: {
          ecma: 2020,
          mangle: true,
          compress: true
        },
      }),
    ],
    sideEffects: true,
    usedExports: true,
  },
  module: {
    rules: [
      {
        test: /\.(t|j)s$/,
        loader: 'swc-loader',
        options: {
          env:{
            targets: {
              node: "14"
            }
          },

          jsc: {
            "externalHelpers": false,

            "loose": true,

            parser: {
              syntax: 'typescript',
              "jsx": false,
              preserveAllComments: true,
            },
            target: `es2020`,
            keepClassNames: true,
            transform: {
              optimizer: {
                simplify: true,
              }
            },
            minify: {
              mangle: true,
              compress: {
                pure_funcs: ['assert'],
              }
            }
          },
          module: {
            "type": "es6",
          }

        },
      },
    ],
  },
}
