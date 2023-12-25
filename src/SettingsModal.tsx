import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { SortSpeeds, TraversalTypes } from "./Types";

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 300,
  height: 190,
  bgcolor: "lightblue",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

interface ModalProps {
  modalOpen: boolean;
  setModalOpen: Function;
  numNodes: number;
  selectedTraversal: string;
  setSelectedTraversal: Function;
  sortingSpeedLabel: string;
  setSortingSpeedLabel: Function;
  setNumNodes: Function;
}

export const SettingsModal = (props: ModalProps) => {
  const handleInput = (event: any) => {
    const inputValue = event.target.value;
    const numericValue = parseInt(inputValue);
    props.setNumNodes(numericValue);
  };

  return (
    <Modal
      sx={modalStyle}
      open={props.modalOpen}
      onClose={() => props.setModalOpen(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={() => props.setModalOpen(false)}
          aria-label="close"
          style={{ position: "absolute", top: 0, right: 10 }}
        >
          <CloseIcon />
        </IconButton>
        <Box sx={{ position: "relative", bottom: 15 }}>
          <Box>
            <label>
              Node Count:
              <input
                style={{
                  position: "relative",
                  left: 7,
                  marginBottom: 13,
                  height: 25,
                }}
                type="number"
                value={props.numNodes}
                onChange={handleInput}
              />
            </label>
          </Box>
          <Box>
            <label>
              Traversal Type:
              <Select
                style={{
                  marginRight: 5,
                  height: 30,
                  width: 100,
                  fontSize: 10,
                  backgroundColor: "white",
                  position: "relative",
                  left: 7,
                  marginBottom: 13,
                }}
                value={props.selectedTraversal}
                label="TraversalType"
                onChange={(event) => {
                  props.setSelectedTraversal(event.target.value);
                }}
                MenuProps={{
                  style: {
                    height: 400, // Set the maximum height of the menu
                  },
                }}
              >
                <MenuItem sx={{ fontSize: 10 }} value={TraversalTypes.IN_ORDER}>
                  InOrder
                </MenuItem>
                <MenuItem
                  sx={{ fontSize: 10 }}
                  value={TraversalTypes.PRE_ORDER}
                >
                  PreOrder
                </MenuItem>
                <MenuItem
                  sx={{ fontSize: 10 }}
                  value={TraversalTypes.POST_ORDER}
                >
                  PostOrder
                </MenuItem>
                <MenuItem sx={{ fontSize: 10 }} value={TraversalTypes.BFS}>
                  Breadth-First Search
                </MenuItem>
              </Select>
            </label>
            <Box sx={{ paddingBottom: 5 }}>
              <label>
                Sorting Speed:
                <Select
                  style={{
                    marginRight: 5,
                    height: 30,
                    width: 100,
                    fontSize: 10,
                    backgroundColor: "white",
                    position: "relative",
                    left: 7,
                    marginBottom: 13,
                  }}
                  value={props.sortingSpeedLabel}
                  label="Age"
                  onChange={(event) => {
                    props.setSortingSpeedLabel(event.target.value);
                  }}
                  MenuProps={{
                    style: {
                      height: 400, // Set the maximum height of the menu
                    },
                  }}
                >
                  <MenuItem sx={{ fontSize: 10 }} value={SortSpeeds.FAST}>
                    Fast
                  </MenuItem>
                  <MenuItem sx={{ fontSize: 10 }} value={SortSpeeds.MEDIUM}>
                    Medium
                  </MenuItem>
                  <MenuItem sx={{ fontSize: 10 }} value={SortSpeeds.SLOW}>
                    Slow
                  </MenuItem>
                </Select>
              </label>
            </Box>
            <div style={{ fontSize: 13, position: "relative", bottom: 42 }}>
              Note, the tree generator will attempt to randomly place nodes in
              the canvas until there is no more room. If the number you input
              contains more nodes than can fit on the screen, the tree generator
              will construct a tree with as many nodes as possible.
            </div>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};
