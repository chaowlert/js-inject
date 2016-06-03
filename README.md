# js-inject
Simple dependency injection for javascript

## Install

```
npm install js-inject --save
```

## Getting started

This library is designed to use with Typescript. In tsconfig.json, please turn on `experimentalDecorators`.

```
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

### Basic usage

#### Register service

You can register service by using `@Name` annotation.

```
@Named
class ArmBuilder { }
```

With above annotation, `ArmBuilder` will be registered as `armBuilder`.

You can rename by passing name to `@Name` annotation.

```
@Named('arm')
class ArmBuilder { }
```

With above annotation, `ArmBuilder` will be registered as just `arm`.

#### Property Injection

You can inject service by using `@Inject` annotation.

```
@Named
class RobotBuilder {
  @Inject
  armBuilder: ArmBuilder;
}
```

With above `@Inject` annotation, `js-inject` will match property name with registered services and inject the service when it create `RobotBuilder`.

If service name is different to property name, you can pass the name to `@Inject` annotation.

```
@Named
class RobotBuilder {
  @Inject('arm')
  armBuilder: ArmBuilder;
}
```

#### Constructor injection

If you prefer constructor injection, you can use `/* @ngInject */` from [ng-annotate](https://github.com/olov/ng-annotate) to annotate class.

```
/* @ngInject */
@Named
class RobotBuilder {
  constructor(armBuilder: ArmBuilder) { }
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

#### Create service

You can create service through `Injector`.

```
let injector = Registry.createInjector();
let robotBuilder = injector.get<RobotBuilder>('robotBuilder');
```

With above call, `RobotBuilder` will be created with `ArmBuilder` injected. Please note that, services will be singleton for the same `Injector` instance.

### More about Registry

#### Register and replace service

To register 3rd party library, or replace service for browser, node, and unit testing. You can register and replace service by `Registry.registerService`.

```
Registry.registerService('robotBuilder', MockRobotBuilder);
```

#### Register factory

Sometimes, value you would like to inject is not the class. You can register service factory by `Registry.registerFactory`.

```
Registry.registerFactory('robotVersion', () => '1.0.0');
```

You can also inject value to function by using `/* @ngInject */` from [ng-annotate](https://github.com/olov/ng-annotate).

```
Registry.registerFactory('robotVersion', /* @ngInject */ app => app.version);
```

#### Register value

Instead of using `Registry.registerFactory` with empty argument, you can use `Registry.registerValue` to register a value.

```
Registry.registerValue('robotVersion', '1.0.0');
```
