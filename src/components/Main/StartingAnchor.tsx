import * as ReactKonva from "react-konva";
import React, { RefObject } from "react";
import { Circle } from "konva/types/shapes/Circle";

type StartingAnchorProps = {
  selecting: boolean;
  origin?: { x: number; y: number };
  ref: RefObject<Circle>;
};

export const StartingAnchor = React.forwardRef<Circle, StartingAnchorProps>(
  (props, ref) => {
    if (props.selecting && props.origin) {
      return (
        <ReactKonva.Circle
          fill="#000"
          globalCompositeOperation="source-over"
          hitStrokeWidth={64}
          id="start"
          name="anchor"
          radius={3}
          ref={ref}
          stroke="#FFF"
          strokeWidth={1}
          x={props.origin.x}
          y={props.origin.y}
        />
      );
    } else {
      return <React.Fragment />;
    }
  }
);
