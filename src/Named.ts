import { Registry } from './Registry';

let getName = (func: Function) => func.name;
/** @internal */
export let getNameIE = (func: Function) => func.toString().match(/^(?:function|class)\s+([^\s(]+)/)[1];
if (isIE()) {
    getName = getNameIE;
}

export function Named(name: string | Function): any {
    if (typeof name === 'string') {
        return function (func: Function) {
            Registry.registerService(name, func);
        };
    } else {
        let func = name;
        let fnName = getName(func);
        let key = Registry.resolveName(fnName);
        Registry.registerService(key, func);
    }
}

function isIE(): boolean {
    if (typeof navigator === 'undefined') {
        return false;
    }
    if (navigator.appName === 'Microsoft Internet Explorer') {
        return true;
    }    
    if (navigator.appName === 'Netscape') {
        return navigator.appVersion.indexOf('Trident') > -1
            || navigator.appVersion.indexOf('Edge') > -1;
    }
    return false;
}