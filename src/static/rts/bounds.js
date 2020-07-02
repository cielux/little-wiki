import Coords from "./coords.js";
import Util from "./util.js";

export default class Bounds {
  constructor() {
    return Util.overload(this, arguments, [
      {
        signature: [Bounds],
        implementation: function copyConstructor(other) {
          this._topLeft = other._topLeft;
          this._bottomRight = other._bottomRight;
        },
      },

      {
        signature: [Coords, Coords],
        implementation: function valueConstructor(topLeft, bottomRight) {
          this._topLeft = new Coords(topLeft);
          this._bottomRight = new Coords(bottomRight);
        },
      },
    ]);
  }

  getBottom() {
    return this.getBottomRight().getY();
  }

  getBottomRight() {
    return this._bottomRight;
  }

  getHeight() {
    return this.getBottom() - this.getTop();
  }

  getLeft() {
    return this.getTopLeft().getX();
  }

  getRight() {
    return this.getBottomRight().getX();
  }

  getTop() {
    return this.getTopLeft().getY();
  }

  getTopLeft() {
    return this._topLeft;
  }

  getWidth() {
    return this.getRight() - this.getLeft();
  }

  setTopLeft(topLeft) {
    this._topLeft = topLeft;
  }

  setBottomRight(bottomRight) {
    this._bottomRight = bottomRight;
  }

  contains(coords) {
    return (
      Util.between(coords.getX(), this.getLeft(), this.getRight(), true) &&
      Util.between(coords.getY(), this.getTop(), this.getBottom(), true)
    );
  }
}
