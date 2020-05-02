import {constructProxy} from './proxy.js'
import {mount} from './mount.js'
//初始化模块

//唯一标识符
let uid = 0;

export function initMixin(Cue){
    Cue.prototype._init_ = function (options){
        const vm = this;
        vm.uid = uid++;
        vm._isCue = true;
        //初始化data
        if(options && options.data){
            vm._data = constructProxy(vm, options.data, "");
        }
        //初始化created
        if(options && options.created){
            vm._created = options.created;
        }
        //初始化methods
        if(options && options.methods){
            vm._methods = options.methods;
            for(let temp in options.methods){
                vm[temp] = options.methods[temp];
            }
        }
        //初始化computed
        if(options && options.computed){
            vm._computed = options.computed;
        }
        //初始化el并挂载
        if(options && options.el){
            //获取根节点
            let rootDom = document.getElementById(options.el);
            //挂载节点
            mount(vm, rootDom);
        }
        
    }
}