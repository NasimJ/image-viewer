import * as ReactKonva from "react-konva";
import React, {useEffect, useRef, useState} from "react";
import useImage from "use-image";
import {BoundingBox} from "../../types/BoundingBox";
import {Category} from "../../types/Category";
import {Ellipse} from "konva/types/shapes/Ellipse";
import {ImageViewerOperation} from "../../types/ImageViewerOperation";
import {Rect} from "konva/types/shapes/Rect";
import {Stage} from "konva/types/Stage";
import {projectSlice} from "../../store/slices";
import {toRGBA} from "../../image/toRGBA";
import {useDispatch, useSelector} from "react-redux";
import {useMarchingAnts, useSelection} from "../../hooks";
import {useStyles} from "./Main.css";
import {Circle} from "konva/types/shapes/Circle";
import {Line} from "konva/types/shapes/Line";
import * as _ from "underscore";
import {RectangularSelection} from "./RectangularSelection";
import {StartingAnchor} from "./StartingAnchor";
import {ZoomSelection} from "./ZoomSelection";
import {imageViewerZoomModeSelector} from "../../store/selectors/imageViewerZoomModeSelector";
import {imageViewerImageSelector, imageViewerOperationSelector,} from "../../store/selectors";

type MainProps = {
  activeCategory: Category;
  zoomReset: boolean;
};

export const Main = ({ activeCategory, zoomReset }: MainProps) => {
  const dispatch = useDispatch();

  const image = useSelector(imageViewerImageSelector);

  const [img] = useImage(image!.src, "Anonymous");
  const dashOffset = useMarchingAnts();
  const classes = useStyles();
  const stageRef = useRef<Stage>(null);
  const imageRef = useRef<any>(null);

  const activeOperation = useSelector(imageViewerOperationSelector);

  /*
   * Color selection
   */
  const ColorSelection = () => {
    return null;
  };

  const onColorSelection = () => {};

  const onColorSelectionMouseDown = (position: { x: number; y: number }) => {};

  const onColorSelectionMouseMove = (position: { x: number; y: number }) => {};

  const onColorSelectionMouseUp = (position: { x: number; y: number }) => {};

  /*
   * Elliptical selection
   */
  const ellipticalSelectionRef = React.useRef<Ellipse>(null);

  const [
    ellipticalSelectionStartX,
    setEllipticalSelectionStartX,
  ] = React.useState<number>(0);

  const [
    ellipticalSelectionStartY,
    setEllipticalSelectionStartY,
  ] = React.useState<number>(0);

  const [
    ellipticalSelectionCenterX,
    setEllipticalSelectionCenterX,
  ] = React.useState<number>();

  const [
    ellipticalSelectionCenterY,
    setEllipticalSelectionCenterY,
  ] = React.useState<number>();

  const [
    ellipticalSelectionRadiusX,
    setEllipticalSelectionRadiusX,
  ] = React.useState<number>(0);

  const [
    ellipticalSelectionRadiusY,
    setEllipticalSelectionRadiusY,
  ] = React.useState<number>(0);

  const EllipticalSelection = () => {
    if (annotated && !annotating) {
      return (
        <ReactKonva.Ellipse
          dash={[4, 2]}
          dashOffset={-dashOffset}
          radiusX={ellipticalSelectionRadiusX}
          radiusY={ellipticalSelectionRadiusY}
          ref={ellipticalSelectionRef}
          stroke="white"
          strokeWidth={1}
          x={ellipticalSelectionCenterX}
          y={ellipticalSelectionCenterY}
          fill={toRGBA(activeCategory.color, 0.3)}
        />
      );
    } else if (!annotated && annotating) {
      return (
        <React.Fragment>
          <ReactKonva.Ellipse
            radiusX={ellipticalSelectionRadiusX}
            radiusY={ellipticalSelectionRadiusY}
            stroke="black"
            strokeWidth={1}
            x={ellipticalSelectionCenterX}
            y={ellipticalSelectionCenterY}
          />
          <ReactKonva.Ellipse
            dash={[4, 2]}
            dashOffset={-dashOffset}
            radiusX={ellipticalSelectionRadiusX}
            radiusY={ellipticalSelectionRadiusY}
            stroke="white"
            strokeWidth={1}
            x={ellipticalSelectionCenterX}
            y={ellipticalSelectionCenterY}
          />
        </React.Fragment>
      );
    } else {
      return null;
    }
  };

  const onEllipticalSelection = () => {};

  const onEllipticalSelectionMouseDown = (position: {
    x: number;
    y: number;
  }) => {
    setEllipticalSelectionStartX(position.x);

    setEllipticalSelectionStartY(position.y);
  };

  const onEllipticalSelectionMouseMove = (position: {
    x: number;
    y: number;
  }) => {
    if (ellipticalSelectionStartX && ellipticalSelectionStartY) {
      setEllipticalSelectionCenterX(
        (position.x - ellipticalSelectionStartX) / 2 + ellipticalSelectionStartX
      );

      setEllipticalSelectionCenterY(
        (position.y - ellipticalSelectionStartY) / 2 + ellipticalSelectionStartY
      );

      setEllipticalSelectionRadiusX(
        Math.abs((position.x - ellipticalSelectionStartX) / 2)
      );

      setEllipticalSelectionRadiusY(
        Math.abs((position.y - ellipticalSelectionStartY) / 2)
      );
    }
  };

  const onEllipticalSelectionMouseUp = (position: {
    x: number;
    y: number;
  }) => {};

  /*
   * Lasso selection
   */
  const lassoSelectionRef = React.useRef<Line>(null);

  const lassoSelectionStartingAnchorCircleRef = React.useRef<Circle>(null);

  const [lassoSelectionAnchor, setLassoSelectionAnchor] = useState<{
    x: number;
    y: number;
  }>();

  const [lassoSelectionAnnotation, setLassoSelectionAnnotation] = useState<{
    points: Array<number>;
  }>();

  const [lassoSelectionCanClose, setLassoSelectionCanClose] = useState<boolean>(
    false
  );

  const [
    lassoSelectionEarlyRelease,
    setLassoSelectionEarlyRelease,
  ] = useState<boolean>(false);

  const [lassoSelectionStart, setLassoSelectionStart] = useState<{
    x: number;
    y: number;
  }>();

  const [lassoSelectionStrokes, setLassoSelectionStrokes] = useState<
    Array<{ points: Array<number> }>
  >([]);

  const LassoSelectionAnchor = () => {
    if (
      annotating &&
      lassoSelectionAnchor &&
      lassoSelectionStrokes.length > 1
    ) {
      return (
        <ReactKonva.Circle
          fill="#FFF"
          name="anchor"
          radius={3}
          stroke="#FFF"
          strokeWidth={1}
          x={lassoSelectionAnchor.x}
          y={lassoSelectionAnchor.y}
        />
      );
    } else {
      return <React.Fragment />;
    }
  };

  const LassoSelection = () => {
    if (annotated && !annotating) {
      return (
        <React.Fragment>
          <StartingAnchor
            annotating={annotating}
            position={lassoSelectionStart}
            ref={lassoSelectionStartingAnchorCircleRef}
          />

          <LassoSelectionAnchor />

          {lassoSelectionAnnotation && (
            <React.Fragment>
              <ReactKonva.Line
                points={lassoSelectionAnnotation.points}
                stroke="black"
                strokeWidth={1}
              />

              <ReactKonva.Line
                closed
                dash={[4, 2]}
                dashOffset={-dashOffset}
                fill={toRGBA(activeCategory.color, 0.3)}
                points={lassoSelectionAnnotation.points}
                ref={lassoSelectionRef}
                stroke="white"
                strokeWidth={1}
              />
            </React.Fragment>
          )}
        </React.Fragment>
      );
    } else if (!annotated && annotating) {
      return (
        <React.Fragment>
          <StartingAnchor
            annotating={annotating}
            position={lassoSelectionStart}
            ref={lassoSelectionStartingAnchorCircleRef}
          />

          {lassoSelectionStrokes.map(
            (stroke: { points: Array<number> }, key: number) => {
              return (
                <React.Fragment>
                  <ReactKonva.Line
                    key={key}
                    points={stroke.points}
                    stroke="black"
                    strokeWidth={1}
                  />

                  <ReactKonva.Line
                    closed={false}
                    dash={[4, 2]}
                    dashOffset={-dashOffset}
                    fill="None"
                    key={key}
                    points={stroke.points}
                    stroke="white"
                    strokeWidth={1}
                  />
                </React.Fragment>
              );
            }
          )}
        </React.Fragment>
      );
    } else {
      return null;
    }
  };

  const isInside = (
    startingAnchorCircle: React.RefObject<Circle>,
    position: { x: number; y: number }
  ) => {
    if (
      lassoSelectionStartingAnchorCircleRef &&
      lassoSelectionStartingAnchorCircleRef.current
    ) {
      const rectangle = lassoSelectionStartingAnchorCircleRef.current.getClientRect();
      return (
        rectangle.x <= position.x &&
        position.x <= rectangle.x + rectangle.width &&
        rectangle.y <= position.y &&
        position.y <= rectangle.y + rectangle.height
      );
    } else {
      return false;
    }
  };

  const connected = (position: { x: number; y: number }) => {
    const inside = isInside(lassoSelectionStartingAnchorCircleRef, position);
    if (lassoSelectionStrokes && lassoSelectionStrokes.length > 0) {
      return inside && lassoSelectionCanClose;
    }
  };

  const onLassoSelection = () => {};

  const onLassoSelectionMouseDown = (position: { x: number; y: number }) => {
    if (connected(position)) {
      const stroke: { points: Array<number> } = {
        points: _.flatten(
          lassoSelectionStrokes.map(
            (stroke: { points: Array<number> }) => stroke.points
          )
        ),
      };

      setAnnotated(true);
      setAnnotating(false);
      setLassoSelectionAnnotation(stroke);
      setLassoSelectionStrokes([]);
    } else {
      if (!lassoSelectionEarlyRelease) {
        if (lassoSelectionAnchor) {
          const stroke = {
            points: [
              lassoSelectionAnchor.x,
              lassoSelectionAnchor.y,
              position.x,
              position.y,
            ],
          };

          setLassoSelectionStrokes([...lassoSelectionStrokes, stroke]);

          setLassoSelectionAnchor(position);
        } else {
          setAnnotating(true);

          setLassoSelectionStart(position);

          const stroke: { points: Array<number> } = {
            points: [position.x, position.y],
          };

          setLassoSelectionStrokes([...lassoSelectionStrokes, stroke]);
        }
      } else {
        setLassoSelectionEarlyRelease(false);
      }
    }
  };

  const onLassoSelectionMouseMove = (position: { x: number; y: number }) => {
    if (
      !lassoSelectionCanClose &&
      !isInside(lassoSelectionStartingAnchorCircleRef, position)
    ) {
      setLassoSelectionCanClose(true);
    }

    if (lassoSelectionAnchor && !lassoSelectionEarlyRelease) {
      const stroke = {
        points: [
          lassoSelectionAnchor.x,
          lassoSelectionAnchor.y,
          position.x,
          position.y,
        ],
      };

      if (lassoSelectionStrokes.length > 2) {
        lassoSelectionStrokes.splice(
          lassoSelectionStrokes.length - 1,
          1,
          stroke
        );

        setLassoSelectionStrokes(lassoSelectionStrokes.concat());
      } else {
        setLassoSelectionStrokes([...lassoSelectionStrokes, stroke]);
      }
    } else {
      let stroke = lassoSelectionStrokes[lassoSelectionStrokes.length - 1];

      stroke.points = [...stroke.points, position.x, position.y];

      lassoSelectionStrokes.splice(lassoSelectionStrokes.length - 1, 1, stroke);

      setLassoSelectionStrokes(lassoSelectionStrokes.concat());

      if (connected(position)) {
        //  TODO:
      } else {
        //  TODO:
      }
    }
  };

  const onLassoSelectionMouseUp = (position: { x: number; y: number }) => {
    if (connected(position)) {
      if (lassoSelectionStart) {
        const stroke = {
          points: [
            position.x,
            position.y,
            lassoSelectionStart.x,
            lassoSelectionStart.y,
          ],
        };

        setLassoSelectionStrokes([...lassoSelectionStrokes, stroke]);
      }

      const stroke: { points: Array<number> } = {
        points: _.flatten(
          lassoSelectionStrokes.map(
            (stroke: { points: Array<number> }) => stroke.points
          )
        ),
      };

      setAnnotated(true);
      setAnnotating(false);
      setLassoSelectionAnnotation(stroke);
      setLassoSelectionStrokes([]);
    } else {
      if (
        !lassoSelectionAnchor &&
        lassoSelectionStrokes[lassoSelectionStrokes.length - 1].points.length <=
          2
      ) {
        setLassoSelectionEarlyRelease(true);
      }
      setLassoSelectionAnchor(position);
    }
  };

  /*
   * Magnetic selection
   */
  const MagneticSelection = () => {
    return <React.Fragment/>
  };

  const onMagneticSelection = () => {};

  const onMagneticSelectionMouseDown = (position: { x: number; y: number }) => {};

  const onMagneticSelectionMouseMove = (position: { x: number; y: number }) => {};

  const onMagneticSelectionMouseUp = (position: { x: number; y: number }) => {};

  /*
   * Object selection
   */
  const ObjectSelection = () => {
    return null;
  };

  const onObjectSelection = () => {};

  const onObjectSelectionMouseDown = (position: { x: number; y: number }) => {};

  const onObjectSelectionMouseMove = (position: { x: number; y: number }) => {};

  const onObjectSelectionMouseUp = (position: { x: number; y: number }) => {};

  /*
   * Polygonal selection
   */
  const polygonalSelectionStartingAnchorCircleRef = React.useRef<Circle>(null);

  const [polygonalSelectionAnchor, setPolygonalSelectionAnchor] = useState<{
    x: number;
    y: number;
  }>();

  const [
    polygonalSelectionAnnotation,
    setPolygonalSelectionAnnotation,
  ] = useState<{ points: Array<number> }>();

  const [
    polygonalSelectionCanClose,
    setPolygonalSelectionCanClose,
  ] = useState<boolean>(false);

  const [polygonalSelectionStart, setPolygonalSelectionStart] = useState<{
    x: number;
    y: number;
  }>();

  const [polygonalSelectionStrokes, setPolygonalSelectionStrokes] = useState<
    Array<{ points: Array<number> }>
  >([]);

  const PolygonalSelectionAnchor = () => {
    if (
      annotating &&
      polygonalSelectionAnchor &&
      polygonalSelectionStrokes.length > 1
    ) {
      return (
        <ReactKonva.Circle
          fill="#FFF"
          name="anchor"
          radius={3}
          stroke="#FFF"
          strokeWidth={1}
          x={polygonalSelectionAnchor.x}
          y={polygonalSelectionAnchor.y}
        />
      );
    } else {
      return <React.Fragment />;
    }
  };

  const PolygonalSelection = () => {
    if (annotated && !annotating) {
      return (
        <React.Fragment>
          <StartingAnchor
            annotating={annotating}
            position={polygonalSelectionStart}
            ref={polygonalSelectionStartingAnchorCircleRef}
          />

          <PolygonalSelectionAnchor />

          {polygonalSelectionAnnotation && (
            <React.Fragment>
              <ReactKonva.Line
                points={polygonalSelectionAnnotation.points}
                stroke="black"
                strokeWidth={1}
              />

              <ReactKonva.Line
                closed
                dash={[4, 2]}
                dashOffset={-dashOffset}
                fill={activeCategory.color}
                points={polygonalSelectionAnnotation.points}
                stroke="white"
                strokeWidth={1}
              />
            </React.Fragment>
          )}
        </React.Fragment>
      );
    } else if (!annotated && annotating) {
      return (
        <React.Fragment>
          <StartingAnchor
            annotating={annotating}
            position={polygonalSelectionStart}
            ref={polygonalSelectionStartingAnchorCircleRef}
          />

          {polygonalSelectionStrokes.map(
            (stroke: { points: Array<number> }, key: number) => {
              return (
                <React.Fragment>
                  <ReactKonva.Line
                    key={key}
                    points={stroke.points}
                    stroke="black"
                    strokeWidth={1}
                  />

                  <ReactKonva.Line
                    closed={false}
                    dash={[4, 2]}
                    dashOffset={-dashOffset}
                    fill="None"
                    key={key}
                    points={stroke.points}
                    stroke="white"
                    strokeWidth={1}
                  />
                </React.Fragment>
              );
            }
          )}

          <PolygonalSelectionAnchor />
        </React.Fragment>
      );
    } else {
      return null;
    }
  };

  const onPolygonalSelection = () => {};

  const onPolygonalSelectionMouseDown = (position: {
    x: number;
    y: number;
  }) => {
    if (connected(position)) {
      const stroke: { points: Array<number> } = {
        points: _.flatten(
          polygonalSelectionStrokes.map(
            (stroke: { points: Array<number> }) => stroke.points
          )
        ),
      };

      setAnnotated(true);

      setAnnotating(false);

      setPolygonalSelectionAnnotation(stroke);

      setPolygonalSelectionStrokes([]);
    } else {
      if (polygonalSelectionAnchor) {
        const stroke = {
          points: [
            polygonalSelectionAnchor.x,
            polygonalSelectionAnchor.y,
            position.x,
            position.y,
          ],
        };

        setPolygonalSelectionStrokes([...polygonalSelectionStrokes, stroke]);

        setPolygonalSelectionAnchor(position);
      } else if (polygonalSelectionStart) {
        const stroke = {
          points: [
            polygonalSelectionStart.x,
            polygonalSelectionStart.y,
            position.x,
            position.y,
          ],
        };

        setPolygonalSelectionStrokes([...polygonalSelectionStrokes, stroke]);

        setPolygonalSelectionAnchor(position);
      } else {
        setAnnotating(true);

        setPolygonalSelectionStart(position);
      }
    }
  };

  const onPolygonalSelectionMouseMove = (position: {
    x: number;
    y: number;
  }) => {
    if (
      !polygonalSelectionCanClose &&
      !isInside(polygonalSelectionStartingAnchorCircleRef, position)
    ) {
      setPolygonalSelectionCanClose(true);
    }

    if (polygonalSelectionAnchor) {
      const stroke = {
        points: [
          polygonalSelectionAnchor.x,
          polygonalSelectionAnchor.y,
          position.x,
          position.y,
        ],
      };
      polygonalSelectionStrokes.splice(
        polygonalSelectionStrokes.length - 1,
        1,
        stroke
      );

      setPolygonalSelectionStrokes(polygonalSelectionStrokes.concat());
    } else if (polygonalSelectionStart) {
      const stroke = {
        points: [
          polygonalSelectionStart.x,
          polygonalSelectionStart.y,
          position.x,
          position.y,
        ],
      };

      polygonalSelectionStrokes.splice(
        polygonalSelectionStrokes.length - 1,
        1,
        stroke
      );

      setPolygonalSelectionStrokes(polygonalSelectionStrokes.concat());
    }
  };

  const onPolygonalSelectionMouseUp = (position: { x: number; y: number }) => {
    if (connected(position)) {
      if (polygonalSelectionStart) {
        const stroke = {
          points: [
            position.x,
            position.y,
            polygonalSelectionStart.x,
            polygonalSelectionStart.y,
          ],
        };

        setPolygonalSelectionStrokes([...polygonalSelectionStrokes, stroke]);
      }

      const stroke: { points: Array<number> } = {
        points: _.flatten(
          polygonalSelectionStrokes.map(
            (stroke: { points: Array<number> }) => stroke.points
          )
        ),
      };

      setAnnotated(true);

      setAnnotating(false);

      setPolygonalSelectionAnnotation(stroke);

      setPolygonalSelectionStrokes([]);
    } else {
      if (polygonalSelectionStrokes.length === 1) {
        setPolygonalSelectionAnchor(position);

        if (polygonalSelectionStart) {
          const stroke = {
            points: [
              polygonalSelectionStart!.x,
              polygonalSelectionStart!.y,
              position.x,
              position.y,
            ],
          };

          setPolygonalSelectionStrokes([...polygonalSelectionStrokes, stroke]);
        }
      }
    }
  };

  /*
   * Quick selection
   */
  const QuickSelection = () => {
    return null;
  };

  const onQuickSelection = () => {};

  const onQuickSelectionMouseDown = (position: { x: number; y: number }) => {};

  const onQuickSelectionMouseMove = (position: { x: number; y: number }) => {};

  const onQuickSelectionMouseUp = (position: { x: number; y: number }) => {};

  /*
   * Rectangular selection
   */
  const rectangularSelectionRef = React.useRef<Rect>(null);

  const [
    rectangularSelectionX,
    setRectangularSelectionX,
  ] = React.useState<number>();

  const [
    rectangularSelectionY,
    setRectangularSelectionY,
  ] = React.useState<number>();

  const [
    rectangularSelectionHeight,
    setRectangularSelectionHeight,
  ] = React.useState<number>(0);

  const [
    rectangularSelectionWidth,
    setRectangularSelectionWidth,
  ] = React.useState<number>(0);

  const onRectangularSelection = () => {
    if (rectangularSelectionRef && rectangularSelectionRef.current) {
      const mask = rectangularSelectionRef.current.toDataURL({
        callback(data: string) {
          return data;
        },
      });

      const {
        x,
        y,
        width,
        height,
      } = rectangularSelectionRef.current.getClientRect();

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
        categoryId: activeCategory.id,
        id: image!.id,
        mask: mask,
      };

      dispatch(projectSlice.actions.createImageInstance(payload));
    }
  };

  const onRectangularSelectionMouseDown = (position: {
    x: number;
    y: number;
  }) => {
    setRectangularSelectionX(position.x);
    setRectangularSelectionY(position.y);
  };

  const onRectangularSelectionMouseMove = (position: {
    x: number;
    y: number;
  }) => {
    if (rectangularSelectionX && rectangularSelectionY) {
      setRectangularSelectionHeight(position.y - rectangularSelectionY);

      setRectangularSelectionWidth(position.x - rectangularSelectionX);
    }
  };

  const onRectangularSelectionMouseUp = (position: {
    x: number;
    y: number;
  }) => {};

  /*
   * Zoom
   */
  const [zoomScaleX, setZoomScaleX] = useState<number>(1);
  const [zoomScaleY, setZoomScaleY] = useState<number>(1);
  const [stageX, setStageX] = useState<number>(0);
  const [stageY, setStageY] = useState<number>(0);

  const [zoomSelectionX, setZoomSelectionX] = useState<number>();
  const [zoomSelectionY, setZoomSelectionY] = useState<number>();
  const [zoomSelectionHeight, setZoomSelectionHeight] = useState<number>(0);
  const [zoomSelectionWidth, setZoomSelectionWidth] = useState<number>(0);

  const [zoomSelecting, setZoomSelecting] = useState<boolean>(false);
  const [zoomSelected, setZoomSelected] = useState<boolean>(false);

  const zoomIncrement = 1.1; // by how much we want to zoom in or out with each click

  const zoomMode = useSelector(imageViewerZoomModeSelector);

  useEffect(() => {
    setZoomScaleX(1);
    setZoomScaleY(1);
    setStageX(0);
    setStageY(0);
    setZoomSelectionX(0);
    setZoomSelectionY(0);
    setZoomSelectionHeight(0);
    setZoomSelectionWidth(0);
    setZoomSelecting(false);
    setZoomSelected(false);
  }, [zoomReset]);

  const onZoomMouseDown = (position: { x: number; y: number }) => {
    if (zoomSelected) return;

    setZoomSelectionX(position.x);
    setZoomSelectionY(position.y);

    setZoomSelecting(true);
  };

  const onZoomMouseMove = (position: { x: number; y: number }) => {
    if (zoomSelected) return;
    if (!zoomSelecting) return;

    if (zoomSelectionX && zoomSelectionY) {
      setZoomSelectionHeight(position.y - zoomSelectionY)
      setZoomSelectionWidth(position.x - zoomSelectionX)

      setZoomSelecting(true);
    }
  };

  const onZoomMouseUp = (position: { x: number; y: number }) => {
    if (
      zoomSelecting &&
      zoomSelectionX &&
      zoomSelectionY &&
      zoomSelectionWidth &&
      zoomSelectionHeight
    ) {
      if (stageRef && stageRef.current) {
        const newScale =
          zoomScaleX * (stageRef.current.width() / zoomSelectionWidth);
        setStageX(-1 * zoomSelectionX * newScale);
        setStageY(-1 * zoomSelectionY * newScale);
        setZoomScaleX(newScale);
        setZoomScaleY(newScale);
      }
      setZoomSelected(true);
    } else {
      const scaleStep = zoomMode ? 1 / zoomIncrement : zoomIncrement;

      if (stageRef && stageRef.current) {

        const newScale = zoomScaleX * scaleStep;

        setStageX(position.x - position.x * newScale);
        setStageY(position.y - position.y * newScale);

        setZoomScaleX(newScale);
        setZoomScaleY(newScale);
      }
    }

    setZoomSelecting(false);
  };

  const onSelection = () => {
    switch (activeOperation) {
      case ImageViewerOperation.ColorAdjustment:
        return;
      case ImageViewerOperation.ColorSelection:
        return onColorSelection();
      case ImageViewerOperation.EllipticalSelection:
        return onEllipticalSelection();
      case ImageViewerOperation.Hand:
        return;
      case ImageViewerOperation.LassoSelection:
        return onLassoSelection();
      case ImageViewerOperation.MagneticSelection:
        return onMagneticSelection();
      case ImageViewerOperation.ObjectSelection:
        return onObjectSelection();
      case ImageViewerOperation.PolygonalSelection:
        return onPolygonalSelection();
      case ImageViewerOperation.QuickSelection:
        return onQuickSelection();
      case ImageViewerOperation.RectangularSelection:
        return onRectangularSelection();
      case ImageViewerOperation.Zoom:
        return;
    }
  };

  const { annotated, annotating, setAnnotated, setAnnotating } = useSelection(
    onSelection
  );

  const onMouseDown = () => {
    if (stageRef && stageRef.current && imageRef && imageRef.current) {
      // const position = stageRef.current.getPointerPosition();
      const transform = imageRef.current.getAbsoluteTransform().copy();
      transform.invert();
      const position = transform.point(stageRef.current.getPointerPosition());

      if (position) {
        switch (activeOperation) {
          case ImageViewerOperation.ColorAdjustment:
            break;
          case ImageViewerOperation.ColorSelection:
            return onColorSelectionMouseDown(position);
          case ImageViewerOperation.EllipticalSelection:
            if (annotated) return;

            setAnnotating(true);

            return onEllipticalSelectionMouseDown(position);
          case ImageViewerOperation.Hand:
            break;
          case ImageViewerOperation.LassoSelection:
            if (annotated) return;

            return onLassoSelectionMouseDown(position);
          case ImageViewerOperation.MagneticSelection:
            if (annotated) return;

            return onMagneticSelectionMouseDown(position);
          case ImageViewerOperation.ObjectSelection:
            return onObjectSelectionMouseDown(position);
          case ImageViewerOperation.PolygonalSelection:
            if (annotated) return;

            return onPolygonalSelectionMouseDown(position);
          case ImageViewerOperation.QuickSelection:
            return onQuickSelectionMouseDown(position);
          case ImageViewerOperation.RectangularSelection:
            if (annotated) return;

            setAnnotating(true);

            return onRectangularSelectionMouseDown(position);
          case ImageViewerOperation.Zoom:
            return onZoomMouseDown(position);
        }
      }
    }
  };

  const onMouseMove = () => {
    if (stageRef && stageRef.current && imageRef && imageRef.current) {
      // const position = stageRef.current.getPointerPosition();
      const transform = imageRef.current.getAbsoluteTransform().copy();
      transform.invert();
      const position = transform.point(stageRef.current.getPointerPosition());

      if (position) {
        switch (activeOperation) {
          case ImageViewerOperation.ColorAdjustment:
            break;
          case ImageViewerOperation.ColorSelection:
            return onColorSelectionMouseMove(position);
          case ImageViewerOperation.EllipticalSelection:
            if (annotated) return;

            return onEllipticalSelectionMouseMove(position);
          case ImageViewerOperation.Hand:
            break;
          case ImageViewerOperation.LassoSelection:
            if (annotated || !annotating) return;

            return onLassoSelectionMouseMove(position);
          case ImageViewerOperation.MagneticSelection:
            if (annotated || !annotating) return;

            return onMagneticSelectionMouseMove(position);
          case ImageViewerOperation.ObjectSelection:
            return onObjectSelectionMouseMove(position);
          case ImageViewerOperation.PolygonalSelection:
            if (annotated || !annotating) return;

            return onPolygonalSelectionMouseMove(position);
          case ImageViewerOperation.QuickSelection:
            return onQuickSelectionMouseMove(position);
          case ImageViewerOperation.RectangularSelection:
            if (annotated) return;

            return onRectangularSelectionMouseMove(position);
          case ImageViewerOperation.Zoom:
            return onZoomMouseMove(position);
        }
      }
    }
  };

  const onMouseUp = () => {
    if (stageRef && stageRef.current) {
      // const position = stageRef.current.getPointerPosition();
      const transform = imageRef.current.getAbsoluteTransform().copy();
      transform.invert();
      const position = transform.point(stageRef.current.getPointerPosition());

      if (position) {
        switch (activeOperation) {
          case ImageViewerOperation.ColorAdjustment:
            break;
          case ImageViewerOperation.ColorSelection:
            return onColorSelectionMouseUp(position);
          case ImageViewerOperation.EllipticalSelection:
            if (annotated || !annotating) return;

            setAnnotated(true);
            setAnnotating(false);

            return onEllipticalSelectionMouseUp(position);
          case ImageViewerOperation.Hand:
            break;
          case ImageViewerOperation.LassoSelection:
            if (annotated || !annotating) return;

            return onLassoSelectionMouseUp(position);
          case ImageViewerOperation.MagneticSelection:
            if (annotated || !annotating) return;

            return onMagneticSelectionMouseUp(position);
          case ImageViewerOperation.ObjectSelection:
            return onObjectSelectionMouseUp(position);
          case ImageViewerOperation.PolygonalSelection:
            if (annotated || !annotating) return;

            return onPolygonalSelectionMouseUp(position);
          case ImageViewerOperation.QuickSelection:
            return onQuickSelectionMouseUp(position);
          case ImageViewerOperation.RectangularSelection:
            if (annotated || !annotating) return;

            setAnnotated(true);
            setAnnotating(false);

            return onRectangularSelectionMouseUp(position);
          case ImageViewerOperation.Zoom:
            return onZoomMouseUp(position);
        }
      }
    }
  };

  const initialWidth = 1000;
  const parentRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState<number>(initialWidth);
  const [stageHeight, setStageHeight] = useState<number>(initialWidth);

  useEffect(() => {
    const resize = () => {
      if (parentRef && parentRef.current) {
        setZoomScaleX(parentRef.current.offsetWidth / initialWidth);
        setZoomScaleY(parentRef.current.offsetWidth / initialWidth);
        setStageWidth(stageWidth * zoomScaleX);
        setStageHeight(stageHeight * zoomScaleY);
      }
    };

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, [stageHeight, stageWidth, zoomScaleX, zoomScaleY]);

  useEffect(() => {
    const resize = () => {};

    resize();
  }, []);

  return (
    <main className={classes.content}>
      <div className={classes.toolbar} />

      <div ref={parentRef} className={classes.parent}>
        <ReactKonva.Stage
          className={classes.stage}
          globalCompositeOperation="destination-over"
          height={initialWidth}
          position={{ x: stageX, y: stageY }}
          ref={stageRef}
          scale={{ x: zoomScaleX, y: zoomScaleY }}
          width={initialWidth}
        >
          <ReactKonva.Layer
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
          >
            {img && <ReactKonva.Image ref={imageRef} image={img} />}

            {activeOperation === ImageViewerOperation.ColorSelection && (
              <ColorSelection />
            )}
            {activeOperation === ImageViewerOperation.EllipticalSelection && (
              <EllipticalSelection />
            )}
            {activeOperation === ImageViewerOperation.LassoSelection && (
              <LassoSelection />
            )}
            {activeOperation === ImageViewerOperation.MagneticSelection && (
              <MagneticSelection />
            )}
            {activeOperation === ImageViewerOperation.ObjectSelection && (
              <ObjectSelection />
            )}
            {activeOperation === ImageViewerOperation.PolygonalSelection && (
              <PolygonalSelection />
            )}
            {activeOperation === ImageViewerOperation.QuickSelection && (
              <QuickSelection />
            )}
            {activeOperation === ImageViewerOperation.RectangularSelection && (
              <RectangularSelection
                activeCategory={activeCategory}
                annotated={annotated}
                annotating={annotating}
                height={rectangularSelectionHeight}
                ref={rectangularSelectionRef}
                width={rectangularSelectionWidth}
                x={rectangularSelectionX}
                y={rectangularSelectionY}
              />
            )}
            {activeOperation === ImageViewerOperation.Zoom && (
              <ZoomSelection
                selected={zoomSelected}
                selecting={zoomSelecting}
                height={zoomSelectionHeight}
                width={zoomSelectionWidth}
                x={zoomSelectionX}
                y={zoomSelectionY}
              />
            )}
          </ReactKonva.Layer>
        </ReactKonva.Stage>
      </div>
    </main>
  );
};
