import {initMixin} from './init.js'
import {renderMixin} from './render.js'

function Cue(options){
    //调用_init_函数
    this._init_(options);
    if(this._created != null){
        this._created.call(this);
    }
    this._render();
}

initMixin(Cue);
renderMixin(Cue);

export default Cue;