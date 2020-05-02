import VNode from "../../vdom/vnode.js";
import { getValue } from "../../util/ObjectUtil.js";

export function vfor(vm, elm, parent, instructions){//(key) in list
    let virtualNode = new VNode(elm.nodeName, elm, [], '', getVirtualNodeData(instructions)[2], parent, 0);
    virtualNode.instructions = instructions;
    //移除节点，然后生成一个虚拟节点
    parent.elm.removeChild(elm);
    //移除节点的同时，文本节点也被移除，补上一个
    parent.elm.appendChild(document.createTextNode(''));
    //判断要创建多少个节点
    let resultSet = analysisInstructions(vm, instructions, elm, parent);
    return virtualNode;
}

//将指令拆分成数组
function getVirtualNodeData(instructions){
    let insSet = instructions.trim().split(" ");
    if(insSet.length != 3 || insSet[1] != 'in' && insSet[1] != 'of'){
        throw new Error('error');
    }
    console.log(insSet);
    return insSet
}

//分析要创建多少个节点
function analysisInstructions(vm, instructions, elm, parent){
    let insSet = getVirtualNodeData(instructions);
    console.log(insSet[2]);
    let dataSet = getValue(vm._data, insSet[2])
    //如果没取到值，报错
    if(!dataSet){
        throw new Error('error');
    }
    let resultSet = [];
    for(let i = 0; i < dataSet.length; i ++){
        //根据取值创建dom
        let tempDom = document.createElement(elm.nodeName);
        tempDom.innerHTML = elm.innerHTML;
        //获取环境变
        let env = analysisKV(insSet[0], dataSet[i], i);
        //将变量设置到dom中
        tempDom.setAttribute('env', JSON.stringify(env));
        parent.elm.appendChild(tempDom);
        resultSet.push(tempDom);
    }
    return resultSet;
}

//获取局部变量
function analysisKV(instructions, value, index){
    if(/([a-zA-Z0-9_]+)/.test(instructions)){ //判断是否是带括号的:(key, index) in list
        instructions.trim();//去除前后空格
        instructions = instructions.substring(1, instructions.length - 1);
    }
    let keys = instructions.split(',');
    if(keys.length === 0){
        throw new Error('error');
    }
    let obj = {};
    if(keys.length >= 1){
        //第一个值
        obj[keys[0].trim()] = value;
    }
    if(keys.length >= 2){
        //第二个是索引
        obj[keys[1].trim()] = index;
    }
    return obj;
}