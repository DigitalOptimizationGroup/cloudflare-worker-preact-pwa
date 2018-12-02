const Dotenv = require("dotenv-webpack");

module.exports = {
    entry: { worker: "./worker" },
    target: "webworker",
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            [
                                "@babel/preset-env",
                                {
                                    targets: { chrome: "70" }
                                }
                            ]
                        ],
                        plugins: [
                            [
                                "@babel/plugin-transform-react-jsx",
                                { pragma: "h" }
                            ]
                        ]
                    }
                }
            }
        ]
    },
    plugins: [
        new Dotenv({
            path: ".env"
        })
    ]
};
