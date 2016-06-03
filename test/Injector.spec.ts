/// <reference path="../typings/index.d.ts" />

import {Named, Inject, PostConstruct, Registry, Injector} from '../src/index';
import {expect} from 'chai';

describe('Injector', function () {
    it('should be able to inject', function () {
        //assign
        Registry.setInjectorFactory(() => new Injector());
        Registry.setNameResolver(Registry.naming.camelCase);
        Registry.registerService('classC', ClassC);
        Registry.registerFactory('factory', () => 123);
        Registry.registerValue('value', 'PASS');
        let injector = Registry.createInjector();

        //act
        let classA = injector.get<ClassA>('classA');

        //assert
        expect(classA.prop).equals('ok');
        expect(classA.prop2).equals(890);
        expect(classA.value).equals('PASS');
        expect(classA.factory).equals(123);
        expect(classA.classBx).instanceOf(ClassB);
        expect(classA.classCx).instanceOf(ClassC);
        expect(classA.classD).instanceOf(ClassD);
        expect(classA.classE).instanceOf(ClassE);
        expect(classA.classCx).equals(classA.classBx.classC);
    });

    it('should be able detect circular reference', function () {
        //assign
        let injector = Registry.createInjector();

        //act
        let fn = () => injector.get<ClassX>('classX');

        //assert
        expect(fn).to.throw(`inject: 'classX' has circular reference`);
    });

    it('should be able to check unregistered name', function () {
        //assign
        let injector = Registry.createInjector();

        //act
        let fn = () => injector.get('xqwzts');

        //assert
        expect(fn).to.throw(`inject: 'xqwzts' is not registered`);
    });

    it('should check valid name', function () {
        //assign
        let injector = Registry.createInjector();

        //act
        let result1 = injector.has('classA');
        let result2 = injector.has('xqwzts');

        //assert
        expect(result1).is.true;
        expect(result2).is.false;
    });

    it('should be able to invoke a function', function () {
        //assign
        let injector = Registry.createInjector();
        let locals = { num: 5 };

        //act
        let result = injector.invoke(
            // @ngInject
            function (classE: ClassE, num: number) {
                return classE.id + num;
            }, null, locals);

        //assert
        expect(result).equals(15);
    });

    it('should be able to instantiate a class', function () {
        //assign
        let injector = Registry.createInjector();

        //act
        let classB = injector.instantiate<ClassB>(ClassB);

        //assert
        expect(classB.classC).instanceOf(ClassC);
    });
});

describe('Registry', function () {
    it('should be able to get names', function () {
        //assign
        Reflect.defineMetadata('blah', 123, Registry);

        //act
        let names = Registry.getNames();

        //assert
        expect(names.length).at.least(7);
        expect(names).include('classA')
            .and.include('classBx')
            .and.include('classD')
            .and.include('classE')
            .and.include('classX')
            .and.include('classY')
            .and.include('classZ');
    });
});

@Named
class ClassE {
    id = 10;
}

@Named
class ClassD { }

//test manual name
class ClassC { }

@Named('classBx')   //test custom name
class ClassB {
    @Inject         //test same instance
    classC: ClassC;
}

// @ngInject
@Named  //test class name
class ClassA {
    prop: string;
    prop2: number;

    constructor(public classD: ClassD, public classE: ClassE, public value: string, public factory: number) {
        this.prop = 'ok';   //test this
    }

    @PostConstruct
    initialize() {
        this.prop2 = 890;
    }

    @Inject //test prop injection
    classBx: ClassB;

    @Inject('classC')   //test custom name ctor injection
    classCx: ClassC;
}

//test circular injection

// @ngInject
@Named
class ClassZ {
    constructor(public classX: ClassX) { }
}

// @ngInject
@Named
class ClassY {
    constructor(public classZ: ClassZ) { }
}

// @ngInject
@Named
class ClassX {
    constructor(public classY: ClassY) { }
}

