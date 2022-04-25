class Picture{
    constructor(width, height, pixels){
        this.width = width;
        this.height = height;
        this.pixels = pixels;
    };
    static empty(width, height, color){
        let pixels = new Array(width*height).fill(color)
        return new Picture(width, height, pixels);
    };

    pixel(x,y){
        return this.pixels[x + y * this.width]
    };

    draw(pixels){
        let copy = this.pixels.slice();
        for (let {x, y, color} of pixels){
            copy[x + y* this.width] = color;
        }
        return new Picture(this.width, this.height, copy)
    };

};




function elt(type, props, ...children){
    let dom = document.createElement(type);
    if (props) Object.assign(dom, props);
    for (let child of children){
        if (typeof child != 'string') dom.appendChild(child);
        else dom.appendChild(document.createTextNode(child));
    }
    return dom
};

const scale = 10;

class Picture_Canvas{
    constructor(picture, pointer_down){
        this.dom = elt('canvas',{
            onmousedown: event => this.mouse(event, pointer_down),
            ontouchstart: event => this.touch(event, pointer_down)
        })
        this.sync_state(picture)
    }
    sync_state(picture){
        if (this.picture == picture) return;
        draw_picture2(this.picture, picture, this.dom, scale);
        this.picture = picture;
    }
};

function draw_picture(picture, canvas, scale){
    canvas.width = picture.width * scale;
    canvas.height = picture.height * scale;
    const cx = canvas.getContext('2d');
    for (let y = 0; y < picture.height; y++){
        for (let x = 0; x < picture.width; x++){
            cx.fillStyle = picture.pixel(x,y);
            cx.fillRect(x * scale, y * scale, scale, scale)
        }
    }
};

function draw_picture2(old_picture, picture, canvas, scale){
    if (old_picture == null ||
        old_picture.width != picture.width ||
        old_picture.height != picture.height) {
      canvas.width = picture.width * scale;
      canvas.height = picture.height * scale;
      old_picture = null;
    }

    let cx = canvas.getContext("2d");
    for (let y = 0; y < picture.height; y++) {
      for (let x = 0; x < picture.width; x++) {
        let color = picture.pixel(x, y);
        if (old_picture == null || old_picture.pixel(x, y) != color) {
          cx.fillStyle = color;
          cx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }
}

Picture_Canvas.prototype.mouse = function(down_event, on_down){
    if (down_event.button != 0) return;
    let pos = pointer_pos(down_event,this.dom);
    let on_move = on_down(pos);
    if (!on_move) return;
    let move = moveEvent => {
        if (moveEvent.buttons == 0){
            this.dom.removeEventListener('mousemove',move)
        }
        else {
            let new_pos = pointer_pos(moveEvent, this.dom);
            if (new_pos.x == pos.x && new_pos.y == pos.y) return;
            pos = new_pos;
            on_move(new_pos)
        }
    };
    this.dom.addEventListener('mousemove',move)

}

function pointer_pos(pos_event, dom_node){
    let rect = dom_node.getBoundingClientRect();
    return { x: Math.floor((pos_event.clientX - rect.left) /scale),
             y: Math.floor((pos_event.clientY - rect.top)  /scale) }
};


Picture_Canvas.prototype.touch = function(start_event, on_down){
    let pos = pointer_pos(start_event, this.dom);
    let on_move = on_down(pos);
    start_event.preventDefault();
    if (!on_move) return ;
    let move = move_event => {
        let new_pos = pointer_pos(move_event.touches[0],this.dom);
        if (new_pos.x == pos.x && new_pos.y == pos.y) return ;
        pos = new_pos;
        on_move(new_pos);
    };
    let end = () => {
        this.dom.removeEventListener('touchmove', move);
        this.dom.removeEventListener('touchend', end);
    };
    this.dom.addEventListener('touchmove', move);
    this.dom.addEventListener('touchend', end);
}


class Pixel_Editor{
    constructor(state, config){
        let {tools, controls, dispatch} = config;
        this.state = state;
        this.canvas = new Picture_Canvas(state.picture, pos => {
            let tool = tools[this.state.tool];
            let on_move = tool(pos, this.state, dispatch);
            if (on_move) return pos => on_move(pos, this.state);
        });
        this.controls = controls.map(Control => new Control(state, config));
        this.dom = elt('div', {
            tabIndex: 0
        }, this.canvas.dom, elt('br'),
        ...this.controls.reduce((a,c) => a.concat(" ", c.dom), []));    
        this.dom.addEventListener('keydown', event => {
            let letters = 'ldfrcp'.split('');
            let options = document.querySelectorAll('option');
            letters.forEach((option, i) => {
                if (event.key.toLowerCase() == option){
                    options[i].selected = true;
                    this.state.tool = options[i].value;
                    return
                };
            });
            if(event.ctrlKey && event.key.toLowerCase() == 'z') {
                document.querySelector('button:last-child').click()
            }
        });  
        
    };
    sync_state(state){
        this.state = state;
        this.canvas.sync_state(state.picture);
        for (let ctrl of this.controls) ctrl.sync_state(state)
    };
};

export {Picture, Picture_Canvas, Pixel_Editor, elt, draw_picture};