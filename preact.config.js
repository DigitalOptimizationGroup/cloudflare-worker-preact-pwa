var WebpackOnBuildPlugin = require("on-build-webpack");
var fs = require("fs");

// rawLoader taken from https://github.com/webpack-contrib/raw-loader/blob/master/index.js
const rawLoader = source =>
    JSON.stringify(source)
        .replace(/\u2028/g, "\\u2028")
        .replace(/\u2029/g, "\\u2029");

export default (config, env, helpers) => {
    config.plugins.push(
        new WebpackOnBuildPlugin(function(stats) {
            // this is the client data
            if (env.ssr === false) {
                // read the service worker because it's not in the output list
                const serviceWorker = fs.readFileSync("./build/sw.js", "utf8");

                // get all the assets that webpack just compiled for the client
                const Assets = stats.compilation.assets;

                // create one file that can be used to import sources so webpack will include in Cloudflare worker bundle
                const requireableSources =
                    Object.keys(Assets)
                        .filter(fileName => {
                            const ext = fileName.split(".").pop();
                            return (
                                (ext === "js" ||
                                    ext === "css" ||
                                    ext === "json") &&
                                // we don't want to serve the push-manifest.json to the public
                                !fileName.includes("push-manifest.json")
                            );
                        })
                        .map(fileName => {
                            return {
                                fileName,
                                source: rawLoader(
                                    // here we pull out the webpack compiled source for ever client side asset
                                    Assets[fileName].source().toString("utf8") // manifest.json is buffer
                                )
                            };
                        })
                        .reduce((acc, resource) => {
                            return `${acc},"/${resource.fileName}": ${
                                resource.source
                            }`;
                        }, `module.exports={"/sw.js": ${rawLoader(serviceWorker)}`) +
                    "}";

                // write out to a file we can use to serve the assets directly from our Cloudflare worker
                fs.writeFileSync(
                    "./build/ssr-build/client-assets.js",
                    requireableSources
                );
            }
        })
    );
};
