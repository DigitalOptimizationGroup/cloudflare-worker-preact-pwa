[![Lighthouse score: 100/100](https://lighthouse-badge.appspot.com/?score=100)](https://www.webpagetest.org/lighthouse.php?test=181128_9K_916ea978dd63605aa04610aa64ec8f30&run=3)

### Cloudflare worker Preact Progressive Web App

This example app deploys the awesome Progressive Web App created by [`preact-cli` ](https://github.com/developit/preact-cli) to a Cloudflare worker. It also implements dynamic server side rendering using a Redux store. It uses the default Material Design `preact-cli` template, with the addition of Redux.

The app is **interactive in 1.2 seconds on mobile 3G** as tested at webpagetest.org using Chrome on a Motorola G (gen 4) tested from Dulles, Virginia on a 1.6 Mbps 3G connection with 300ms of latency. [Check out the results here.](https://www.webpagetest.org/lighthouse.php?test=181128_9K_916ea978dd63605aa04610aa64ec8f30&run=3)

View the demo at: https://growthcloud.io

### The app features

-   **Interactive in 1.2 seconds on mobile 3G**
-   Cost only $5.00 per month to run and that includes a free Cloudflare SSL certificate and 5,000,000 requests
-   **Server push** of static assets
-   Runtime **server side rendering** with Redux data store and client hydration of the server state
-   **Streaming responses** with Cloudflare (head is sent before starting SSR). [View the Cloudflare streaming docs](https://developers.cloudflare.com/workers/recipes/streaming-responses/)
-   Embedded critical `js` and `css` assets right in the worker provide consistent ultra-low latency serving of static assets. Even when the worker is 'cold' and time to first byte is slower, the server push of `js` and `css` is pretty consistent because they are coming out of the now running worker (with server push). We've noticed 40-50ms times for our bundles (on desktop) regardless if the worker was hot or cold.
-   Proxy non-critical assets (like icons) to an s3 bucket
-   All the great stuff of an **app created with `preact-cli@3.0.0-next.14`**
    -   100/100 Lighthouse score ([as audited in production on Cloudflare worker](https://www.webpagetest.org/lighthouse.php?test=181128_9K_916ea978dd63605aa04610aa64ec8f30&run=3))
    -   Code splitting
    -   Service Worker and **offline functionality**
    -   You can install it on the home screen of your mobile device (tested on Android/Chrome)

### Further work & community

Feel free to open an issue with any comments, questions, or feedback! This is just a proof of concept to see that it could really be done. A lot still needs to be done to clean it up! If you're interested in collaborating on this, open an issue and let us know!

### Basic guide to running this

If you want to deploy your own PWA onto a Cloudflare worker, here are some basic instructions (also as a reminder to myself).

#### Setting up a worker & DNS

[Worker documentation](https://developers.cloudflare.com/workers/).

You will need to point your nameservers at Cloudflare's DNS. It seems this has to be the root domain, it's a shame we cannot delegate a subdomain to Cloudflare DNS. Once that is done it seems that you also need to create some root record for your domain within the Cloudflare DNS. I just pointed a CNAME at our S3 bucket. Maybe this is not needed, but it seemed to be.

You then need to enable workers for your domain. It costs $5.00 per month and that covers the first 5,000,000 requests.

#### Deploying the worker

It's pretty easy to use `curl` to deploy the worker and it's very fast. Also it seems most of the time the live worker is updated almost immediately. Although sometimes it can take a little time to see the new version (very rarely more than 30 seconds).

There is a simple `Makefile` in this repo with a couple commands to build and deploy. If you want to use it you'll need to get your Cloudflare keys and add them to a `.env` file. [The Cloudflare docs for deploying and finding your keys](https://developers.cloudflare.com/workers/api/).

```
# save this to a .env file
ACCOUNT_AUTH_KEY=
ZONE_ID=
ACCOUNT_EMAIL=

STATIC_ASSETS_BASE_URL=we-use-an-s3-bucket-here
```

After that you can run `make cf` to build and deploy everything. Have a look at the `Makefile` if you want to see the commands.

#### Redux & SSR

We add redux in the `index.js` file of the default app created by `preact-cli`. For server side rendering we accept two props `reduxStateFromServer` and `url`.

The default `index.js`

```js
import "./style";
import App from "./components/app";

export default App;
```

Adding Redux to [`index.js`](src/index.js). Note that `Provider` comes from `preact-redux`.

```js
import "./style";
import App from "./components/app";
import store from "./store";
import { Provider } from "preact-redux";

export default ({ reduxStateFromServer, url }) => {
    const initialState =
        typeof window !== "undefined"
            ? // we are on the client let's rehydrate the state from the server, if available
              window.__PRELOADED_STATE__ || {
                  // if all goes well, we should never see this state
                  name: "Default name from client side"
              }
            : // we are on the server
              reduxStateFromServer;
    return (
        <Provider store={store(initialState)}>
            <App url={url} />
        </Provider>
    );
};
```

Then for server side rendering we import the ssr bundle created by `preact-cli` and pass it the needed props. [See the whole file here.](worker/ssr-render.js)

```js
import { h } from "preact"; // eslint-disable-line no-unused-vars
import render from "preact-render-to-string";
import App from "../build/ssr-build/ssr-bundle";

// ... //
const serverGatheredState = await (() =>
    Promise.resolve({ name: "State rehydrated from the server" }))();

const html = render(
    <App url={pathname} reduxStateFromServer={serverGatheredState} />
);
// ... //
```

#### Creating `preact.config.js`

We utilize `preact.config.js` to modify the default `webpack` config inside the `preact-cli`. We use the `on-build-webpack` plugin to create the files needed for our worker so that we can embed and utilize server push for critical `js` and `css` assets.

#### Non-critical assets (like icons)

We serve non-critical assets from an s3 bucket. This url can be set in the `.env` file as `STATIC_ASSETS_BASE_URL` and it will be included into the worker with `dotenv-webpack`. See [`webpack.config.worker.js`](webpack.config.worker.js). We've used s3, but it doesn't need to be s3 specifically.

#### Multiple route caching in our Service Worker

This feels like a bit of a hack and a deeper customization of the service worker would be more appropriate, but we haven't done that yet.

In any case to get the Service Worker to cache multiple routes, we updated the `preact-cli` build command in `package.json` and added a `prerender-urls.json` file.

The `prerender-urls.json` file.

```js
[{ url: "/" }, { url: "/profile" }];
```

Update `package.json`

```js
{
    "build": "preact build --prerender --prerenderUrls src/prerender-urls.json",
}
```

Note that this generates files at `build/index.html` and `build/profile/index.html`. We never use these generated files and when the Service Worker requests them we return a runtime generated response using our redux store and SSR. In this way we can provide a unique offline experience for each user depending on the data they load.

To complete this temporary hack we also create a little mapping in our worker to get SSR to return the correct pages.

```js
const simpleRouterHack = (pathname, ssr) => {
    return pathname === "/index.html" || pathname === "/"
        ? "/"
        : pathname === "/profile" ||
          pathname === "/profile/" ||
          pathname === "/profile/index.html"
            ? "/profile"
            : // a route like /profile/:username/extra-field should be a 404
              pathname.includes("/profile") && !pathname.split("/")[3]
                ? // if this is for ssr then we give the full pathname
                  ssr
                    ? pathname
                    : // otherwise it's to pull the currect assets out of our
                      // push-manifest and we give just /profile
                      "/profile"
                : "/404";
};
```

#### Double rendering of async components

We had some issues with seeing double rendering of async components and it seems to come from calling setState() when the component first renders. There is an open issue here: https://github.com/developit/preact-cli/issues/677

### Areas we still investigating

-   Routes like `/profile` vs `/profile/` and `/profile/:user` flicker from the home route to the correct route because the service worker doesn't understand them. The `/profile/` does not flicker. Would be nice to make these work without the flickering.
-   We'd like to further clean up the `preact.config.js` plugin to reduce data manipulation in the function. For example `const mainBundleName = Object.keys(Assets).filter( key => key.includes("bundle") && key.includes("js") )[0];` should be done in the plugin. Also this could be made as a separate plugin and more easily installed.
-   Routing / 404 pages / serving assets is just a hack at the moment and would need a more robust solution for a real app of any complexity. Also all 404 routes flicker with the homepage if it is not a first time request or a hard refresh (service worker can't seem to tell it should be a 404).
-   Would be nice to make a local dev version of the worker so that we could test locally. At least enough to test the app.
