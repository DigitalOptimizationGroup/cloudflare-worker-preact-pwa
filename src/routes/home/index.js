import { h, Component } from "preact";
import Card from "preact-material-components/Card";
import "preact-material-components/Card/style.css";
import "preact-material-components/Button/style.css";
import style from "./style";
import { connect } from "preact-redux";

class Home extends Component {
    render({ name }) {
        return (
            <div class={`${style.home} page`}>
                <h1>Home route</h1>
                <Card>
                    <div class={style.cardHeader}>
                        <h2 class=" mdc-typography--title">Home card</h2>
                        <div class=" mdc-typography--caption">
                            Welcome to home route, {name}!
                        </div>
                    </div>
                    <div class={style.cardBody}>
                        Progressive Web App - Try it offline! Bootstraped with
                        preact-cli!
                    </div>
                    <Card.Actions>
                        <Card.ActionButton>OKAY</Card.ActionButton>
                    </Card.Actions>
                </Card>
            </div>
        );
    }
}

export default connect(
    state => {
        return {
            name: state.name
        };
    },
    {}
)(Home);
