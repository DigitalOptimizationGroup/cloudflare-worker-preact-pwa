import "./style";
import App from "./components/app";

import store from "./store";
import { Provider } from "preact-redux";

export default ({ reduxStateFromServer, url }) => {
    const initialState =
        typeof window !== "undefined"
            ? // we are on the client let's rehydrate the state from the server, if available
              window.__PRELOADED_STATE__ || {
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
