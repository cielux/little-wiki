class Util {
  /**
   * Returns true if x is between a and b, false otherwise. If inclusive is
   * true, also returns true if x equals a or b.
   */
  static between(x, a, b, inclusive) {
    let greater = Math.max(a, b);
    let lesser = Math.min(a, b);
    return inclusive ? x >= lesser && x <= greater : x > lesser && x < greater;
  }

  static lerp(a, b, c) {
    return a + (c * (b - a));
  }

  static overload(that, argumentz, implementations) {
    argumentz = [...argumentz];
    
    const SPECIAL_TYPES = {
      "number": Number,
      "string": String
    }
    
    implementations:
    for (const implementation of implementations) {
      if (implementation.signature.length !== argumentz.length) {
        continue;
      }
      for (let i = 0; i < argumentz.length; ++i) {
        const argument = argumentz[i];
        const tipe = implementation.signature[i];
        // TODO(maxrad, rain): Add keyword support (where the type value in the
        // signature is the string "any" or "varargs", perhaps?) for wildcard
        // and variadic overloads.
        const tipeof = typeof argument;
        if (SPECIAL_TYPES.hasOwnProperty(tipeof)) {
          // Special case handling
          if (SPECIAL_TYPES[tipeof] !== tipe) {
            continue implementations;
          }
        } else if (!(argument instanceof tipe)) {
          continue implementations;
        }
      }
      // If we got here, we have found the implementation that matches the
      // arguments passed.
      const impl = implementation.implementation;
      try {
        return impl.apply(that, argumentz);
      } catch(e) {
        e.message = `Error applying ${impl.name} to ${that.name}: ${e.message}`;
        throw e;
      }
    }
    throw new Error(`No matching implementations for call to ${that.name}`);
  }
}

class Bounds {
  constructor() {
    return Util.overload(this, arguments, [
      {
        signature: [ Bounds ],
        implementation: function copyConstructor(other) {
          this._topLeft = other._topLeft;
          this._bottomRight = other._bottomRight;
        }
      },
      
      {
        signature: [ Coords, Coords ],
        implementation: function valueConstructor(topLeft, bottomRight) {
          this._topLeft = new Coords(topLeft);
          this._bottomRight = new Coords(bottomRight);
        }
      }
    ]);
  }

  getBottom() { return this.getBottomRight().getY();}

  getBottomRight() { return this._bottomRight; }
  
  getHeight() { return this.getBottom() - this.getTop(); }
  
  getLeft() { return this.getTopLeft().getX(); }
  
  getRight() { return this.getBottomRight().getX(); }
  
  getTop() { return this.getTopLeft().getY(); }
  
  getTopLeft() { return this._topLeft; }
  
  getWidth() { return this.getRight() - this.getLeft(); }
  
  setTopLeft(topLeft) { this._topLeft = topLeft; }
  
  setBottomRight(bottomRight) { this._bottomRight = bottomRight; }
  
  contains(coords) {
    return (
      Util.between(coords.getX(), this.getLeft(), this.getRight(), true) && 
      Util.between(coords.getY(), this.getTop(), this.getBottom(), true)
    );
  }
}

class Color {
  constructor() {
    return Util.overload(this, arguments, [
      {
        signature: [ Color ],
        implementation: function copyConstructor(other) {
          this._r = other._r;
          this._g = other._g;
          this._b = other._b;
          this._a = other._a;
        }
      },
      {
        signature: [ Number, Number, Number, Number ],
        implementation: function valueConstructor(r, g, b, a) {
          this._r = r;
          this._g = g;
          this._b = b;
          this._a = a;
        }
      }
    ]);
  }
  
  toRgbaString() {
    // DON'T FORGET: Blow away this cache when mutating channel values.
    if (this._rgbaString === undefined) {
      this._rgbaString = `rgba(${Math.round(this._r * 255)}, ${Math.round(this._g * 255)}, ${Math.round(this._b * 255)}, ${this._a})`;
    }
    return this._rgbaString;
  }
  
  static randomChannelValue() {
    return Math.random();
  }
  
  static random(opaque) {
    return new Color(Color.randomChannelValue(), Color.randomChannelValue(),
      Color.randomChannelValue(), opaque ? 1 : Color.randomChannelValue());
  }
}

class Coords {
  constructor() {
    return Util.overload(this, arguments, [
      {
        signature: [ Coords ],
        implementation: function copyConstructor(other) {
          this._x = other._x;
          this._y = other._y;
        }
      },
      {
        signature: [ Number, Number ],
        implementation: function valueConstructor(x, y) {
          this._x = x;
          this._y = y;
        }
      }
    ]);
  }
  
  getX() { return this._x; }
  
  getY() { return this._y; }
  
  setX(x) { this._x = x; }
  
  setY(y) { this._y = y; }
  
  distanceFrom(other) {
    let x = this.getX() - other.getX();
    let y = this.getY() - other.getY();
    return Math.sqrt(x * x + y * y);
  }
  
  static add(a, b) {
    return new Coords(a.getX() + b.getX(), a.getY() + b.getY());
  }

  static lerp(a, b, c) {
    return new Coords(Util.lerp(a.getX(), b.getX(), c), Util.lerp(a.getY(), b.getY(), c));
  }
}

class Game {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    // TODO(maxrad, rain): This will probably need to be transformed into a
    // special class for managing units with various hashes into different views
    // of the units and bookkeeping logic for keeping them all consistent with
    // each other.
    this.units = [];
    this.selectedUnits = [];
  }
  
  drawUnit(unit) {
    let unitLeft = unit.getPosition().getX();
    let unitTop = unit.getPosition().getY();
    let unitWidth = unit.getWidth();
    let unitHeight = unit.getHeight();
    if (this.selectedUnits.includes(unit)) {
      // Draw border around unit
      const BORDER_THICKNESS = 5;            
      this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      this.ctx.fillRect(unitLeft - BORDER_THICKNESS, unitTop - BORDER_THICKNESS,
        unitWidth + BORDER_THICKNESS * 2, unitHeight + BORDER_THICKNESS * 2);
    }
    this.ctx.fillStyle = unit.getColor().toRgbaString();
    this.ctx.fillRect(unitLeft, unitTop, unitWidth, unitHeight);
  }

  deselectUnits() {
    this.selectedUnits = [];
  }

  selectUnit(unit) {
    this.selectedUnits = [unit];
  }

  handleLeftClick(event) {
    let elemLeft = this.canvas.offsetLeft;
    let elemTop = this.canvas.offsetTop;
    let x = event.pageX - elemLeft;
    let y = event.pageY - elemTop;
    
    let clickLocation = new Coords(x, y);
    let didSelectUnit = false;
    for (const unit of this.units) {
      if (unit.getBounds().contains(clickLocation)) {
        this.selectUnit(unit);
        didSelectUnit = true;
        
        // unit.setPosition(Coords.add(unit.getPosition(), new Coords(100, 0)));
        break;
      }
    }
    if (!didSelectUnit) {
      this.deselectUnits();
    }
  }

  handleRightClick(event) {
    let elemLeft = this.canvas.offsetLeft;
    let elemTop = this.canvas.offsetTop;
    let x = event.pageX - elemLeft;
    let y = event.pageY - elemTop;
    
    let clickLocation = new Coords(x, y);
    if (this.selectedUnits.length) {
      for (const unit of this.selectedUnits) {
        unit.setDestination(clickLocation);
      }
    }

    event.preventDefault();
    event.stopPropagation();
    return false;
  }
  
  start() {
    this._ticker = setInterval(() => this.tick(), 1000 / 30);

    this.canvas.addEventListener('contextmenu', event => {
      return this.handleRightClick(event);
    }, false);

    this.canvas.addEventListener('click', event => {
      if (event.which === 1) {
        return this.handleLeftClick(event);
      }
    }, false);
    
    let unit1 = new Unit();
    let unit2 = new Unit();
    unit2.setPosition(Coords.add(unit2.getPosition(), new Coords(100, 0)));
    this.units.push(unit1, unit2);
  }
  
  tick() {
    for (const unit of this.units) {
      unit.tick();
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (const unit of this.units) {
      this.drawUnit(unit);
    }
  }
}

class Unit {
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
  
  getColor() { return new Color(this._color); }

  getDestination() {
    if (this._destination === undefined) {
      return undefined;
    }
    return new Coords(this._destination);
  }
  
  getHeight() { return this._height; }
  
  getPosition() {
    if (this.getBounds() === undefined) {
      return undefined;
    }
    return new Coords(this.getBounds().getTopLeft());
  }
  
  getSpeed() { return this._speed; }
  
  getWidth() { return this._width; }

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
    let bottomRight = new Coords(topLeft.getX() + this.getWidth(),
      topLeft.getY() + this.getHeight());
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

Unit = Object.assign(Unit, {
  DEFAULT_POSITION: new Coords(0, 0),
  DEFAULT_WIDTH: 50,
  DEFAULT_HEIGHT: 50,
  DEFAULT_SPEED: 10
});

let game = new Game();
game.start();