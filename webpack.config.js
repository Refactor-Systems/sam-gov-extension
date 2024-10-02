const path = require("path");

module.exports = {
  mode: "production",
  entry: {
    popup: "./src/popup.ts",
    content: "./src/content.ts",
    background: "./src/background.ts",
  },
  output: {
    filename: "[name].js" /* popup.js, content.js, background.js */,
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  devtool: "source-map",
};
