function configurable(value: boolean) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        debugger;
        descriptor.configurable = value;
        var getter = descriptor.get;
        descriptor.get = function () {
            // No arrow to preserve context
            console.log("prop warning");
            return getter.apply(this, arguments);
        };
    };
}

class Point {
    private _x: number;
    private _y: number;
    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    @configurable(false)
    get x() { return this._x; }

    @configurable(false)
    get y() { return this._y; }
}

debugger;

var point = new Point(1, 2);
console.log(point.x);
console.log(point.x);
