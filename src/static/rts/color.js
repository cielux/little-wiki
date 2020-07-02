import Util from "./util.js";

export default class Color {
  constructor() {
    return Util.overload(this, arguments, [
      {
        signature: [Color],
        implementation: function copyConstructor(other) {
          this._r = other._r;
          this._g = other._g;
          this._b = other._b;
          this._a = other._a;
        },
      },
      {
        signature: [Number, Number, Number, Number],
        implementation: function valueConstructor(r, g, b, a) {
          this._r = r;
          this._g = g;
          this._b = b;
          this._a = a;
        },
      },
    ]);
  }

  toRgbaString() {
    // DON'T FORGET: Blow away this cache when mutating channel values.
    if (this._rgbaString === undefined) {
      this._rgbaString = `rgba(${Math.round(this._r * 255)}, ${Math.round(
        this._g * 255
      )}, ${Math.round(this._b * 255)}, ${this._a})`;
    }
    return this._rgbaString;
  }

  static randomChannelValue() {
    return Math.random();
  }

  static random(opaque) {
    return new Color(
      Color.randomChannelValue(),
      Color.randomChannelValue(),
      Color.randomChannelValue(),
      opaque ? 1 : Color.randomChannelValue()
    );
  }
}
