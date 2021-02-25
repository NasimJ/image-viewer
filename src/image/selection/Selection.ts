import { Category } from "../../types/Category";
import * as uuid from "uuid";
import { decode } from "../rle";
import * as _ from "lodash";
import { isoLines } from "marchingsquares";

export class Selection {
  category: Category;
  contour: Array<number>;
  id: string;
  mask: Array<number>;
  height: number;
  width: number;

  constructor(
    category: Category,
    contour: Array<number>,
    mask: Array<number>,
    width: number,
    height: number
  ) {
    this.contour = contour;
    this.category = category;

    this.id = uuid.v4();

    this.mask = mask;

    this.width = width;
    this.height = height;
  }

  get boundingBox(): [number, number, number, number] {
    return [0, 0, 0, 0];
  }

  //FIXME the contour getter below slows down the app

  // get contour(): Array<number> {
  //   const decoded = decode(this.mask);
  //   const decodedMatrix = _.map(_.chunk(decoded, this.width), (el: Array<number>) => {return Array.from(el)})
  //   const polygons = isoLines(decodedMatrix, 1);
  //   const largest = polygons.sort( (a: Array<Array<number>>, b: Array<Array<number>>) => {return b.length - a.length})[0];
  //   return _.flatten(largest)

  /*
   * Adding to a selection adds any new areas you select to your existing
   * selection.
   */
  add(selection: Selection) {
    selection.mask.forEach((currentValue: number, index: number) => {
      if (currentValue === 255) {
        this.mask[index] = 255;
      }
    });
  }

  /*
   * Subtracting from a selection deselects the areas you draw over, keeping
   * the rest of your existing selection.
   */
  subtract(selection: Selection) {
    selection.mask.forEach((currentValue: number, index: number) => {
      if (currentValue === 0) {
        this.mask[index] = 0;
      }
    });
  }

  /*
   * When using the Intersect selection mode, any currently selected areas you
   * select over will be kept and any currently selected areas outside your
   * new selection will be removed from the selection.
   */
  intersect(selection: Selection) {}

  invert() {
    this.mask.forEach((currentValue: number, index: number) => {
      this.mask[index] = ~this.mask[index];
    });
  }
}
