import { test } from "@jest/globals";
import { LassoSelectionOperator } from "./LassoSelectionOperator";
import {Category} from "../../types/Category";

test("deselect", () => {
  const operator = new LassoSelectionOperator();

  operator.selected = true;

  operator.anchor = { x: 3, y: 3 };
  operator.buffer = [0, 0, 1, 1, 2, 2, 3, 3, 4, 3, 5, 3];
  operator.origin = { x: 0, y: 0 };
  operator.points = [0, 0, 1, 1, 2, 2, 3, 3, 4, 3, 5, 3, 0, 0];

  operator.deselect();

  expect(operator.selected).toBe(false);
  expect(operator.selecting).toBe(false);

  expect(operator.selection).toBe(undefined);

  expect(operator.origin).toStrictEqual(undefined);

  expect(operator.anchor).toStrictEqual(undefined);
  expect(operator.buffer).toStrictEqual([]);
  expect(operator.origin).toStrictEqual(undefined);
  expect(operator.points).toStrictEqual([]);
});

test("onMouseDown", () => {
  const operator = new LassoSelectionOperator();

  operator.onMouseDown({ x: 0, y: 0 });

  expect(operator.selected).toBe(false);
  expect(operator.selecting).toBe(true);

  expect(operator.selection).toBe(undefined);

  expect(operator.anchor).toStrictEqual(undefined);
  expect(operator.buffer).toStrictEqual([]);
  expect(operator.origin).toStrictEqual({ x: 0, y: 0 });
  expect(operator.points).toStrictEqual([]);
});

test("onMouseDown (subsequent, unconnected)", () => {
  const operator = new LassoSelectionOperator();

  operator.origin = { x: 0, y: 0 };

  operator.onMouseDown({ x: 100, y: 0 });

  expect(operator.selected).toBe(false);
  expect(operator.selecting).toBe(true);

  expect(operator.selection).toBe(undefined);

  expect(operator.anchor).toStrictEqual(undefined);
  expect(operator.buffer).toStrictEqual([]);
  expect(operator.origin).toStrictEqual({ x: 0, y: 0 });
  expect(operator.points).toStrictEqual([]);
});

test("onMouseDown (subsequent, connected)", () => {
  const operator = new LassoSelectionOperator();

  operator.anchor = { x: 0, y: 100 };
  operator.buffer = [0, 0, 100, 0, 100, 100, 0, 100];
  operator.origin = { x: 0, y: 0 };

  operator.onMouseDown({ x: 1, y: 1 });

  expect(operator.selected).toBe(true);
  expect(operator.selecting).toBe(false);

  expect(operator.selection).toBe(undefined);

  expect(operator.anchor).toStrictEqual({ x: 0, y: 100 });
  expect(operator.buffer).toStrictEqual([0, 0, 100, 0, 100, 100, 0, 100, 0, 0]);
  expect(operator.origin).toStrictEqual({ x: 0, y: 0 });
  expect(operator.points).toStrictEqual([0, 0, 100, 0, 100, 100, 0, 100, 0, 0]);
});

test("onMouseMove", () => {
  const operator = new LassoSelectionOperator();

  operator.selecting = true;

  operator.origin = { x: 0, y: 0 };

  operator.buffer = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];

  operator.onMouseMove({ x: 5, y: 5 });

  expect(operator.selected).toBe(false);
  expect(operator.selecting).toBe(true);

  expect(operator.selection).toBe(undefined);

  expect(operator.anchor).toStrictEqual(undefined);
  expect(operator.buffer).toStrictEqual([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
  expect(operator.origin).toStrictEqual({ x: 0, y: 0 });
  expect(operator.points).toStrictEqual([]);
});

test("onMouseMove (with anchor)", () => {
  const operator = new LassoSelectionOperator();

  operator.selecting = true;

  operator.anchor = { x: 0, y: 3 };
  operator.buffer = [0, 0, 0, 1, 0, 2, 0, 3, 2, 2];
  operator.origin = { x: 0, y: 0 };

  operator.onMouseMove({ x: 5, y: 5 });

  expect(operator.selected).toBe(false);
  expect(operator.selecting).toBe(true);

  expect(operator.selection).toBe(undefined);

  expect(operator.anchor).toStrictEqual({ x: 0, y: 3 });
  expect(operator.buffer).toStrictEqual([0, 0, 0, 1, 0, 2, 0, 3, 5, 5]);
  expect(operator.origin).toStrictEqual({ x: 0, y: 0 });
  expect(operator.points).toStrictEqual([]);
});

test("onMouseUp (unconnected, with anchor)", () => {
  const operator = new LassoSelectionOperator();

  operator.selecting = true;

  operator.anchor = { x: 100, y: 0 };
  operator.buffer = [0, 0, 100, 0, 100, 100];
  operator.origin = { x: 0, y: 0 };

  operator.onMouseUp({ x: 0, y: 100 });

  expect(operator.selected).toBe(false);
  expect(operator.selecting).toBe(true);

  expect(operator.selection).toBe(undefined);

  expect(operator.anchor).toStrictEqual({ x: 0, y: 100 });
  expect(operator.buffer).toStrictEqual([0, 0, 100, 0, 0, 100]);
  expect(operator.origin).toStrictEqual({ x: 0, y: 0 });
  expect(operator.points).toStrictEqual([]);
});

test("onMouseUp (unconnected, without anchor)", () => {
  const operator = new LassoSelectionOperator();

  operator.selecting = true;

  operator.buffer = [0, 0, 1, 1, 2, 2, 3, 3];
  operator.origin = { x: 0, y: 0 };

  operator.onMouseUp({ x: 3, y: 3 });

  expect(operator.selected).toBe(false);
  expect(operator.selecting).toBe(true);

  expect(operator.selection).toBe(undefined);

  expect(operator.anchor).toStrictEqual({ x: 3, y: 3 });
  expect(operator.buffer).toStrictEqual([0, 0, 1, 1, 2, 2, 3, 3]);
  expect(operator.origin).toStrictEqual({ x: 0, y: 0 });
  expect(operator.points).toStrictEqual([]);
});

test("select", () => {
  const operator = new LassoSelectionOperator();

  operator.selected = true;

  operator.anchor = { x: 3, y: 3 };
  operator.buffer = [0, 0, 1, 1, 2, 2, 3, 3, 4, 3, 5, 3];
  operator.origin = { x: 0, y: 0 };
  operator.points = [0, 0, 1, 1, 2, 2, 3, 3, 4, 3, 5, 3, 0, 0];

  const category: Category = {
    color: "#0000FF",
    id: "5ed3511d-1223-4bba-a0c2-2b3897232d98",
    name: "foo",
    visible: true,
  }

  operator.select(category);

  expect(operator.selected).toBe(true);
  expect(operator.selecting).toBe(false);

  expect(operator.selection).toStrictEqual({
    boundingBox: [0, 0, 5, 3],
    categoryId: 0,
    mask: "mask",
  });

  expect(operator.boundingBox).toStrictEqual([0, 0, 5, 3]);
  expect(operator.mask).toBe("mask");

  expect(operator.anchor).toStrictEqual({ x: 3, y: 3 });
  expect(operator.buffer).toStrictEqual([0, 0, 1, 1, 2, 2, 3, 3, 4, 3, 5, 3]);
  expect(operator.origin).toStrictEqual({ x: 0, y: 0 });
  expect(operator.points).toStrictEqual([
    0,
    0,
    1,
    1,
    2,
    2,
    3,
    3,
    4,
    3,
    5,
    3,
    0,
    0,
  ]);
});
