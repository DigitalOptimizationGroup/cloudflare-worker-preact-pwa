import { h } from "preact"; // eslint-disable-line no-unused-vars
import render from "preact-render-to-string";
import App from "../build/ssr-build/ssr-bundle";
import Assets from "../build/ssr-build/client-assets";

const pollyfillBundleName = Object.keys(Assets).filter(
    key => key.includes("polyfills") && key.includes("js")
)[0];

const mainBundleName = Object.keys(Assets).filter(
    key => key.includes("bundle") && key.includes("js")
)[0];

// can't seem to escape the <\/script> in window.fetch||document.write('<script src="${pollyfillBundleName}"><\/script>')
function renderFullPage(html, preloadedState) {
    return `
    	<body>
            ${html}
            <script>
              window.__PRELOADED_STATE__ = ${JSON.stringify(
                  preloadedState
              ).replace(/</g, "\\u003c")}
            </script>
    		<script defer src="${mainBundleName}"></script>
            <script>
                if(!window.fetch){
                   var script = document.createElement('script');
                   script.setAttribute('type', 'text/javascript');
                   script.setAttribute('src', '${pollyfillBundleName}');
                   document.body.appendChild(script);
                }
            </script>
    	</body>
    </html>
    `;
}

export default async (pathname, writer, encoder) => {
    // mock a network request, this is where we could load any needed async data to populate the
    // server side redux store
    const serverGatheredState = await (() =>
        Promise.resolve({ name: "State rehydrated from the server" }))();

    const html = render(
        <App url={pathname} reduxStateFromServer={serverGatheredState} />
    );

    // stream the body of the page with our SSR results
    writer.write(encoder.encode(renderFullPage(html, serverGatheredState)));

    // await the close of the streaming response
    await write.close();
};
