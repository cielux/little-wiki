import Bounds from "./bounds.js";
import Color from "./color.js";
import Coords from "./coords.js";

export default class Unit {
  static DEFAULT_POSITION = new Coords(0, 0);
  static DEFAULT_WIDTH = 50;
  static DEFAULT_HEIGHT = 50;
  static DEFAULT_SPEED = 10;

  constructor() {
    this.setWidth(Unit.DEFAULT_WIDTH);
    this.setHeight(Unit.DEFAULT_HEIGHT);
    this.setPosition(Unit.DEFAULT_POSITION);
    this.setColor(Color.random(true));
    this.setSpeed(Unit.DEFAULT_SPEED);
  }

  getBounds() {
    if (this._bounds === undefined) {
      return undefined;
    }
    return new Bounds(this._bounds);
  }

  getColor() {
    return new Color(this._color);
  }

  getDestination() {
    if (this._destination === undefined) {
      return undefined;
    }
    return new Coords(this._destination);
  }

  getHeight() {
    return this._height;
  }

  getPosition() {
    if (this.getBounds() === undefined) {
      return undefined;
    }
    return new Coords(this.getBounds().getTopLeft());
  }

  getSpeed() {
    return this._speed;
  }

  getWidth() {
    return this._width;
  }

  setDestination(coords) {
    this._destination = new Coords(coords);
  }

  setColor(color) {
    this._color = color;
  }

  setHeight(height) {
    this._height = height;
    this._updatePosition();
  }

  setSpeed(speed) {
    this._speed = speed;
  }

  setWidth(width) {
    this._width = width;
    this._updatePosition();
  }

  setPosition(coords) {
    let topLeft = coords;
    let bottomRight = new Coords(
      topLeft.getX() + this.getWidth(),
      topLeft.getY() + this.getHeight()
    );
    this._bounds = new Bounds(topLeft, bottomRight);
  }

  tick() {
    let speed = this.getSpeed();
    let destination = this.getDestination();
    if (destination === undefined) {
      return;
    }
    let distance = this.getPosition().distanceFrom(destination);
    if (distance < speed) {
      this.setPosition(destination);
      return;
    }
    let fraction = speed / distance;
    this.setPosition(Coords.lerp(this.getPosition(), destination, fraction));
  }

  _updatePosition() {
    let position = this.getPosition();
    if (position !== undefined) {
      this.setPosition(position);
    }
  }
}
