import Divider from "@material-ui/core/Divider";
import React from "react";
import { SampleList } from "../SampleList";
import { AnnotationMode } from "../AnnotationMode";
import { InformationBox } from "../InformationBox";
import { InvertAnnotation } from "../InvertAnnotation";

export const MagneticAnnotationOptions = () => {
  return (
    <React.Fragment>
      <InformationBox description="…" name="Magnetic annotation" />

      <Divider />

      <AnnotationMode />

      <Divider />

      <InvertAnnotation />

      <Divider />

      <SampleList />
    </React.Fragment>
  );
};
