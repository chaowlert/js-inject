# js-inject
Angular liked dependency injection as a module.

## Install

```
npm install js-inject --save
```

## Getting started

This library works well with es7 annotation and translate to es3/es5 by Babel or Typescript. You can also use this library without es7 annotation by using [Registry](#registry).

### Basic usage

#### Register service

You can register service by using `@Name` annotation.

```
@Named
class ArmBuilder { }
```

With above annotation, `ArmBuilder` will be registered as `armBuilder` (camel case).

You can rename by passing name to `@Name` annotation.

```
@Named('arm')
class ArmBuilder { }
```

With above annotation, `ArmBuilder` will be registered as just `arm`.

#### Constructor injection

To inject service to another class, you could specify parameter name to match with registered service.

```
@Named
class RobotBuilder {
  constructor(armBuilder: ArmBuilder) { }
} 
```

Above code, `js-inject` will match parameter name with registered services and inject the service when it create `RobotBuilder`.

TIP: If you need to uglify your code, you can use `/* @ngInject */` from [ng-annotate](https://github.com/olov/ng-annotate) to prevent parameter name to be mangled.

#### Property Injection

With `js-inject`, you can also inject service to property by using `@Inject` annotation.

```
@Named
class RobotBuilder {
  @Inject
  armBuilder: ArmBuilder;
}
```

If service name is different to property name, you can pass the name to `@Inject` annotation.

```
@Named
class RobotBuilder {
  @Inject('arm')
  armBuilder: ArmBuilder;
}
```

#### Perform post construct action

You can perform action after class has been created by `@PostConstruct` annotation.

```
@Named
class RobotBuilder {
  @PostConstruct
  init() { }
} 
```

With above `@PostConstruct` annotated, `init` method will be run after `RobotBuilder` has be created.

### Registry<a name="registry"></a>

#### Register and replace service

To register service manually, you can register and replace service by `Registry.registerService`.

```
Registry.registerService('robotBuilder', MockRobotBuilder);
```

#### Register factory

Sometimes, value you would like to inject is not the class. You can register service factory by `Registry.registerFactory`.

```
Registry.registerFactory('robotVersion', app => app.version);
```

In factory function, you can pass registered services. In above example, `app` will be injected to factory function.

TIP: If you need to uglify your code, you can use `/* @ngInject */` from [ng-annotate](https://github.com/olov/ng-annotate) to prevent parameter name to be mangled.

#### Register value

You can use `Registry.registerValue` to register a value.

```
Registry.registerValue('robotVersion', '1.0.0');
```

#### Get all names

You can get names of all registered services by `GetNames`.

```
let names = Registry.getNames();
```

### Injector

`injector` can be created from `Registry`.

```
let injector = Registry.createInjector();
```

#### Singleton

You can create singleton service through `Injector`.

```
let robotBuilder = injector.get<RobotBuilder>('robotBuilder');
```

With above call, `RobotBuilder` will be created with `ArmBuilder` injected. Please note that, services will be singleton for the same `Injector` instance.

#### Transient

If you would like to just create transient instance, you could use `instantiate`.

```
let robotBuilder = injector.instantiate(RobotBuilder);
```

With `instantiate`, you can also pass local services to the function.

```
let robotBuilder = injector.instantiate(RobotBuilder, { armBuilder: mockArmBuilder });
```

#### Factory

You could invoke a function and inject registered services with `invoke`.

```
let robotBuilder = injector.invoke(armBuilder => RobotBuilder.create(armBuilder));
```

You can also pass `this` and local services to the function.

```
let robotBuilder = injector.invoke(
  armBuilder => this.create(armBuilder),
  FakeRobotBuilder,
  { armBuilder: mockArmBuilder });
```

#### Check service existed

You can check service is existed by `has` function.

```
let hasRobotBuilder = injector.has('robotBuilder');
```

### Plug to AngularJS

This library can be used in NodeJS or on browser without AngularJS.
If you would like registered services to be available on AngularJS app, you can do following.

```
let injector = Registry.createInjector();
let names = Registry.getNames();
let app = angular.module('your-module');

for (let name of names) {
  app.value(name, injector.get(name));
}

//now you can inject your registered service to AngularJS
app.run(robotBuilder => {
  ...
});
```
