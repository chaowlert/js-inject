import { Registry } from './Registry';

export function Named(name: string | Function): any {
    if (typeof name === 'string') {
        return function (func: Function) {
            Registry.registerService(name, func);
        };
    } else {
        let func = name;
        let fnName = func.toString().match(/^function\s*([^\s(]+)/)[1];
        let key = Registry.resolveName(fnName);
        Registry.registerService(key, func);
    }
}