import {Instance} from "../../types/Instance";

export abstract class Selection {
  selected: boolean = false;

  selecting: boolean = false;

  selection?: Instance;

  abstract deselect(): void;

  abstract onMouseDown(position: { x: number; y: number }): void;

  abstract onMouseMove(position: { x: number; y: number }): void;

  abstract onMouseUp(position: { x: number; y: number }): void;

  abstract select(): void;
}
