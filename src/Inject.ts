import 'reflect-metadata';
import { Registry } from './Registry';

export function Inject(name: (string | Object), propertyKey?: string): any {
    if (typeof name === 'string') {
        return function (target: Object, propKey: string) {
            Registry.registerProperty(name, target.constructor, propKey);
        };
    } else {
        Registry.registerProperty(propertyKey, name.constructor, propertyKey);
    }
}