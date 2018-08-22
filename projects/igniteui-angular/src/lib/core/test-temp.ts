import { DeprecateMethod, DeprecateAccessors } from "./deprecateDecorators";

function configurable (target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
    debugger;
    // descriptor.configurable = value;
    // var getter = descriptor.get;
    // descriptor.get = function () {
    //     // No arrow to preserve context
    //     console.log("prop warning");
    //     return getter.apply(this, arguments);
    // };
}

class Point {
private _x: number;
private _y: number;
constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
}



private _value: string;

@DeprecateAccessors('', )
public get value(): string {
    return this._value;
}
public set value(v: string) {
    this._value = v;
}


}

debugger;

var point = new Point(1, 2);
console.log(point.x);
console.log(point.x);
