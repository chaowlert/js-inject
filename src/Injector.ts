import 'reflect-metadata';
import { Registry } from './Registry';

Registry.setInjectorFactory(() => new Injector());

interface InjectableFunction extends Function {
    $inject: string[];
}

export class Injector implements inject.IInject {

    private cached: Record<string, any> = {};

    get<T>(name: string): T {
        return this._get(name, new Set<string>());
    }

    has(name: string) {
        return !!this.cached[name] || !!Registry.getMetadata(name);
    }

    invoke(factory: Function | any[], self?: any, locals?: Record<string, any>) {
        let previous = new Set<string>();
        return this._invoke(factory, previous, self, locals);
    }

    private _invoke(factory: any, previous: Set<string>, self: any, locals: Record<string, any>) {
        let fn = this._getInjectableFunction(factory);
        let $inject = fn.$inject;

        let args = $inject ? $inject.map(k => this._get(k, previous, locals)) : [];
        return fn.apply(self, args);
    }

    instantiate(type: Function, locals?: Record<string, any>) {
        let previous = new Set<string>();
        let result = this._instantiate(type, previous, locals);
        this._injectProperties(result, type, previous, locals);
        return result;
    }

    private _instantiate(type: any, previous: Set<string>, locals: Record<string, any>) {
        let fn = this._getInjectableFunction(type);
        let $inject = fn.$inject;
        let args = $inject ? $inject.map(k => this._get(k, previous, locals)) : [];
        return new type(...args);
    }

    private _injectProperties(result: any, type: any, previous: Set<string>, locals: Record<string, any>) {
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

    private _get(name: string, previous: Set<string>, locals?: Record<string, any>): any {
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

    static FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
    static FN_ARG_SPLIT = /,/;
    static FN_ARG = /^\s*(_?)(.+?)\1\s*$/;
    static STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    private _getInjectableFunction(fn: InjectableFunction | any[]): InjectableFunction {
        if (fn instanceof Array) {
            let last: InjectableFunction = fn.pop();
            last.$inject = fn;
            return last;
        } else if (typeof fn === 'function') {
            let $inject: string[];
            if (!($inject = fn.$inject)) {
                $inject = [];
                let fnText: string = fn.toString().replace(Injector.STRIP_COMMENTS, '');
                let argDecl = fnText.match(Injector.FN_ARGS);
                for (let arg of argDecl[1].split(Injector.FN_ARG_SPLIT)) {
                    arg.replace(Injector.FN_ARG, (str, _, name) => {
                        $inject.push(name);
                        return str;
                    });
                }
                fn.$inject = $inject;
                return fn;
            }
        }
        return <InjectableFunction>fn;
    }
}
