import * as ImageJS from "image-js";
import { Category } from "../../types/Category";
import * as _ from "lodash";
import { connectPoints } from "../imageHelper";
import { simplify } from "../simplify/simplify";
import { slpf } from "../polygon-fill/slpf";
import { encode } from "../rle";
import { Selection } from "./Selection";

export abstract class SelectionOperator {
  image: ImageJS.Image;
  manager: ImageJS.RoiManager;
  points?: Array<number> = [];
  selected: boolean = false;
  selecting: boolean = false;
  selection?: Selection;

  constructor(image: ImageJS.Image) {
    this.image = image;

    this.manager = image.getRoiManager();
  }

  abstract get boundingBox(): [number, number, number, number] | undefined;

  abstract get contour(): Array<number> | undefined;

  get mask(): Array<number> | undefined {
    const maskImage = new ImageJS.Image({
      width: this.image.width,
      height: this.image.height,
      bitDepth: 8,
    });

    const coords = _.chunk(this.points, 2);

    const connectedPoints = connectPoints(coords, maskImage); // get coordinates of connected points and draw boundaries of mask
    simplify(connectedPoints, 1, true);
    slpf(connectedPoints, maskImage);

    // @ts-ignore
    return encode(maskImage.getChannel(0).data);
  }

  abstract deselect(): void;

  abstract onMouseDown(position: { x: number; y: number }): void;

  abstract onMouseMove(position: { x: number; y: number }): void;

  abstract onMouseUp(position: { x: number; y: number }): void;

  select(category: Category): void {
    if (!this.boundingBox || !this.contour || !this.mask) return;

    this.selection = new Selection(
      category,
      this.contour,
      this.mask,
      this.image.width,
      this.image.height
    );
  }
}
