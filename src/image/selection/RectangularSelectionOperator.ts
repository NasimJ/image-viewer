import { SelectionOperator } from "./SelectionOperator";
import { Category } from "../../types/Category";

export class RectangularSelectionOperator extends SelectionOperator {
  origin?: { x: number; y: number };

  width?: number;
  height?: number;

  get boundingBox(): [number, number, number, number] | undefined {
    if (!this.origin || !this.width || !this.height) return undefined;

    return [
      this.origin.x,
      this.origin.y,
      this.origin.x + this.width,
      this.origin.y + this.height,
    ];
  }

  deselect() {
    this.selected = false;
    this.selecting = false;

    this.origin = undefined;

    this.width = undefined;
    this.height = undefined;
  }

  onMouseDown(position: { x: number; y: number }) {
    if (this.selected) return;

    this.origin = position;

    this.selecting = true;
  }

  onMouseMove(position: { x: number; y: number }) {
    if (this.selected) return;

    this.resize(position);
  }

  onMouseUp(position: { x: number; y: number }) {
    if (this.selected || !this.selecting) return;

    this.resize(position);

    this.points = this.convertToPoints();

    this.selected = true;
    this.selecting = false;
  }

  select(category: Category) {
    if (!this.boundingBox || !this.mask) return;

    this.selection = {
      boundingBox: this.boundingBox,
      categoryId: category.id,
      mask: this.mask,
    };
  }

  private convertToPoints() {
    if (!this.width || !this.height || !this.origin) return;

    const points: Array<number> = [];

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        points.push(Math.floor(x + this.origin.x));
        points.push(Math.floor(y + this.origin.y));
      }
    }
    return points;
  }

  private resize(position: { x: number; y: number }) {
    if (this.origin) {
      this.width = position.x - this.origin.x;
      this.height = position.y - this.origin.y;
    }
  }
}
