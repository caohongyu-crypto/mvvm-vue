import { setValue } from "../../util/ObjectUtil.js"

export function vmodel(vm, elm, data){
    elm.onchange = function(){
        setValue(vm._data, data, elm.value);
    }
}