import ssrRender from "./ssr-render";
import Assets from "../build/ssr-build/client-assets";
import PushManifest from "../build/push-manifest.json";

addEventListener("fetch", event => {
    event.respondWith(handleRequest(event));
});

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
                    : // otherwise it's to pull the currect assets out of our push-manifest and we give just /profile
                      "/profile"
                : "/404";
};

// would be super interesting to try streaming && see if it makes a difference on the low end devices
async function handleRequest(event) {
    const request = event.request;
    const { pathname } = new URL(request.url);

    if (
        pathname.includes(".js") ||
        pathname.includes(".css") ||
        pathname.includes(".json") ||
        pathname.includes("favicon.ico") ||
        pathname.includes("assets")
    ) {
        if (pathname.includes("/assets") || pathname.includes("favicon.ico")) {
            // fetch from s3
            return fetch(
                `${process.env.STATIC_ASSETS_BASE_URL}${pathname}`,
                request
            );
        } else if (Assets[pathname]) {
            // fetch from this worker for ultra-low latency, even on "cold starts" the bundles
            // come really fast because the worker is already awake from the request
            // coming from S3, if they are not in the Cloudflare cache it could be 800-1,000ms vs 50ms
            return new Response(Assets[pathname], {
                status: 200,
                headers: new Headers({
                    "Content-Type": pathname.includes(".js")
                        ? "application/javascript"
                        : "text/css",
                    "Cache-Control": pathname.includes("sw.js")
                        ? // don't cache the service worker
                          "private, no-cache"
                        : // cache static assets
                          "public, max-age=31536000"
                })
            });
        } else {
            return new Response("404 - Resource not found.", {
                status: 404,
                headers: new Headers({
                    "Content-Type": "text/plain",
                    "Cache-Control": "public, no-cache"
                })
            });
        }
    } else if (pathname === "/robots.txt") {
        return new Response(`User-agent: * Disallow:`, {
            status: 200,
            headers: new Headers({
                "Content-Type": "text/plain"
            })
        });
    } else {
        // this generates the path we need to pull out the URL for our push assets
        const manifestUrl = simpleRouterHack(pathname);

        // get the assets that are needed on this route or a 404
        const routeManifest = PushManifest[manifestUrl]
            ? // if we have a route, let's use that
              { manifest: PushManifest[manifestUrl], status: 200 }
            : // if we don't have a route, we use the 404 js & css & return our custom 404 page
              { manifest: PushManifest["/404"], status: 404 };

        let { readable, writable } = new TransformStream();

        let writer = writable.getWriter();

        var encoder = new TextEncoder();

        const pageHead = `<!DOCTYPE html>
        <html lang="en">
        	<head>
        		<meta charset="utf-8">
                <title>Digital Optimization Group - Cloudflare SSR Demo</title>
        		<meta name="viewport" content="width=device-width,initial-scale=1">
        		<meta name="mobile-web-app-capable" content="yes">
        		<meta name="apple-mobile-web-app-capable" content="yes">
                <meta name="Description" content="An example of SSR Preact with a Cloudflare Worker script, server push, and streaming response.">
        		<link rel="manifest" href="/manifest.json">
        		<meta name="theme-color" content="red">

                ${Object.keys(routeManifest.manifest)
                    .filter(
                        resource =>
                            routeManifest.manifest[resource].type === "style"
                    )
                    .map(
                        bundleName =>
                            // add css links for bundles relevant to this route
                            `<link href="/${bundleName}" rel="stylesheet">`
                    )
                    .join("")}
        	</head>`;

        // write & stream the page head pretty much immediately and then move on to SSR the page
        writer.write(encoder.encode(pageHead));

        // generate the requestUrl needed by our preact-router
        const requestUrl = simpleRouterHack(pathname, true);

        // note as per the Cloudflare documentation we do NOT await this function, even though it is async
        ssrRender(requestUrl, writer, encoder);

        return new Response(readable, {
            // serve 200 or 404
            status: routeManifest.status,
            headers: new Headers({
                "Content-Type": "text/html",
                Link: Object.keys(routeManifest.manifest)
                    .map(
                        resource =>
                            // we set the headers here so Cloudflare will server push all the assets that this page will request
                            `<${"/" + resource}>; rel=preload; as=${
                                routeManifest.manifest[resource].type
                            }`
                    )
                    .join(", ")
            })
        });
    }
}

// if you want to embed the css in the route
// ${CssBundles.filter(
//     bundleName =>
//         Object.keys(routeManifest).indexOf(bundleName) > -1
// )
//     .map(
//         // should check the push-manifest to see what we need to load on the given route
//         bundleName =>
//             `<link href="/static/${bundleName}" rel="stylesheet">`
//     )
//     .join("")}
