module.exports = {
    watch: true,
    entry: {
        MCU: "./src/MCU.ts",
        client: "./src/client.ts"
    },
    output: {
        path: `${__dirname}/public/js`,
        filename: "[name]Bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
            }
        ]
    },
    // import文で.tsファイルを解決する　
    resolve: {
        extensions: [
            ".ts"
        ]
    },
    // ソースマップを有効にする
    devtool: "sorce-map"
};
