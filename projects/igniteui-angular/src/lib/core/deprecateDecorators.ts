export function DeprecateClass(message: string): ClassDecorator {
    return (constructor: Function) => {
        console.warn(constructor.name + ': ' + message);
    };
}

export function DeprecateMethod(message: string): MethodDecorator {
    return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
        console.warn(target.constructor.name + ': ' + message);
    };
}

export function DeprecateProperty(message: string): PropertyDecorator {
    return (constructor: any) => {
        console.warn(constructor.constructor.name + ': ' + message);
    };
}


export function DeprecateAccessors(message: string, get = true, set = true): MethodDecorator {
    return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
        if (get && descriptor.get) {
            const getter = descriptor.get;
            descriptor.get = function () {
                // No arrow to preserve original call context
                console.warn(message);
                return getter.apply(this, arguments);
            };
        }
        if (set && descriptor.set) {
            const setter = descriptor.set;
            descriptor.set = function () {
                // No arrow to preserve original call context
                console.warn(message);
                setter.apply(this, arguments);
            };
        }
    };
}
