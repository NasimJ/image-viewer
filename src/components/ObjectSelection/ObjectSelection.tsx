import React, { useEffect, useState } from "react";
import { Image as ImageViewerImage } from "../../types/Image";
import * as ReactKonva from "react-konva";
import useImage from "use-image";
import { Stage } from "konva/types/Stage";
import { Box, Transformer } from "konva/types/shapes/Transformer";
import { Rect } from "konva/types/shapes/Rect";
import { Category } from "../../types/Category";
import { toRGBA } from "../../image/toRGBA";
import { useDispatch } from "react-redux";
import { projectSlice } from "../../store/slices";
import { BoundingBox } from "../../types/BoundingBox";
import * as tensorflow from "@tensorflow/tfjs";
import { Image as KonvaImage } from "konva/types/shapes/Image";
// import { getIdx } from "../../../image/imageHelper";
// import { validNeighbours } from "../../../image/GraphHelper";

export const useKeyPress = (key: string, action: () => void) => {
  useEffect(() => {
    function onKeyup(e: any) {
      if (e.key === key) action();
    }

    window.addEventListener("keyup", onKeyup);
    return () => window.removeEventListener("keyup", onKeyup);
  }, [action, key]);
};

type ObjectSelectionProps = {
  data: ImageViewerImage;
  category: Category;
};

// const getBoundariesFromMask = (
//   maskData: Uint8ClampedArray,
//   height: number,
//   width: number
// ) => {
//   const coordinates: { x: number; y: number }[] = [];
//
//   const idx = getIdx(width, 4);
//
//   for (let x = 0; x < width; x++) {
//     for (let y = 0; y < width; y++) {
//       const pixel = maskData[idx(x, y, 0)];
//       if (pixel === 255) {
//         const neighborsIdx = validNeighbours(x, y, height, width);
//         for (let neighborIdx of neighborsIdx) {
//           const neighbor = maskData[idx(neighborIdx.x, neighborIdx.y, 0)];
//           if (neighbor === 0) {
//             coordinates.push({ x: x, y: y });
//             break;
//           }
//         }
//       }
//     }
//   }
//
//   return coordinates;
// };

export const ObjectSelection = ({ data, category }: ObjectSelectionProps) => {
  const dispatch = useDispatch();
  const [image] = useImage(data.src, "Anonymous");
  const stage = React.useRef<Stage>(null);
  const transformer = React.useRef<Transformer>(null);
  const shapeRef = React.useRef<Rect>(null);
  const imageRef = React.useRef<KonvaImage>(null);
  const maskRef = React.useRef<HTMLCanvasElement>(null);
  const maskDataRef = React.useRef<Uint8ClampedArray | null>(null);
  const [x, setX] = React.useState<number>();
  const [y, setY] = React.useState<number>();
  const [height, setHeight] = React.useState<number>(0);
  const [width, setWidth] = React.useState<number>(0);
  const [annotated, setAnnotated] = useState<boolean>();
  const [annotating, setAnnotating] = useState<boolean>();
  const [offset, setOffset] = useState<number>(0);
  const [model, setModel] = useState<tensorflow.LayersModel>();
  const [crop, setCrop] = useState<HTMLImageElement>();

  useEffect(() => {
    const createModel = async () => {
      // FIXME: should be a local file
      const pathname =
        "https://raw.githubusercontent.com/zaidalyafeai/HostedModels/master/unet-128/model.json";

      const graph = await tensorflow.loadLayersModel(pathname);

      const optimizer = tensorflow.train.adam();

      graph.compile({
        optimizer: optimizer,
        loss: "categoricalCrossentropy",
        metrics: ["accuracy"],
      });

      setModel(graph);
    };

    createModel();
  }, [model]);

  useEffect(() => {
    // FIXME: should only execute when selection is made
    const f = async () => {
      if (imageRef && imageRef.current) {
        const config = {
          callback: (cropped: HTMLImageElement) => {
            setCrop(cropped);
          },
          height: height,
          width: width,
          x: x,
          y: y,
        };

        imageRef.current.toImage(config);
      }
    };

    f();
  }, [height, width, x, y]);

  const validateBoundBox = (oldBox: Box, newBox: Box) => {
    if (
      0 <= newBox.x &&
      newBox.width + newBox.x <= data.shape!.c &&
      0 <= newBox.y &&
      newBox.height + newBox.y <= data.shape!.r
    ) {
      return newBox;
    } else {
      return oldBox;
    }
  };

  useKeyPress("Escape", () => {
    setAnnotating(false);
    setAnnotated(false);
  });

  useKeyPress("Enter", () => {
    if (shapeRef && shapeRef.current) {
      const mask = shapeRef.current.toDataURL({
        callback(data: string) {
          return data;
        },
      });

      const { x, y, width, height } = shapeRef.current.getClientRect();

      const boundingBox: BoundingBox = {
        maximum: {
          r: y + height,
          c: x + width,
        },
        minimum: {
          r: y,
          c: x,
        },
      };

      const payload = {
        boundingBox: boundingBox,
        categoryId: category.id,
        id: data.id,
        mask: mask,
      };

      dispatch(projectSlice.actions.createImageInstance(payload));
    }

    setAnnotating(false);
    setAnnotated(false);
  });

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(offset + 1);

      if (offset > 32) {
        setOffset(0);
      }
    }, 200);

    return () => clearTimeout(timer);
  });

  React.useEffect(() => {
    if (annotated && !annotating) {
      // we need to attach transformer manually
      if (transformer && transformer.current && shapeRef && shapeRef.current) {
        transformer.current.nodes([shapeRef.current]);

        const layer = transformer.current.getLayer();

        if (layer) {
          layer.batchDraw();
        }
      }
    }
  }, [annotated, annotating]);

  const onMouseDown = () => {
    if (annotated) {
      return;
    }

    setAnnotating(true);

    if (stage && stage.current) {
      const position = stage.current.getPointerPosition();

      if (position) {
        setX(position.x);
        setY(position.y);
      }
    }
  };

  const onMouseMove = () => {
    if (annotated) {
      return;
    }

    if (stage && stage.current) {
      const position = stage.current.getPointerPosition();

      if (x && y && position) {
        setHeight(position.y - y);
        setWidth(position.x - x);
      }
    }
  };

  const onMouseUp = async () => {
    if (annotated) {
      return;
    }

    if (!annotating) {
      return;
    }

    const mask = tensorflow.tidy(() => {
      if (crop) {
        const cropped: tensorflow.Tensor3D = tensorflow.browser.fromPixels(
          crop
        );

        const size: [number, number] = [128, 128];
        const resized = tensorflow.image.resizeBilinear(cropped, size);
        const standardized = resized.div(tensorflow.scalar(255));
        const batch = standardized.expandDims(0);

        if (model) {
          const prediction = model.predict(
            batch
          ) as tensorflow.Tensor<tensorflow.Rank>;

          return prediction
            .squeeze([0])
            .tile([1, 1, 3])
            .sub(0.3)
            .sign()
            .relu()
            .resizeBilinear([height, width]);
        }
      }
    });

    if (maskRef && maskRef.current && mask) {
      maskDataRef.current = await tensorflow.browser.toPixels(
        mask as tensorflow.Tensor3D,
        maskRef.current
      );

      tensorflow.dispose(mask);

      // const boundaries = getBoundariesFromMask(
      //   maskDataRef.current,
      //   height,
      //   width
      // );
    }

    setAnnotated(true);
    setAnnotating(false);
  };

  return (
    <React.Fragment>
      <ReactKonva.Stage
        globalCompositeOperation="destination-over"
        height={data.shape?.r}
        ref={stage}
        width={data.shape?.c}
      >
        <ReactKonva.Layer
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
        >
          <ReactKonva.Image image={image} ref={imageRef} />

          {!annotated && annotating && x && y && (
            <React.Fragment>
              <ReactKonva.Rect
                x={x}
                y={y}
                height={height}
                width={width}
                stroke="black"
                strokeWidth={1}
              />
              <ReactKonva.Rect
                x={x}
                y={y}
                height={height}
                width={width}
                stroke="white"
                dash={[4, 2]}
                dashOffset={-offset}
                strokeWidth={1}
              />
            </React.Fragment>
          )}

          {annotated && !annotating && x && y && (
            <ReactKonva.Rect
              dash={[4, 2]}
              dashOffset={-offset}
              height={height}
              ref={shapeRef}
              stroke="white"
              strokeWidth={1}
              fill={toRGBA(category.color, 0.3)}
              width={width}
              x={x}
              y={y}
            />
          )}

          {annotated && !annotating && x && y && (
            <ReactKonva.Transformer
              anchorFill="#FFF"
              anchorSize={6}
              anchorStroke="#000"
              anchorStrokeWidth={1}
              borderEnabled={false}
              boundBoxFunc={validateBoundBox}
              keepRatio={false}
              ref={transformer}
              rotateEnabled={false}
            />
          )}
        </ReactKonva.Layer>
      </ReactKonva.Stage>

      <canvas ref={maskRef} />
    </React.Fragment>
  );
};
