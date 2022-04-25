import {Picture, Pixel_Editor} from './canvas_and_pic.js';
import {Tool_Select, Color_Select, pick, rectangle, fill, draw, circle, line} from './tools.js';
import {Save_Button, Load_Button,} from './save_and_load.js';
import {Undo_Button, history_update_state} from './undo.js';

const start_state = {
    tool: "draw",
    color: "#000000",
    picture: Picture.empty(60, 30, "#f0f0f0"),
    done: [],
    done_at: 0
}

const base_tools = {line, draw, fill, rectangle, circle, pick};

const base_controls = [Tool_Select, Color_Select, Save_Button, Load_Button, Undo_Button];

function start_pixel_editor({
    state = start_state, 
    tools = base_tools, 
    controls = base_controls
}){
    let app = new Pixel_Editor(state,{
        tools, 
        controls,
        dispatch(action){
            state = history_update_state(state, action);
            app.sync_state(state);
        },
    });
    return app.dom;
};

document.querySelector('.editor').appendChild(start_pixel_editor({}));