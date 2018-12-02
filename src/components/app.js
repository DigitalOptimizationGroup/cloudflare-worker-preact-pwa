import { h, Component } from "preact";
import { Router } from "preact-router";

import Header from "./header";
import Home from "../routes/home";
import Profile from "../routes/profile";
import NotFound from "../routes/404";

export default class App extends Component {
    handleRoute = e => {
        // awaiting this issue: https://github.com/developit/preact-cli/issues/677
        // wrapping in setTimeout is a temporary solution
        setTimeout(
            () =>
                this.setState({
                    currentUrl: this.props.url || e.url
                }),
            0
        );
    };

    render(props) {
        return (
            <div id="app">
                <Header selectedRoute={this.state.currentUrl} />
                <Router url={this.props.url} onChange={this.handleRoute}>
                    <Home path="/" />
                    <Profile path="/profile/" user="me" />
                    <Profile path="/profile/:user" />
                    <NotFound default />
                </Router>
            </div>
        );
    }
}
