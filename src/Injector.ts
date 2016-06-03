import 'reflect-metadata';
import { Registry } from './Registry';

Registry.setInjectorFactory(() => new Injector());

export class Injector implements inject.IInject {

    private cached: inject.IMap<any> = {};

    get<T>(name: string): T {
        return this._get(name, new Set<string>());
    }

    has(name: string) {
        return !!this.cached[name] || !!Registry.getMetadata(name);
    }

    invoke<T>(factory: Function | any[], self?: any, locals?: inject.IMap<any>) {
        let previous = new Set<string>();
        return this._invoke(factory, previous, self, locals);
    }

    private _invoke(factory: Function | any[], previous: Set<string>, self: any, locals: inject.IMap<any>) {
        let fn: Function;
        let $inject: string[] = null;
        if (factory instanceof Array) {
            fn = factory.pop();
            $inject = factory;
        } else {
            fn = factory;
        }

        let args = $inject ? $inject.map(k => this._get(k, previous, locals)) : [];
        return fn.apply(self, args);
    }

    instantiate<T>(type: Function, locals?: inject.IMap<any>) {
        let previous = new Set<string>();
        let result = this._instantiate(type, previous, locals);
        this._injectProperties(result, type, previous, locals);
        return result;
    }

    private _instantiate(type: any, previous: Set<string>, locals: inject.IMap<any>) {
        let $inject: string[] = type.$inject;
        let args = $inject ? $inject.map(k => this._get(k, previous, locals)) : [];
        return new type(...args);
    }

    private _injectProperties(result: any, type: any, previous: Set<string>, locals: inject.IMap<any>) {
        let props = Registry.getPropertyMetaData(type) || {};
        let keys = Object.keys(props);
        for (let prop of keys) {
            result[prop] = this._get(props[prop].name, previous, locals);
        }

        //post construct
        let postConstruct = Registry.getPostConstructMetaData(type);
        if (postConstruct) {
            result[postConstruct.propertyKey]();
        }
    }

    private _get(name: string, previous: Set<string>, locals?: inject.IMap<any>): any {
        //get from cache
        let result = this.cached[name];
        if (result) {
            return result;
        }

        //check circular reference
        if (previous.has(name)) {
            throw `inject: '${name}' has circular reference`;
        }
        previous.add(name);

        //get from meta data
        let data = Registry.getMetadata(name);
        if (!data) {
            if (locals) {
                result = locals[name];
                if (result) { return result; }
            }
            throw `inject: '${name}' is not registered`;
        }

        if (data.type) {
            result = this._instantiate(data.type, previous, locals);
        } else if (data.factory) {
            result = this._invoke(data.factory, previous, null, locals);
        } else {
            result = data.value;
        }
        this.cached[name] = result;
        if (data.type) {
            this._injectProperties(result, data.type, previous, locals);
        }

        return result;
    }
}
