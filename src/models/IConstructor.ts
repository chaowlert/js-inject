declare namespace inject {
    interface IConstructor<T> {
        new (...args: any[]): T;
    }
}