// basic consts
const path = require('path');
const webpack = require('webpack');

// additional plugins
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const ExtractTextPlugin = require('extract-text-webpack-plugin');

// some variables
var isProduction = (process.env.NODE_ENV === 'production')

module.exports = {
    // Base path for output management
    context: path.resolve(__dirname, 'src'),

    // JavaScript entry point files
    entry: {
        app: [
            './js/index.js',
            './scss/theme.scss',
        ],
    },

    // Webpack output files configuration
    output: {
        filename: 'js/[name].js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '../' // styles 'url()' function fix
    },

    // Enable source maps (only production)
    devtool: (isProduction) ? '' : 'inline-source-map',

    // Webpack Dev server config
    devServer: {
        contentBase: './app'
    },

    // Loaders and modules
    module: {
        rules: [
            // SCSS loader
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    use: [
                        {
                            loader: 'css-loader',
                            options: { sourceMap: true }
                        },
                        {
                            loader: 'postcss-loader',
                            options: { sourceMap: true }
                        },
                        {
                            loader: 'sass-loader',
                            options: { sourceMap: true }
                        },
                    ],
                    fallback: 'style-loader',
                })
            },

            // Image loader (for styles)
            {
                test: /\.(png|jpe?g|gif)$/,
                loaders: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[ext]',
                        },
                    },
                    'img-loader',
                ]
            },

            // SVG converter into 'data:image'
            {
                test: /\.svg$/,
                loader: 'svg-url-loader',
            },

            // Fonts loader
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[ext]',
                        },
                    }
                ],
            },
        ],
    },

    // Additional Webpack plugins list
    plugins: [
        // Webpack modules splitter (if any vendor was used)
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: 'common',
        // }),

        // Dist folder cleaner
        new CleanWebpackPlugin(['dist']),
        
        // Copy images folder
        new CopyWebpackPlugin(
            [
                // from 'src' to 'dist'
                { from: './img', to: 'img' },
            ],
            {
                // exclude SVG graphics (inline)
                ignore: [
                    { glob: 'svg/*' },
                ]
            }
        ),

        // Extract SCSS to CSS plugin
        new ExtractTextPlugin(
            './css/[name].css'
        ),

        // jQuery global plugin
        new webpack.ProvidePlugin({   
            $: 'jquery',
            jQuery: 'jquery',
            jquery: 'jquery',
            'window.jQuery': 'jquery',
            Popper: ['popper.js', 'default'],
        })
    ],
};

// PRODUCTION ONLY
if (isProduction) {
    module.exports.plugins.push(
        // JS tree-shake optimizer
        new UglifyJSPlugin({
            sourceMap: true
        }),
    );

    module.exports.plugins.push(
        // Image optimizer
        new ImageminPlugin({
            test: /\.(jpe?g|png|gif|svg)$/i
        }),
    );

    module.exports.plugins.push(
        // Minimize CSS plugin
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    );
}
