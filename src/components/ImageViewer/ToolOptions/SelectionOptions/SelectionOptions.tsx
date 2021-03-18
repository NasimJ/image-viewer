import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Radio from "@material-ui/core/Radio";
import React from "react";
import SvgIcon from "@material-ui/core/SvgIcon";
import { ReactComponent as InvertSelectionIcon } from "../../../icons/InvertSelection.svg";
import RadioGroup from "@material-ui/core/RadioGroup";
import { useDispatch, useSelector } from "react-redux";
import {
  invertModeSelector,
  selectionModeSelector,
} from "../../../../store/selectors";
import { slice } from "../../../../store/slices";
import { SelectionMode } from "../../../../types/SelectionMode";
import { Typography } from "@material-ui/core";

export const SelectionOptions = () => {
  const dispatch = useDispatch();

  const selectionMode = useSelector(selectionModeSelector);

  const invertMode = useSelector(invertModeSelector);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const payload = {
      selectionMode: parseInt((event.target as HTMLInputElement).value),
    };

    dispatch(slice.actions.setSelectionMode(payload));
  };

  const onInvertClick = () => {
    dispatch(slice.actions.setInvertMode({ invertMode: !invertMode }));
  };

  return (
    <React.Fragment>
      <RadioGroup
        aria-label="selection mode"
        name="selection-mode"
        onChange={onChange}
        value={selectionMode}
      >
        <List dense>
          <ListItem>
            <ListItemText>
              <Typography variant="inherit">
                Right-click on an existing annotation to select it.
              </Typography>
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText>
              <Typography variant="inherit">
                Press the Backspace or Escape keys to remove a selected
                annotation.
              </Typography>
            </ListItemText>
          </ListItem>
        </List>

        <Divider />

        <List>
          <ListItem dense>
            <ListItemIcon>
              <Radio
                disableRipple
                edge="start"
                tabIndex={-1}
                value={SelectionMode.New}
              />
            </ListItemIcon>

            <ListItemText primary="New" secondary="Create a new selection." />
          </ListItem>

          <ListItem dense>
            <ListItemIcon>
              <Radio
                disableRipple
                edge="start"
                tabIndex={-1}
                value={SelectionMode.Add}
              />
            </ListItemIcon>

            <ListItemText
              primary="Add"
              secondary="Add area to the selected selection."
            />
          </ListItem>

          <ListItem dense>
            <ListItemIcon>
              <Radio
                disableRipple
                edge="start"
                tabIndex={-1}
                value={SelectionMode.Subtract}
              />
            </ListItemIcon>

            <ListItemText
              primary="Subtract"
              secondary="Subtract area from the selected selection."
            />
          </ListItem>

          <ListItem dense>
            <ListItemIcon>
              <Radio
                disableRipple
                edge="start"
                tabIndex={-1}
                value={SelectionMode.Intersect}
              />
            </ListItemIcon>

            <ListItemText
              primary="Intersect"
              secondary="Constrain the boundary of the new selection to the selectedselection."
            />
          </ListItem>
        </List>
      </RadioGroup>

      <Divider />

      <List>
        <ListItem button onClick={onInvertClick} dense>
          <ListItemIcon>
            <SvgIcon>
              <InvertSelectionIcon />
            </SvgIcon>
          </ListItemIcon>

          <ListItemText primary="Invert selection" />
        </ListItem>
      </List>
    </React.Fragment>
  );
};
