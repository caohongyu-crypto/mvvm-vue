import {getValue} from '../util/ObjectUtil.js'
//通过模板找到哪些节点用到了这个模板
// to -> 2,for -> 4
let template2Vnode = new Map();

//通过节点找到这个节点下有哪些模板
let vnode2Template = new Map();

export function renderMixin(Cue){
    Cue.prototype._render = function(){
        //将根节点传进去
        renderNode(this, this._vnode);
    }
}

//修改属性值，页面重新渲染
export function renderData(vm, data){
    //使用这个模板有哪些
    let vnodes = template2Vnode.get(data);
    if(vnodes != null){
        for(let i = 0; i < vnodes.length; i++){
            renderNode(vm, vnodes[i]);
        }
    }
}
function renderNode(vm, vnode){
    if(vnode.nodeType === 3){ //判断是否是文本节点
        let templates = vnode2Template.get(vnode);
        if(templates){
            let result = vnode.text;
            for(let i = 0; i < templates.length; i++){
                let templateValue = getTemplateValue([vm._data, vnode.env], templates[i]);
                //如果存在模板
                if(templateValue){
                    result = result.replace('{{' + templates[i] + '}}', templateValue);
                }
            }
            //给模板重新赋值，替换掉模板
            vnode.elm.nodeValue = result;
        }
    }else if(vnode.nodeType === 1 && vnode.tag === 'INPUT'){
        let templates = vnode2Template.get(vnode);
        if(templates){
            for(let i = 0; i < templates.length; i++){
                let templateValue = getTemplateValue([vm._data, vnode.env], templates[i]);
                if(templateValue){
                    vnode.elm.value = templateValue;
                }
            }
        }
    }else{
        for(let i = 0 ; i < vnode.children.length; i++){
            renderNode(vm, vnode.children[i])//不是文本节点继续递归遍历
        }
    }
}
export function prepareRender(vm, vnode){
    if(vnode == null){
        return;
    }
    if(vnode.nodeType === 3){//是个文本节点
        analysisTemplateString(vnode);
    }
    if(vnode.nodeType == 0){
        setTemplate2Vnode(vnode.data, vnode);
        setVnode2Template(vnode.data, vnode);
    }
    analysisAttr(vm, vnode);
    for(let i = 0; i < vnode.children.length; i++){
        //进行递归遍历得到文本节点
        prepareRender(vm, vnode.children[i])
    }
}
  
function analysisTemplateString(vnode){
    //匹配模板
    let templateString = vnode.text.match(/{{[a-zA-Z_.]+}}/g);
    for(let i = 0; templateString && i < templateString.length; i++){
        setTemplate2Vnode(templateString[i], vnode);
        setVnode2Template(templateString[i], vnode);
    }
}


function setVnode2Template(template, vnode){
    let templateSet = vnode2Template.get(vnode);//得到节点对应的模板
    if(templateSet){
        templateSet.push(getTemplateName(template));
    }else{
        vnode2Template.set(vnode, [getTemplateName(template)]);
    }
}

function setTemplate2Vnode(template, vnode){
    let templateName = getTemplateName(template);
    let vnodeSet = template2Vnode.get(templateName);//判断模板所对应的节点
    if(vnodeSet){
        vnodeSet.push(vnode)
    }else{
        template2Vnode.set(templateName, [vnode]);
    }
}


function getTemplateName(template){
    //判断是否有花括号，如果有则去掉，没有直接返回
    if(template.substring(0, 2) === '{{' && template.substring(template.length - 2, template.length) === '}}'){
        return template.substring(2, template.length - 2);
    }else{
        return template;
    }
}

//获取模板的值
function getTemplateValue(objs, templateName){
    for(let i = 0; i < objs.length; i++){
        let temp = getValue(objs[i], templateName);
        if(temp != null){
            return temp
        }
    }
    return null;
}


export function getVNodeByTemplate(template){
    console.log(template2Vnode);
    return template2Vnode.get(template);
}

export function clearMap(){
    template2Vnode.clear();
    vnode2Template.clear();
}

//获取v-model的值，并设置在map中
function analysisAttr(vm, vnode){
    if(vnode.nodeType != 1){
        return;
    }
    let attrNames = vnode.elm.getAttributeNames();
    if(attrNames.indexOf('v-model') > -1){
        setTemplate2Vnode(vnode.elm.getAttribute('v-model'), vnode);
        setVnode2Template(vnode.elm.getAttribute('v-model'), vnode)
    }
}


//测试函数
export function test(){
    return {
        template2Vnode,
        vnode2Template
    }
}