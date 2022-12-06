const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: './src/app.ts',
    devtool: 'inline-source-map',
    mode: "development",
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
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./index.html",
        }),
        new CopyPlugin({
            patterns: [
                {from: "templates", to: "templates"},
                {from: "styles", to: "styles"},
                {from: "static/fonts", to: "fonts"},
                {from: "static/images", to: "images"},
                {from: "config", to: "config"},
                {from: "node_modules/bootstrap/dist/css", to: "libs/bootstrap/css"},
                {from: "node_modules/bootstrap/dist/js", to: "libs/bootstrap/js"},
                {from: "node_modules/jquery/dist", to: "libs/jquery"},
                {from: "node_modules/@popperjs/core/dist/umd", to: "libs/@popperjs"},
                {from: "node_modules/bootstrap-datepicker/dist/js", to: "libs/datepicker/js"},
                {from: "node_modules/bootstrap-datepicker/dist/locales", to: "libs/datepicker/locales"},
                {from: "node_modules/bootstrap-datepicker/dist/css", to: "libs/datepicker/css"},
            ],
        }),
    ],
    devServer: {
        static: ".dist",
        compress: true,
        port: 9000,
    },
};