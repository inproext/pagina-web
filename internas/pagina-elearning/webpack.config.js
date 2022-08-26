const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const config = {
    mode: 'development',
    watch: true,
    watchOptions: {
        aggregateTimeout: 600,
        ignored: ['node_modules'],
    },
    entry: { app: path.resolve(__dirname, './src/index.js' ) },
    output: {
        filename: '[name]-bundle.js',
        path: path.resolve(__dirname, './dist'),
    },
    module : {
        rules: [
            {
              test: /\.(c|sa|sc)ss$/i,
              use: [
                // Creates `style` nodes from JS strings
                process.env.NODE_ENV !== "production" ? "style-loader" : MiniCSSExtractPlugin.loader,
                // Translates CSS into CommonJS
                "css-loader",
                "sass-loader",
              ],
            },
            {
                test: /\.html$/i,
                loader: "html-loader",
            }
        ]
    },
    devServer: {
        static: {
          directory: path.join(__dirname, '/'),
        },
        liveReload: true,
        compress: false,
        port: 9000,
    },
    plugins: [
        new MiniCSSExtractPlugin({
          filename: "bundle.min.css",
        }),
        new CopyPlugin({
            patterns: [
              {
                from: "src/html/*.html",
                to({ context, absoluteFilename }) {
                  return Promise.resolve("html/[name][ext]");
                },
              },
              {
                from: "src/img/",
                to: "img"
              },
              {
                from: "src/audios/",
                to: "audios"
              },
              {
                from: "src/videos/",
                to: "videos"
              },
              {
                from: "src/pdf/",
                to: "pdf"
              },
              {
                from: "src/fonts/",
                to: "fonts"
              }
            ]
        })
    ]
}

module.exports = config