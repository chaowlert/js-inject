declare namespace inject {
    interface IInvoke<T> {
        (...args: any[]): T;
    }
}