export class Registry {
    static naming = {
        camelCase(name: string) {
            return name.substr(0, 1).toLowerCase() + name.substr(1);
        }
    };

    static registerService(name: string, type: Function) {
        let data: inject.IMetadata = { name: name, type: type };
        Reflect.defineMetadata('inject:' + name, data, Registry);
    }

    static registerValue(name: string, value: any) {
        let data: inject.IMetadata = { name: name, value: value };
        Reflect.defineMetadata('inject:' + name, data, Registry);
    }

    static registerFactory(name: string, factory: Function | any[]) {
        let data: inject.IMetadata = { name: name, factory: factory };
        Reflect.defineMetadata('inject:' + name, data, Registry);
    }

    static registerProperty(name: string, type: Function, propertyKey: string) {
        let $props = Registry.getPropertyMetaData(type) || {};
        $props[propertyKey] = { name: name, type: type, propertyKey: propertyKey };
        Reflect.defineMetadata('inject:properties', $props, type);
    }

    static registerPostConstruct(type: Function, propertyKey: string) {
        let data: inject.IPostConstructMetadata = { type: type, propertyKey: propertyKey };
        Reflect.defineMetadata('inject:postConstruct', data, type);
    }

    static getMetadata(name: string): inject.IMetadata {
        return Reflect.getMetadata('inject:' + name, Registry);
    }

    static getNames(): string[] {
        return Reflect.getMetadataKeys(Registry)
            .filter(name => name.substr(0, 7) === 'inject:')
            .map(name => name.substr(7));
    }

    static getPropertyMetaData(type: Function): inject.IMap<inject.IPropertyMetadata> {
        return Reflect.getMetadata('inject:properties', type);
    }

    static getPostConstructMetaData(type: Function): inject.IPostConstructMetadata {
        return Reflect.getMetadata('inject:postConstruct', type);
    }

    private static _injectorFactory: () => inject.IInject;
    static setInjectorFactory(factory: () => inject.IInject) {
        Registry._injectorFactory = factory;
    }

    private static _nameResolver = Registry.naming.camelCase;
    static setNameResolver(resolver: (name: string) => string) {
        Registry._nameResolver = resolver;
    }

    static resolveName(name: string) {
        return Registry._nameResolver(name);
    }

    static createInjector() {
        return Registry._injectorFactory();
    }
}
