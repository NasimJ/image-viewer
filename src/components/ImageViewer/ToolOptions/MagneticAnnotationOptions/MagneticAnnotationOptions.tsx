import Divider from "@material-ui/core/Divider";
import React from "react";
import { SampleList } from "../SampleList";
import { AnnotationMode } from "../AnnotationMode";
import { InformationBox } from "../InformationBox";
import { InvertAnnotation } from "../InvertAnnotation";
import { useTranslation } from "../../../../hooks/useTranslation";

export const MagneticAnnotationOptions = () => {
  const t = useTranslation();

  return (
    <React.Fragment>
      <InformationBox description="…" name={t("Magnetic annotation")} />

      <Divider />

      <AnnotationMode />

      <Divider />

      <InvertAnnotation />

      <Divider />

      <SampleList />
    </React.Fragment>
  );
};
