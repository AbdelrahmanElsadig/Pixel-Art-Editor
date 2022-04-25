import {elt} from './canvas_and_pic.js'

function history_update_state(state, action){
    if (action.undo == true){
        if (state.done.length == 0) return state;
        return Object.assign({}, state, {
            picture: state.done[0],
            done: state.done.slice(1),
            done_at: 0
        });
    }
    else if (action.picture && state.done_at < Date.now() - 1000){
        return Object.assign({}, state, action, {
            done: [state.picture, ...state.done],
            done_at: Date.now()
        });
    }
    else {
        return Object.assign({}, state, action);
    }
};

class Undo_Button{
    constructor(state, {dispatch}){
        this.dom = elt('button', {
            onclick: () => dispatch({undo: true}),
            disabled: state.done.length == 0
        }, "⮪ Undo");
    }
    sync_state(state){
        this.dom.disabled = state.done.length == 0;
    };
};

export {history_update_state, Undo_Button}