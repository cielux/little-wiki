import Coords from "./coords.js";
import Unit from "./unit.js";

export default class Game {
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
      this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
      this.ctx.fillRect(
        unitLeft - BORDER_THICKNESS,
        unitTop - BORDER_THICKNESS,
        unitWidth + BORDER_THICKNESS * 2,
        unitHeight + BORDER_THICKNESS * 2
      );
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

    this.canvas.addEventListener(
      "contextmenu",
      (event) => {
        return this.handleRightClick(event);
      },
      false
    );

    this.canvas.addEventListener(
      "click",
      (event) => {
        if (event.which === 1) {
          return this.handleLeftClick(event);
        }
      },
      false
    );

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
