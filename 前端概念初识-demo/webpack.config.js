/**
 * 手写 Webpack 5。不使用 create-react-app、Vite、Umi。
 * 本课要在构建结果里看见的两件事：
 * 1. Less + CSS Modules
 * 2. px2rem，rootValue 为 100（100px → 1rem）
 */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { mockApi } = require('./server/mock');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  return {
    entry: path.resolve(__dirname, 'src/index.tsx'),
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'js/[name].[contenthash:8].js',
      publicPath: '/',
      clean: true,
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        // 演示环境没有私有源。页面仍写本仓那行 import，构建时指到本地替身。
        '@pscae/ps-cae-cloud-ui': path.resolve(__dirname, 'src/vendor/ps-cae-cloud-ui.tsx'),
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
            options: { transpileOnly: false },
          },
        },
        {
          test: /\.css$/,
          use: [isProd ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader'],
        },
        {
          test: /\.less$/,
          exclude: /node_modules/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: {
                  auto: (resourcePath) => resourcePath.endsWith('.less'),
                  localIdentName: '[name]__[local]__[hash:base64:5]',
                  exportLocalsConvention: 'asIs',
                },
                importLoaders: 2,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    ['postcss-pxtorem', { rootValue: 100, propList: ['*'] }],
                  ],
                },
              },
            },
            'less-loader',
          ],
        },
      ],
    },
    // 生产模式默认压缩并缩短局部名字。演示要直接读 dist，所以关掉。
    optimization: {
      minimize: false,
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'public/index.html'),
        minify: false,
      }),
      ...(isProd
        ? [new MiniCssExtractPlugin({ filename: 'css/[name].[contenthash:8].css' })]
        : []),
    ],
    performance: { hints: false },
    devtool: isProd ? false : 'eval-cheap-module-source-map',
    devServer: {
      port: 8080,
      historyApiFallback: true,
      setupMiddlewares: (middlewares) => {
        middlewares.unshift({
          name: 'demo-api',
          middleware: mockApi,
        });
        return middlewares;
      },
    },
  };
};
