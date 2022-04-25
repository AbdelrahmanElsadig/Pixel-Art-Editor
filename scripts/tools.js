import {elt} from './canvas_and_pic.js';
class Tool_Select{
    constructor(state, {tools, dispatch}){
        this.select = elt('select', {
            onchange: () => dispatch({tool: this.select.value})
        },
        ...Object.keys(tools).map(name => elt('option', {selected: name == state.tool},name)));
        this.dom = elt("label", null, "🖌 Tool: ", this.select);
    };
    sync_state(state){
        this.select.value = state.tool;
    };
};

class Color_Select{
    constructor(state, {dispatch}){
        this.input = elt('input', {
            type: 'color',
            value: state.color,
            onchange: () => dispatch({color: this.input.value})
        });
        this.dom = elt('label', null, "🎨 Color: ", this.input);
    };
    sync_state(state){
        this.input.value = state.color;
    }
}

function draw(pos, state, dispatch){
    function connect(next_pos, state) {
      let line = draw_line(pos, next_pos, state.color);
      pos = next_pos;
      dispatch({picture: state.picture.draw(line)});
    }
    connect(pos, state);
    return connect
}


function draw_line(start, end, color){
    let coordinates = [];
    if (Math.abs(start.x - end.x) > Math.abs(start.y - end.y)) {
        if (start.x > end.x) [start, end] = [end, start];
        let slope = (end.y - start.y) / (end.x - start.x);
        for (let {x, y} = start; x <= end.x; x++) {
          coordinates.push({x, y: Math.round(y), color});
          y += slope;
        }
      } else {
        if (start.y > end.y) [start, end] = [end, start];
        let slope = (end.x - start.x) / (end.y - start.y);
        for (let {x, y} = start; y <= end.y; y++) {
          coordinates.push({x: Math.round(x), y, color});
          x += slope;
        }
      } 
    return coordinates
}

function line(start, state, dispatch){
    return end => {
        let line = draw_line(start, end, state.color);
        dispatch({picture: state.picture.draw(line)});
    }
}

function rectangle(start, state, dispatch){
    function draw_rectangle(pos){
        let x_start = Math.min(start.x, pos.x);
        let y_start = Math.min(start.y, pos.y);
        let x_end = Math.max(start.x, pos.x);
        let y_end = Math.max(start.y, pos.y);
        let drawn = [];
        for (let y = y_start; y < y_end; y++){
            for (let x = x_start; x < x_end; x++){
                drawn.push({x, y, color: state.color});
            }
        }
        dispatch({picture: state.picture.draw(drawn)});
    }
    draw_rectangle(start);
    return draw_rectangle
}

const around = [{dx: 1, dy: 0}, {dx: -1, dy: 0},
    {dx: 0, dy: -1}, {dx: 0, dy: 1}];

function circle(start, state, dispatch){
    function draw_circle(pos){
        let radius = Math.sqrt(Math.pow(start.x - pos.x, 2) + Math.pow(start.y - pos.y,2));
        let radius_c = Math.ceil(radius);
        let drawn = [];
        for (let dy = -radius_c; dy <= radius_c; dy++){
            for (let dx = -radius_c; dx <= radius_c; dx++){
                let distance = Math.sqrt(Math.pow(dx, 2)+ Math.pow(dy, 2));
                if (distance > radius) continue;
                let x = start.x + dx;
                let y = start.y + dy;
                if (x < 0 || x >= state.picture.width || y < 0 || y >= state.picture.height) continue;
                drawn.push({x, y, color:state.color});
            }  
        }
        dispatch({picture: state.picture.draw(drawn)});
        
    }
    draw_circle(start);
    return draw_circle
}


function fill({x, y}, state, dispatch){
    let target_color = state.picture.pixel(x, y);
    let drawn = [{x, y, color: state.color}];
    for (let done = 0; done < drawn.length;done++){
        for (let {dx, dy} of around){
            let x = drawn[done].x + dx, y = drawn[done].y + dy;
            if (x >= 0 && x < state.picture.width &&
                y >= 0 && y < state.picture.height &&
                state.picture.pixel(x, y) == target_color &&
                !drawn.some(p => p.x == x && p.y == y)){
                    drawn.push({x, y, color: state.color})
                }
        }
    }
    dispatch({picture: state.picture.draw(drawn)})
};

function pick(pos, state, dispatch){
    dispatch({color: state.picture.pixel(pos.x, pos.y)});
};


export {Tool_Select, Color_Select, draw, fill, rectangle, pick, circle, line}

