declare namespace inject {
    interface IInject {
        get<T>(name: string): T;
        has(name: string): boolean;
        invoke<T>(factory: Function | any[], self?: any, locals?: IMap<any>): T;
        instantiate<T>(type: Function, locals?: IMap<any>): T;
    }
}