import React, {useRef, useState} from "react";
import * as ReactKonva from "react-konva";
import {Image} from "../../types/Image";
import {KonvaEventObject} from "konva/types/Node";
import useImage from "use-image";
import {Stage} from "konva/types/Stage";

export enum Method {
  Elliptical,
  Lasso,
  Magnetic,
  Polygonal,
  Quick,
  Rectangular,
}

type Anchor = {
  x: number;
  y: number;
};

type KonvaLassoSelectionCanvasProps = {
  image: Image;
};

type Stroke = {
  method: Method;
  points: Array<number>;
};

export const KonvaLassoSelectionCanvas = ({image}: KonvaLassoSelectionCanvasProps) => {
  const [img] = useImage(image.src);

  const [annotating, setAnnotating] = useState<boolean>(false);
  const [anchor, setAnchor] = useState<Anchor>();
  const [start, setStart] = useState<Anchor>();
  const [strokes, setStrokes] = useState<Array<Stroke>>([]);

  const connected = (stage: Stage, position: { x: number, y: number }): boolean => {
    return !!stage.getIntersection(
      position,
      ".starting-anchor"
    );
  }

  const onMouseDown = (event: KonvaEventObject<MouseEvent>) => {
    const stage = event.target.getStage();

    if (stage) {
      const position = stage.getPointerPosition();

      if (position) {
        if (connected(stage, position)) {
          setAnnotating(false);
        } else {
          if (anchor) {
            const stroke = {
              method: Method.Lasso,
              points: [anchor.x, anchor.y, position.x, position.y]
            }

            setStrokes([...strokes, stroke]);

            setAnchor(position);
          } else {
            setAnnotating(true);

            setStart(position);

            const stroke: Stroke = {
              method: Method.Lasso,
              points: [position.x, position.y],
            };

            setStrokes([...strokes, stroke]);
          }
        }
      }
    }
  };

  const onMouseMove = (event: KonvaEventObject<MouseEvent>) => {
    if (!annotating) return;

    const stage = event.target.getStage();

    if (stage) {
      const position = stage.getPointerPosition();

      if (position) {
        if (anchor) {
          const stroke = {
            method: Method.Lasso,
            points: [anchor.x, anchor.y, position.x, position.y]
          }

          if (strokes.length > 2) {
            strokes.splice(strokes.length - 1, 1, stroke);

            setStrokes(strokes.concat());
          } else {
            setStrokes([...strokes, stroke]);
          }
        } else {
          let stroke = strokes[strokes.length - 1];

          stroke.points = [...stroke.points, position.x, position.y];

          strokes.splice(strokes.length - 1, 1, stroke);

          setStrokes(strokes.concat());

          if (connected(stage, position)) {

          } else {

          }
        }
      }
    }
  };

  const onMouseUp = (event: KonvaEventObject<MouseEvent>) => {
    if (!annotating) return;

    const stage = event.target.getStage();

    if (stage) {
      const position = stage.getPointerPosition();

      if (position) {
        if (connected(stage, position)) {
          setAnnotating(false);
        } else {
          setAnchor(position);
        }
      }
    }
  };

  const Anchor = () => {
    if (anchor) {
      return (
        <ReactKonva.Circle
          fill="#FFF"
          name="anchor"
          radius={3}
          stroke="#FFF"
          strokeWidth={1}
          x={anchor.x}
          y={anchor.y}
        />
      );
    } else {
      return <React.Fragment/>
    }
  };

  const StartingAnchor = () => {
    if (start) {
      return (
        <ReactKonva.Circle
          fill="#000"
          globalCompositeOperation="source-over"
          hitStrokeWidth={64}
          name="starting-anchor"
          radius={3}
          stroke="#FFF"
          strokeWidth={1}
          x={start.x}
          y={start.y}
        />
      );
    } else {
      return <React.Fragment/>
    }
  }

  return (
    <ReactKonva.Stage
      globalCompositeOperation="destination-over"
      height={image.shape?.r}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      width={image.shape?.c}
    >
      <ReactKonva.Layer>
        <ReactKonva.Image image={img} />

        <StartingAnchor />

        {strokes.map((stroke: Stroke, key: number) => {
          return (
            <ReactKonva.Line
              dash={[4, 2]}
              key={key}
              points={stroke.points}
              stroke="#df4b26"
            />
          );
        })}

        <Anchor/>
      </ReactKonva.Layer>
    </ReactKonva.Stage>
  );
};
