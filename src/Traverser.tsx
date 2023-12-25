import { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import ScrollableTable from "./ScrollableTable";
import { SettingsModal } from "./SettingsModal";
import {
  bfs,
  inOrderTraverse,
  postOrderTraverse,
  preOrderTraverse,
} from "./Traversals";
import { Node, Step, SortSpeeds, TraversalTypes } from "./Types";
import { generateRandomTree, updateTreeByValue } from "./TreeFunctions";
import {
  DEFAULT_NUM_NODES,
  CANVAS_WIDTH_PERCENTAGE,
  CANVAS_HEIGHT_PERCENTAGE,
  SLOW_DELAY,
  MEDIUM_DELAY,
  FAST_DELAY,
  MAX_LISTED_TRAVERSAL_ITEMS,
} from "./Constants";
import { BottomButton } from "./BottomButton";
import { drawCanvas } from "./CanvasFunctions";

const Traverser = () => {
  const [numNodes, setNumNodes] = useState(DEFAULT_NUM_NODES);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [traversalStep, setTraversalStep] = useState(0);
  const [sortingSpeedLabel, setSortingSpeedLabel] = useState(SortSpeeds.FAST);
  const [sortingSpeed, setSortingSpeed] = useState(50);
  const [updateTraversalFlag, setUpdateTraversalFlag] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [traversal, setTraversal] = useState<Step[]>([]);
  const [listedTraversal, setListedTraversal] = useState<Step[]>([]);
  const [tree, setTree] = useState<Node | null>(
    generateRandomTree(DEFAULT_NUM_NODES),
  );
  const [savedTree, setSavedTree] = useState<Node | null>(tree);
  const [selectedTraversal, setSelectedTraversal] = useState(TraversalTypes.IN_ORDER);

  /**
   * Performs one step in the traversal algorithm and updates the listed traversal.
   * If state is finished, do nothing. If the traversal is on the last step, update
   * state accordingly. 
   */
  const performStep = async () => {
    if (finished) return;

    if (traversalStep === traversal.length) {
      setTraversalStep(0);
      setPlaying(false);
      setFinished(true);
      return;
    }
    if (listedTraversal.length < MAX_LISTED_TRAVERSAL_ITEMS) {
      setListedTraversal((prevListed) => [
        ...prevListed,
        traversal[traversalStep],
      ]);
    } else {
      setListedTraversal((prevListed) => [
        ...prevListed.slice(1),
        traversal[traversalStep],
      ]);
    }

    setTree((prevTree) => {
      const currentTree = JSON.parse(JSON.stringify(prevTree));
      updateTreeByValue(
        currentTree,
        traversal[traversalStep].value,
        traversal[traversalStep].state,
      );
      return currentTree;
    });
    setTraversalStep((prevStep) => {
      return prevStep + 1;
    });
  };

  /**
   * Pauses/unpauses the display sequence. If finished, do nothing.
   * Update state specifically if traversal is at step 0.
   */
  const handleStart = () => {
    if (finished) return;
    if (traversalStep === 0) {
      setPlaying(true);
      setFinished(false);
    } else {
      setPlaying(!playing);
    }
  };

  /**
   * Resets state to a point where a new traversal can be started.
   * Takes the current tree and sets all nodes to 'clean' state with
   * the savedTree variable.
   */
  const handleReset = () => {
    setListedTraversal([]);
    setTraversalStep(0);
    setTree(savedTree);
    setPlaying(false);
    setFinished(false);
  };

  /**
   * Sets traversal variable and resets state.
   * @param traversalFunc - The function that traverses the tree and builds the array to display output.
   */
  const handleTraversalChange = (traversalFunc: Function) => {
    handleReset()
    setTraversal(traversalFunc(tree));
  };

  useEffect(() => {
    drawCanvas(canvasRef, tree);
  }, [tree]);

  /**
   * Resets and sets a new tree. Sets this tree as the saved tree to
   * be used when resetting.
   */
  function newTree() {
    handleReset()
    let tree = generateRandomTree(numNodes);
    setTree(tree);
    setSavedTree(tree);
  }

  /**
   * Updates traversal according to selected traversal type.
   */
  useEffect(() => {
    if (selectedTraversal === TraversalTypes.IN_ORDER) {
      handleTraversalChange(inOrderTraverse);
      setTraversal(inOrderTraverse(tree));
    } else if (selectedTraversal === TraversalTypes.PRE_ORDER) {
      handleTraversalChange(preOrderTraverse);
    } else if (selectedTraversal === TraversalTypes.POST_ORDER) {
      handleTraversalChange(postOrderTraverse);
    } else if (selectedTraversal === TraversalTypes.BFS) {
      handleTraversalChange(bfs);
    }
  }, [selectedTraversal, updateTraversalFlag]);

  /**
   * Updates sorting speed according to selected sorting speed.
   */
  useEffect(() => {
    if (sortingSpeedLabel === SortSpeeds.FAST) {
      setSortingSpeed(FAST_DELAY);
    } else if (sortingSpeedLabel === SortSpeeds.MEDIUM) {
      setSortingSpeed(MEDIUM_DELAY);
    } else if (sortingSpeedLabel === SortSpeeds.SLOW) {
      setSortingSpeed(SLOW_DELAY);
    }
  }, [sortingSpeedLabel]);

  /**
   * Performs one step to avoid the appearance of delay
   */
  useEffect(() => {
    if (playing) performStep();
  }, [playing]);

  /**
   * If playing, performs steps in the traversal at the interval specified
   * by the sorting speed delay.
   */
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (playing) performStep();
    }, sortingSpeed);

    return () => clearInterval(intervalId);
  }, [playing, traversalStep]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1>Binary Tree Traverser</h1>
      </div>
      <SettingsModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        numNodes={numNodes}
        selectedTraversal={selectedTraversal}
        setSelectedTraversal={setSelectedTraversal}
        sortingSpeedLabel={sortingSpeedLabel}
        setSortingSpeedLabel={setSortingSpeedLabel}
        setNumNodes={setNumNodes}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          bottom: 15,
        }}
      >
        <div
          style={{
            width: `${CANVAS_WIDTH_PERCENTAGE}%`,
            height: `${CANVAS_HEIGHT_PERCENTAGE}vh`,
            marginTop: "5px",
            position: "relative",
            left: 5,
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              width: `${100}%`,
              height: `${100}%`,
              backgroundColor: "lightblue",
            }}
          />
          <Button
            style={{
              marginRight: 5,
              height: 25,
              fontSize: 16,
              position: "absolute",
              top: 10,
              right: 5,
            }}
            variant="contained"
            onClick={() => {
              newTree();
              setUpdateTraversalFlag(!updateTraversalFlag);
            }}
          >
            New Tree
          </Button>
        </div>
        {window.innerWidth > 768 && <ScrollableTable data={listedTraversal} />}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "5px",
          position: "relative",
          left: 5,
        }}
      >
        <div
          style={{
            alignItems: "start",
          }}
        >
          <BottomButton text="Play" func={handleStart} />
          <BottomButton text="Step" func={performStep} />
          <BottomButton text="Reset" func={handleReset} />
          <BottomButton text="Settings" func={setModalOpen} funcArg={true} />
        </div>
      </div>
    </div>
  );
};

export default Traverser;
