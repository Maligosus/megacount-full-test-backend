/*eslint-disable*/
const path=require('path');
const nodeExternals=require('webpack-node-externals');
const NodemonPlugin=require('nodemon-webpack-plugin');


module.exports={
      entry:{
          main:"./src/index.tsx"
        },
        externals:[nodeExternals()],
        mode:'development',
        module: {
            rules: [
              {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
              },
            ],
          },
          resolve: {
            extensions: [ '.tsx', '.ts', '.js' ],
          },
          output: {
            filename: 'main.js',
            path: path.resolve(__dirname, 'dist'),
            publicPath: "/"
          },
          plugins:[
            new NodemonPlugin({
                script: './dist/main.js',
                watch: path.resolve('./dist'),
                ext: 'js,ts,json',
                delay:"300"
            })
          ]
}
/*eslint-disable*/