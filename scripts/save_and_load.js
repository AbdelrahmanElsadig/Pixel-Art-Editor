import {elt, draw_picture, Picture} from './canvas_and_pic.js';
class Save_Button{
    constructor(state){
        this.picture = state.picture;
        this.dom = elt('button',{
            onclick: () => this.save()
        },"💾 Save")
    }
    save(){
        let canvas = elt('canvas');
        draw_picture(this.picture, canvas, 1);
        let link = elt('a', {
            href: canvas.toDataURL(),
            download: 'pixelart.png'
        });
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
    sync_state(state){
        this.picture = state.picture;
    }
}

class Load_Button{
    constructor(_, {dispatch}){
        this.dom = elt('button', {
            onclick: () => start_load(dispatch)
        }, "📁 Load")
    }
    sync_state(){}
}

function start_load(dispatch){
    let input = elt('input', {
        type: 'file',
        onchange: () => finish_load(input.files[0], dispatch)
    });
    document.body.appendChild(input);
    input.click();
    input.remove();
}

function finish_load(file, dispatch){
    if (file == null) return ;
    let reader = new FileReader();
    reader.addEventListener('load', () => {
        let image = elt('img', {
            onload: () => dispatch({
                picture: picture_from_image(image)
            }),
            src: reader.result
        })
    })
    reader.readAsDataURL(file)
};

function picture_from_image(image){
    let width = Math.min(100, image.width);
    let height = Math.min(100, image.height);
    let canvas = elt('canvas', {width, height});
    const cx = canvas.getContext('2d');
    cx.drawImage(image, 0, 0);
    let pixels = [];
    let data = cx.getImageData(0, 0, width, height);
    function hex(n){
        return n.toString(16).padStart(2, '0')
    };

    for (let i = 0; i < data.length; i+= 4) {
        let [r, g, b] = data.slice(i, i+3);
        pixels.push('#' + hex(r) + hex(g) + hex(b));
    };
    return new Picture(width, height, pixels)
}


export {Save_Button, Load_Button}