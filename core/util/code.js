export function generateCode(attr){
    let code = '';
    for(let temp in attr){
        code += "let " + temp + "=" + JSON.stringify(attr[temp]) + ";";
    }
    return code;
}

export function isTrue(expression, env){
    let bool = false;
    let code = env;
    code += "if(" + expression + "){bool = true;}";
    eval(code);
    return bool;
}