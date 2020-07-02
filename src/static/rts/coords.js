import Util from "./util.js";

export default class Coords {
  constructor() {
    return Util.overload(this, arguments, [
      {
        signature: [Coords],
        implementation: function copyConstructor(other) {
          this._x = other._x;
          this._y = other._y;
        },
      },
      {
        signature: [Number, Number],
        implementation: function valueConstructor(x, y) {
          this._x = x;
          this._y = y;
        },
      },
    ]);
  }

  getX() {
    return this._x;
  }

  getY() {
    return this._y;
  }

  setX(x) {
    this._x = x;
  }

  setY(y) {
    this._y = y;
  }

  distanceFrom(other) {
    let x = this.getX() - other.getX();
    let y = this.getY() - other.getY();
    return Math.sqrt(x * x + y * y);
  }

  static add(a, b) {
    return new Coords(a.getX() + b.getX(), a.getY() + b.getY());
  }

  static lerp(a, b, c) {
    return new Coords(
      Util.lerp(a.getX(), b.getX(), c),
      Util.lerp(a.getY(), b.getY(), c)
    );
  }
}
