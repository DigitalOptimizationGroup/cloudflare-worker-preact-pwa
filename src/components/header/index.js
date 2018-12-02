import { h, Component } from "preact";
import { route } from "preact-router";
import TopAppBar from "preact-material-components/TopAppBar";
import Drawer from "preact-material-components/Drawer";
import List from "preact-material-components/List";
import Dialog from "preact-material-components/Dialog";
import Switch from "preact-material-components/Switch";
import "preact-material-components/Switch/style.css";
import "preact-material-components/Dialog/style.css";
import "preact-material-components/Drawer/style.css";
import "preact-material-components/List/style.css";
import "preact-material-components/TopAppBar/style.css";

export default class Header extends Component {
    closeDrawer() {
        this.drawer.MDComponent.open = false;
        this.state = {
            darkThemeEnabled: false
        };
    }

    openDrawer = () => (this.drawer.MDComponent.open = true);

    openSettings = () => this.dialog.MDComponent.show();

    drawerRef = drawer => (this.drawer = drawer);
    dialogRef = dialog => (this.dialog = dialog);

    linkTo = path => () => {
        route(path);
        this.closeDrawer();
    };

    goHome = this.linkTo("/");
    goToMyProfile = this.linkTo("/profile/");

    toggleDarkTheme = () => {
        this.setState(
            {
                darkThemeEnabled: !this.state.darkThemeEnabled
            },
            () => {
                if (this.state.darkThemeEnabled) {
                    document.body.classList.add("mdc-theme--dark");
                } else {
                    document.body.classList.remove("mdc-theme--dark");
                }
            }
        );
    };

    render(props) {
        return (
            <div>
                <TopAppBar className="topappbar">
                    <TopAppBar.Row>
                        <TopAppBar.Section align-start>
                            <TopAppBar.Icon onClick={this.openDrawer}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    style="fill: white;"
                                >
                                    <path d="M0 0h24v24H0z" fill="none" />
                                    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                                </svg>
                            </TopAppBar.Icon>
                            <TopAppBar.Title>Preact app</TopAppBar.Title>
                        </TopAppBar.Section>
                        <TopAppBar.Section
                            align-end
                            shrink-to-fit
                            onClick={this.openSettings}
                        >
                            <TopAppBar.Icon>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    style="fill: white;"
                                >
                                    <path fill="none" d="M0 0h20v20H0V0z" />
                                    <path d="M15.95 10.78c.03-.25.05-.51.05-.78s-.02-.53-.06-.78l1.69-1.32c.15-.12.19-.34.1-.51l-1.6-2.77c-.1-.18-.31-.24-.49-.18l-1.99.8c-.42-.32-.86-.58-1.35-.78L12 2.34c-.03-.2-.2-.34-.4-.34H8.4c-.2 0-.36.14-.39.34l-.3 2.12c-.49.2-.94.47-1.35.78l-1.99-.8c-.18-.07-.39 0-.49.18l-1.6 2.77c-.1.18-.06.39.1.51l1.69 1.32c-.04.25-.07.52-.07.78s.02.53.06.78L2.37 12.1c-.15.12-.19.34-.1.51l1.6 2.77c.1.18.31.24.49.18l1.99-.8c.42.32.86.58 1.35.78l.3 2.12c.04.2.2.34.4.34h3.2c.2 0 .37-.14.39-.34l.3-2.12c.49-.2.94-.47 1.35-.78l1.99.8c.18.07.39 0 .49-.18l1.6-2.77c.1-.18.06-.39-.1-.51l-1.67-1.32zM10 13c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z" />
                                </svg>
                            </TopAppBar.Icon>
                        </TopAppBar.Section>
                    </TopAppBar.Row>
                </TopAppBar>
                <Drawer modal ref={this.drawerRef}>
                    <Drawer.DrawerContent>
                        <Drawer.DrawerItem
                            selected={props.selectedRoute === "/"}
                            onClick={this.goHome}
                        >
                            <List.ItemGraphic>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                                    <path d="M0 0h24v24H0z" fill="none" />
                                </svg>
                            </List.ItemGraphic>
                            Home
                        </Drawer.DrawerItem>
                        <Drawer.DrawerItem
                            selected={props.selectedRoute === "/profile/"}
                            onClick={this.goToMyProfile}
                        >
                            <List.ItemGraphic>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                    <path d="M0 0h24v24H0z" fill="none" />
                                </svg>
                            </List.ItemGraphic>
                            Profile
                        </Drawer.DrawerItem>
                    </Drawer.DrawerContent>
                </Drawer>
                <Dialog ref={this.dialogRef}>
                    <Dialog.Header>Settings</Dialog.Header>
                    <Dialog.Body>
                        <div>
                            Enable dark theme{" "}
                            <Switch onClick={this.toggleDarkTheme} />
                        </div>
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Dialog.FooterButton accept>OK</Dialog.FooterButton>
                    </Dialog.Footer>
                </Dialog>
            </div>
        );
    }
}
