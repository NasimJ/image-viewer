import React, { useState } from "react";
import * as ReactKonva from "react-konva";
import { Image as ImageType } from "../../types/Image";
import { Stage } from "konva/types/Stage";
import { Image } from "konva/types/shapes/Image";
import useImage from "use-image";
import * as ImageJS from "image-js";
import { Vector2d } from "konva/types/types";
import { FloodImage, floodPixels, makeFloodMap } from "../../image/flood";
import { Category } from "../../types/Category";

type ColorSelectionProps = {
  image: ImageType;
  category: Category;
};

export const ColorSelection = ({ image, category }: ColorSelectionProps) => {
  const [img] = useImage(image.src, "Anonymous");
  // const [toleranceMap, setToleranceMap] = useState<ImageJS.Image>();

  const [overlayData, setOverlayData] = useState<string>("");
  const [overlayImage] = useImage(overlayData, "Anonymous");

  const stageRef = React.useRef<Stage>(null);
  const imageRef = React.useRef<Image>(null);
  const overlayRef = React.useRef<Image>(null);

  const [mouseHeld, setMouseHeld] = useState<boolean>(false);
  const [initialPosition, setInitialPosition] = useState<Vector2d>();
  const [tolerance, setTolerance] = useState<number>(1);

  const [imageData, setImageData] = useState<FloodImage>();
  const updateOverlay = (position: { x: any; y: any }) => {
    const results = floodPixels({
      x: position.x,
      y: position.y,
      image: imageData!,
      tolerance: tolerance,
      color: category.color,
    });
    // const results = updateFlood({
    //   x: position.x,
    //   y: position.y,
    //   floodImage: imageData!,
    //   newTolerance: tolerance,
    //   color: category.color,
    // });
    // setImageData(results);
    setOverlayData(results);
  };

  React.useEffect(() => {
    if (imageRef && imageRef.current) {
      imageRef.current.cache();

      imageRef.current.getLayer()?.batchDraw();
    }
  }, [img]);

  const onMouseDown = async () => {
    setTolerance(1);
    setMouseHeld(true);
    let jsImage;
    if (imageRef.current && !imageData) {
      jsImage = await ImageJS.Image.load(imageRef.current.toDataURL());
      setImageData(jsImage as FloodImage);
      return;
    }
    if (stageRef && stageRef.current) {
      const position = stageRef.current.getPointerPosition();

      if (position) {
        if (imageRef && imageRef.current) {
          if (position !== initialPosition) {
            setInitialPosition(position);
            setImageData(
              makeFloodMap({
                x: position.x,
                y: position.y,
                image: imageData!,
              })
            );
          }
          updateOverlay(position);
        }
      }
    }
  };

  const onMouseMove = async () => {
    if (mouseHeld && stageRef && stageRef.current) {
      const newPosition = stageRef.current.getPointerPosition();
      if (newPosition && initialPosition) {
        const diff = Math.ceil(
          Math.hypot(
            newPosition.x - initialPosition!.x,
            newPosition.y - initialPosition!.y
          )
        );
        if (diff !== tolerance) {
          setTolerance(diff);
          updateOverlay(initialPosition);
        }
      }
    }
  };

  const onMouseUp = () => {
    setMouseHeld(false);
  };

  return (
    <ReactKonva.Stage
      globalCompositeOperation="destination-over"
      height={image.shape?.r}
      ref={stageRef}
      width={image.shape?.c}
    >
      <ReactKonva.Layer
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        <ReactKonva.Image image={img} ref={imageRef} />
        <ReactKonva.Image image={overlayImage} ref={overlayRef} />
        {mouseHeld && initialPosition && (
          <ReactKonva.Label x={initialPosition.x} y={initialPosition.y}>
            <ReactKonva.Tag
              fill={"#f0ce0f"}
              stroke={"#907c09"}
              shadowColor={"black"}
              pointerDirection={"up"}
              pointerWidth={10}
              pointerHeight={10}
              cornerRadius={5}
            />
            <ReactKonva.Text text={tolerance.toString()} padding={5} />
          </ReactKonva.Label>
        )}
      </ReactKonva.Layer>
    </ReactKonva.Stage>
  );
};
