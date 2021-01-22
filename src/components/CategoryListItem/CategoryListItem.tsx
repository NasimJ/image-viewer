import IconButton from "@material-ui/core/IconButton";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import React from "react";
import { Category } from "../../types/Category";
import { CategoryListItemCheckbox } from "../ImageViewer/CategoryListItemCheckbox";
import { CategoryMenu } from "../ImageViewer/CategoryMenu";
import { Chip } from "@material-ui/core";
import { useDialog, useMenu } from "../../hooks";
import { useSelector } from "react-redux";
import { EditCategoryDialog } from "../ImageViewer/EditCategoryDialog";
import { DeleteCategoryDialog } from "../ImageViewer/DeleteCategoryDialog";
import { State } from "../../types/State";
import { Image } from "../../types/Image";
import { useStyles } from "../Application/Application.css";

type CategoryListItemProps = {
  category: Category;
};

export const CategoryListItem = ({ category }: CategoryListItemProps) => {
  const {
    onClose: onCloseDeleteCategoryDialog,
    onOpen: onOpenDeleteCategoryDialog,
    open: openDeleteCategoryDialog,
  } = useDialog();
  const {
    onClose: onCloseEditCategoryDialog,
    onOpen: onOpenEditCategoryDialog,
    open: openEditCategoryDialog,
  } = useDialog();

  const {
    anchorEl: anchorElCategoryMenu,
    onClose: onCloseCategoryMenu,
    onOpen: onOpenCategoryMenu,
    open: openCategoryMenu,
  } = useMenu();

  const imageCount = useSelector((state: State) => {
    return state.project.images.filter((image: Image) => {
      return image.categoryId === category.id;
    }).length;
  });

  const classes = useStyles();

  return (
    <React.Fragment>
      <ListItem dense key={category.id} id={category.id}>
        <CategoryListItemCheckbox category={category} />

        <ListItemText
          id={category.id}
          primary={category.name}
          primaryTypographyProps={{ noWrap: true }}
        />

        <Chip
          label={imageCount}
          size="small"
          className={classes.chip}
          style={{ backgroundColor: category.color }}
        />

        <ListItemSecondaryAction>
          <IconButton edge="end" onClick={onOpenCategoryMenu}>
            <MoreHorizIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>

      <CategoryMenu
        anchorElCategoryMenu={anchorElCategoryMenu}
        category={category}
        onCloseCategoryMenu={onCloseCategoryMenu}
        onOpenCategoryMenu={onOpenCategoryMenu}
        onOpenDeleteCategoryDialog={onOpenDeleteCategoryDialog}
        onOpenEditCategoryDialog={onOpenEditCategoryDialog}
        openCategoryMenu={openCategoryMenu}
      />

      <DeleteCategoryDialog
        category={category}
        onClose={onCloseDeleteCategoryDialog}
        open={openDeleteCategoryDialog}
      />

      <EditCategoryDialog
        category={category}
        onCloseDialog={onCloseEditCategoryDialog}
        openDialog={openEditCategoryDialog}
      />
    </React.Fragment>
  );
};
