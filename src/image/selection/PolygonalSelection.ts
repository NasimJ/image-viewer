import {Selection} from "./Selection";

export default class PolygonalSelection extends Selection {
  public deselect(): void {}

  public onMouseDown(position: { x: number; y: number }): void {}

  public onMouseMove(position: { x: number; y: number }): void {}

  public onMouseUp(position: { x: number; y: number }): void {}
}
