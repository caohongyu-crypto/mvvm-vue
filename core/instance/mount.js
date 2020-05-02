import VNode from '../vdom/vnode.js'
import {prepareRender, getVNodeByTemplate, clearMap} from './render.js'
import { vmodel } from './grammer/vmodel.js';
import { vfor } from './grammer/vfor.js';
import {mergeAttr} from '../util/ObjectUtil.js'
import { checkVBind } from './grammer/vbind.js';
import { checkVOn } from './grammer/von.js';

//如果没有el，则使用$mount
export function initMount(Due){
    Due.prototype.$mount = function (el){
        let vm = this;
        let rootDom = document.getElementById(el);
        mount(vm, rootDom)
    }
}

export function mount(vm, el){
    //进行挂载
    vm._vnode = constructVNode(vm, el, null);
    //进行预备渲染(建立渲染索引，通过模板找vnode，通过vnode找模板)
    prepareRender(vm, vm._vnode);
}

function constructVNode(vm, elm, parent){//深度优先搜索
    let vnode = analysisAttr(vm, elm, parent);//分析属性
    //vnode不为空才重新创建
    if(vnode == null){
        let children = [];
        let text = getNodeText(elm);
        let data = null;
        let nodeType = elm.nodeType;
        let tag = elm.nodeName;
        vnode = new VNode(tag, elm, children, text, data, parent, nodeType);
        if(elm.nodeType === 1 && elm.getAttribute('env')){
            vnode.env = mergeAttr(vnode.env, JSON.parse(elm.getAttribute('env')))
        }else{
            vnode.env = mergeAttr(vnode.env, parent ? parent.env : {});
        }
    }
    checkVBind(vm, vnode);
    checkVOn(vm, vnode);
    //获取所有的子节点
    let childs =  vnode.elm.childNodes;
    for(let i = 0; i < childs.length; i++){
        //递归遍历得到所有节点的子节点
        let childNodes = constructVNode(vm, childs[i], vnode);
        //返回单一节点
        if(childNodes instanceof VNode){
            vnode.children.push(childNodes);
        }else{  //返回一个数组
            vnode.children = vnode.children.concat(childNodes)
        }
    }
    return vnode;
}

function getNodeText(elm){
    //判断是否是文本节点
    if(elm.nodeType === 3){
        return elm.nodeValue;
    }else{
        return '';
    }
}

function analysisAttr(vm, elm, parent){
    if(elm.nodeType === 1){//判断是否是标签
        //获取标签属性名
        let attrNames = elm.getAttributeNames();
        if(attrNames.indexOf('v-model') > -1){
            vmodel(vm, elm, elm.getAttribute('v-model'));
        }
        if(attrNames.indexOf('v-for') > -1){
            vfor(vm, elm, parent, elm.getAttribute('v-for'))
        }
    }
}

export function rebuild(vm, template){
    let virtualNode = getVNodeByTemplate(template);
    for(let i = 0; i < virtualNode.length; i++){
        virtualNode[i].parent.elm.innerHTML = '';
        virtualNode[i].parent.elm.appendChild(virtualNode[i].elm);
        let result = constructVNode(vm, virtualNode[i].elm, virtualNode[i].parent);
        virtualNode[i].parent.children = [result];
        clearMap();
        prepareRender(vm, vm._vnode);
    }
}