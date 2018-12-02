import { createStore } from "redux";

export default defaultState => {
    return createStore((state = {}, action) => {
        return state;
    }, defaultState);
};
