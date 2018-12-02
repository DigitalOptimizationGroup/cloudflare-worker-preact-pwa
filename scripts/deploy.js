// adapted from https://github.com/cloudflare/workers-react-example/blob/master/scripts/deploy.js
require("dotenv").config({ path: ".env" });
const fs = require("fs");
const util = require("util");
const fetch = require("node-fetch");
const readFile = util.promisify(fs.readFile);

async function deploy(script) {
    let resp = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${
            process.env.ZONE_ID
        }/workers/script`,
        {
            method: "PUT",
            headers: {
                "cache-control": "no-cache",
                "content-type": "application/javascript",
                "X-Auth-Email": process.env.ACCOUNT_EMAIL,
                "X-Auth-Key": process.env.ACCOUNT_AUTH_KEY
            },
            body: script
        }
    );
    let data = await resp.json();
    return data;
}

readFile("dist/worker.js", "utf8").then(data => {
    deploy(data).then(d => {
        if (d.success) {
            console.log("Worker uploaded");
        } else {
            console.log(d.errors);
        }
    });
});
