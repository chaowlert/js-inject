import { Registry } from './Registry';

class Base { }
class Derive extends Base { }

let getName = (func: Function) => func.name;
/** @internal */
export let getNameIE = (func: Function) => func.toString().match(/^(?:function|class)\s+([^\s(]+)/)[1];
if (getName(Derive) !== 'Derive') {
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