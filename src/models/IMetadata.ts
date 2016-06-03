declare namespace inject {
    interface IMetadata {
        name: string;
        type?: Function;
        factory?: Function | any[];
        value?: any;
    }
}