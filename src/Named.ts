import { Registry } from './Registry';

export function Named(name: string | Function): any {
    if (typeof name === 'string') {
        return function (func: Function) {
            Registry.registerService(name, func);
        };
    } else {
        let key = Registry.resolveName(name.name);
        Registry.registerService(key, name);
    }
}