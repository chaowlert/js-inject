declare namespace inject {
    interface IInject {
        get<T>(name: string): T;
        has(name: string): boolean;
        invoke<T>(factory: IInvoke<T> | (string|IInvoke<T>)[], self?: any, locals?: Record<string, any>): T;
        instantiate<T>(type: IConstructor<T>, locals?: Record<string, any>): T;
    }
}