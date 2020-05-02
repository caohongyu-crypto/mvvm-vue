import { renderData } from "./render.js";
import { rebuild } from "./mount.js";
import { getValue } from "../util/ObjectUtil.js";

//对象的代理
function constructObjectProxy(vm, obj, namespace){
    let proxyObj = {};
    let two = {};
    //遍历监听这个对象的每个属性的改变
    for(let prop in obj){
        Object.defineProperty(proxyObj, prop, {
            configurable:true,
            get(){ //获取属性值
                return obj[prop];
            },
            set(value){ //设置属性值
                console.log(getNameSpace(namespace, prop))
                obj[prop] = value;
                renderData(vm, getNameSpace(namespace, prop))
            }
        });

        // 给vm上设置属性监听
        Object.defineProperty(vm, prop, {
            configurable:true,
            get(){
                return obj[prop]
            },
            set(value){
                console.log(getNameSpace(namespace, prop))
                obj[prop] = value;
                let val = getValue(vm._data, getNameSpace(namespace, prop));
                if(val instanceof Array){
                    rebuild(vm, getNameSpace(namespace, prop));
                    renderData(vm, getNameSpace(namespace, prop));
                }else{
                    renderData(vm, getNameSpace(namespace, prop));
                }
                renderData(vm, getNameSpace(namespace, prop))
            }
        });
        //如果属性还是一个对象,则递归调用监听函数
        if(obj[prop] instanceof Object){
            proxyObj[prop] = constructProxy(vm, obj[prop], getNameSpace(namespace, prop));
        }
    }
    return proxyObj;
}

//数组的代理
const arratpoto = Array.prototype;
function defArrayFunc(obj, func, namespace, vm){
    Object.defineProperty(obj, func, {
        enumerable:true,
        configurable:true,
        value:function(...args){
            //获取数组原型上的方法赋值给original
            let original = arratpoto[func];
            const result = original.apply(this, args);
            rebuild(vm, getNameSpace(namespace, ""))
            renderData(vm, getNameSpace(namespace, ""))
            return result;
        }
    })
}
function proxyArr(vm, arr, namespace){
    let obj = {
        eleType:'Array',
        toString(){ //重写toString方法
            let result = '';
            for(let i = 0; i < arr.length; i++){
                result += arr[i] + ',';
            }
            return result.substring(0, result.length - 1);
        },
        push(){},
        pop(){},
        shift(){},
        unshift(){}
        //还有其他数组方法暂时只写这些
    }
    defArrayFunc.call(vm, obj, 'push', namespace, vm);
    defArrayFunc.call(vm, obj, 'pop', namespace, vm);
    defArrayFunc.call(vm, obj, 'shift', namespace, vm);
    defArrayFunc.call(vm, obj, 'unshift', namespace, vm);
    //让arr的隐式原型指向obj
    arr.__proto__ = obj;
    return arr;
}

//我们要知道页面上哪个内容被修改了
//所以我们必须先捕获修改的这个事件
//用代理的方式实现监听属性修改
export function constructProxy(vm, obj, namespace){//vm表示Cue对象，obj表示传入data对象
    let proxyObj = null;
    //使用递归和Object.defineProperty来修改数据
    if(obj instanceof Array){ //判断这个对象是否为数组
        proxyObj = new Array(obj.length);
        for(let i = 0; i < obj.length; i++){
            if(obj[i] instanceof Object){
                //如果是对象就进行递归遍历
                proxyObj[i] = constructProxy(vm, obj[i], namespace);
            }else{
                proxyObj[i] = obj[i];
            }
        }
        proxyObj = proxyArr(vm, obj, namespace);
    }else if(obj instanceof Object){ //判断这个对象是否为对象
        proxyObj = constructObjectProxy(vm, obj, namespace);
    }else{
        //两者都不是就报错
        throw new Error(`${obj} must be object or array`);
    }
    return proxyObj;
}

//获取命名空间
function getNameSpace(nowNameSpace, nowProp){
    if(nowNameSpace === null || nowNameSpace === ""){
        return nowProp;
    }else if(nowProp === null || nowProp === ""){
        return nowNameSpace;
    }else{
        return nowNameSpace + "." + nowProp;
    }
}