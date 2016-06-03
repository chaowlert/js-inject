import 'reflect-metadata';
import { Registry } from './Registry';

export function PostConstruct(target: Object, propertyKey?: string): any {
    Registry.registerPostConstruct(target.constructor, propertyKey);
}
