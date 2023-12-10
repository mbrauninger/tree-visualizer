import { useEffect, useRef, useState } from "react";
import { Queue } from "queue-typescript";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import ScrollableTable from "./ScrollableTable";
import Switch from "@mui/material/Switch";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Hidden from "@mui/material/Hidden";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface Node {
  value: number;
  left?: Node | null;
  right?: Node | null;
  state: string;
  x: number;
  y: number;
}

export interface Step {
  value: number;
  state: string;
}

const BinaryTree = () => {
  const CANVAS_WIDTH_PERCENTAGE = window.innerWidth <= 768 ? 97.5 : 40;
  const CANVAS_HEIGHT_PERCENTAGE = window.innerWidth <= 768 ? 70 : 80;
  const DISPLAY_WIDTH = (window.innerWidth * CANVAS_WIDTH_PERCENTAGE) / 100;
  const DISPLAY_HEIGHT = (window.innerHeight * CANVAS_HEIGHT_PERCENTAGE) / 100;
  const DEFAULT_RADIUS = 10;
  const DEFAULT_NUM_NODES = 120;
  const [nodeRadius, setNodeRadius] = useState(DEFAULT_RADIUS);
  const [tempNumNodes, setTempNumNodes] = useState(DEFAULT_NUM_NODES);
  const [numNodes, setNumNodes] = useState(DEFAULT_NUM_NODES);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [traversalStep, setTraversalStep] = useState(0);
  const [random, setRandom] = useState(true);
  const [sortingSpeedLabel, setSortingSpeedLabel] = useState("Fast");
  const [sortingSpeed, setSortingSpeed] = useState(50);
  const [updateTraversalFlag, setUpdateTraversalFlag] = useState(false);
  const label = { inputProps: { "aria-label": "Random Tree" } };
  const [modalOpen, setModalOpen] = useState(false);
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

  function calculateBaseXOffset() {
    const numLevels = Math.floor(Math.log2(numNodes));

    let coefficient = 0;
    let percentageOfScreen = 1;
    for (let i = 0; i < numLevels; i++) {
      coefficient += percentageOfScreen;
      percentageOfScreen /= 2;
    }
    return (DISPLAY_WIDTH - 20 - nodeRadius) / 2 / coefficient;
  }

  function calculateBottomWidth(radius: number) {
    const numLevels = Math.floor(Math.log2(numNodes));
    return Math.pow(2, numLevels) * radius * 2;
  }

  const [baseXOffset, setBaseXOffset] = useState(10);

  const generateTree = (size: number) => {
    const numLevels = Math.floor(Math.log2(numNodes));
    const yOffset = (DISPLAY_HEIGHT - 10) / (numLevels + 1);
    let i = 2;
    const head = {
      value: 1,
      state: "clean",
      left: null,
      right: null,
      x: DISPLAY_WIDTH / 2,
      y: 25,
    };
    const queue = new Queue<Node>(head);
    let xOffset = 70;
    while (i < size) {
      const current = queue.dequeue();
      current.left = {
        value: i,
        state: "clean",
        left: null,
        right: null,
        x: current.x - xOffset,
        y: current.y + yOffset,
      };
      current.right = {
        value: i + 1,
        state: "clean",
        left: null,
        right: null,
        x: current.x + xOffset,
        y: current.y + yOffset,
      };
      queue.enqueue(current.left);
      queue.enqueue(current.right);
      i += 2;
      if (Number.isInteger(Math.log2(i))) {
        xOffset /= 2;
      }
    }
    return head;
  };

  function randomIntFromInterval(min: number, max: number) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  const generateRandomTree = (size: number) => {
    const yOffset = 30;
    const initialY = 25;

    function determineHeight(yValue: number, yOffset: number) {
      let height = 1;
      while (initialY + height * yOffset !== yValue) {
        height++;
      }
      return height;
    }

    function isOverlap(node1: Node, node2: Node) {
      const nodeBorder = 1;
      const dx = node1.x - node2.x;
      const dy = node1.y - node2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < 2 * nodeRadius + 2 * nodeBorder;
    }

    function isInWidth(node: Node) {
      return node.x - nodeRadius > 0 && node.x + nodeRadius < DISPLAY_WIDTH;
    }

    const head = {
      value: 1,
      state: "clean",
      left: null,
      right: null,
      x: DISPLAY_WIDTH / 2,
      y: initialY,
    };
    const leafNodes: Node[] = [head];
    const allNodes: Node[] = [];

    function checkOverlap(currentNode: Node) {
      for (const node of allNodes) {
        if (isOverlap(currentNode, node)) return true;
      }
      return false;
    }

    function calculateXOffset(y: number, yOffset: number) {
      const minXOffset = 2 * nodeRadius + 1;
      const potential = xOffset / determineHeight(y + yOffset, yOffset);
      return potential < minXOffset ? minXOffset : potential;
    }

    let xOffset = 70;
    let i = 2;
    while (i <= size && leafNodes.length > 0) {
      const index = randomIntFromInterval(0, leafNodes.length - 1);
      const currentNode = leafNodes[index];
      if (currentNode.left && currentNode.right) {
        leafNodes.splice(index, 1);
        continue;
      }

      const potentialNode = {
        value: i,
        state: "clean",
        left: null,
        right: null,
        x:
          currentNode.x +
          xOffset / determineHeight(currentNode.y + yOffset, yOffset),
        y: currentNode.y + yOffset,
      };

      const checkLeftFirst = Math.random();
      potentialNode.y = currentNode.y + yOffset;
      if (checkLeftFirst < 0.5) {
        potentialNode.x =
          currentNode.x + calculateXOffset(currentNode.y, yOffset);
        if (
          !currentNode.right &&
          potentialNode.y + nodeRadius < DISPLAY_HEIGHT &&
          !checkOverlap(potentialNode) &&
          isInWidth(potentialNode)
        ) {
          currentNode.right = potentialNode;
          leafNodes.push(currentNode.right);
          allNodes.push(currentNode.right);
          if (!currentNode.left) leafNodes.push(currentNode);
          i += 1;
          continue;
        }
        potentialNode.x =
          currentNode.x - calculateXOffset(currentNode.y, yOffset);
        if (
          !currentNode.left &&
          potentialNode.y + nodeRadius < DISPLAY_HEIGHT &&
          !checkOverlap(potentialNode) &&
          isInWidth(potentialNode)
        ) {
          currentNode.left = potentialNode;
          leafNodes.push(currentNode.left);
          allNodes.push(currentNode.left);
          if (!currentNode.right) leafNodes.push(currentNode);
          i += 1;
          continue;
        }
      } else {
        potentialNode.x =
          currentNode.x - calculateXOffset(currentNode.y, yOffset);
        if (
          !currentNode.left &&
          potentialNode.y + nodeRadius < DISPLAY_HEIGHT &&
          !checkOverlap(potentialNode) &&
          isInWidth(potentialNode)
        ) {
          currentNode.left = potentialNode;
          leafNodes.push(currentNode.left);
          allNodes.push(currentNode.left);
          if (!currentNode.right) leafNodes.push(currentNode);
          i += 1;
          continue;
        }
        potentialNode.x =
          currentNode.x + calculateXOffset(currentNode.y, yOffset);
        if (
          !currentNode.right &&
          potentialNode.y + nodeRadius < DISPLAY_HEIGHT &&
          !checkOverlap(potentialNode) &&
          isInWidth(potentialNode)
        ) {
          currentNode.right = potentialNode;
          leafNodes.push(currentNode.right);
          allNodes.push(currentNode.right);
          if (!currentNode.left) leafNodes.push(currentNode);
          i += 1;
          continue;
        }
      }
      console.log(`Node ${leafNodes[index].value} is not fit for children`);
      leafNodes.splice(index, 1);
      if (leafNodes.length === 0) {
        console.log(`Only could fit ${i} nodes in the screen`);
      }
    }
    bfsNumberAssign(head);
    return head;
  };

  function bfsNumberAssign(head: Node) {
    if (!head) {
      return;
    }
    const nodes = [head];
    let i = 2;
    while (nodes.length > 0) {
      const nodesAtLevel: Node[] = [];
      while (nodes.length > 0) {
        const currentNode = nodes.splice(0, 1)[0];
        if (!currentNode) continue;
        if (currentNode.left) {
          nodesAtLevel.push(currentNode.left);
        }
        if (currentNode.right) {
          nodesAtLevel.push(currentNode.right);
        }
      }
      for (const node of nodesAtLevel) {
        nodes.push(node);
        node.value = i;
        i++;
      }
    }
  }

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [traversal, setTraversal] = useState<Step[]>([]);
  const [listedTraversal, setListedTraversal] = useState<Step[]>([]);
  const [tree, setTree] = useState<Node | null>(
    generateRandomTree(DEFAULT_NUM_NODES),
  );
  const [savedTree, setSavedTree] = useState<Node | null>(tree);
  const [selectedOption, setSelectedOption] = useState("inOrder"); // Default option

  const bfs = (node: Node | null | undefined) => {
    const result: Step[] = [];
    if (!node) {
      return result;
    }
    const nodes = [node];
    result.push({ state: "visited", value: node.value });
    while (nodes.length > 0) {
      const nodesAtLevel: Node[] = [];
      while (nodes.length > 0) {
        const currentNode = nodes.splice(0, 1)[0];
        if (!currentNode) continue;
        result.push({ state: "processed", value: currentNode.value });
        if (currentNode.left) {
          nodesAtLevel.push(currentNode.left);
        }
        if (currentNode.right) {
          nodesAtLevel.push(currentNode.right);
        }
      }
      for (const node of nodesAtLevel) {
        nodes.push(node);
        result.push({ state: "visited", value: node.value });
      }
    }
    return result;
  };

  const inOrderTraverse = (node: Node | null | undefined) => {
    const helper = (node: Node | null | undefined, result: Step[]) => {
      if (!node) {
        return result;
      }
      result.push({ state: "visited", value: node.value });
      helper(node.left, result);
      result.push({ state: "processed", value: node.value });
      helper(node.right, result);
    };

    let array: Step[] = [];
    helper(node, array);
    return array;
  };

  const preOrderTraverse = (node: Node | null | undefined) => {
    const helper = (node: Node | null | undefined, result: Step[]) => {
      if (!node) {
        return result;
      }
      result.push({ state: "visited", value: node.value });
      result.push({ state: "processed", value: node.value });
      helper(node.left, result);
      helper(node.right, result);
    };

    let array: Step[] = [];
    helper(node, array);
    return array;
  };

  const postOrderTraverse = (node: Node | null | undefined) => {
    const helper = (node: Node | null | undefined, result: Step[]) => {
      if (!node) {
        return result;
      }
      result.push({ state: "visited", value: node.value });
      helper(node.left, result);
      helper(node.right, result);
      result.push({ state: "processed", value: node.value });
    };

    let array: Step[] = [];
    helper(node, array);
    return array;
  };

  const updateTreeByValue = (
    node: Node | null | undefined,
    targetValue: number,
    state: string,
  ) => {
    if (!node) return null;

    const queue = new Queue<Node>(node);

    while (queue.length > 0) {
      const currentNode = queue.dequeue();
      if (currentNode.value === targetValue) {
        currentNode.state = state;
        return;
      }
      if (currentNode.left) {
        queue.enqueue(currentNode.left);
      }
      if (currentNode.right) {
        queue.enqueue(currentNode.right);
      }
    }

    return null;
  };

  const performStep = async () => {
    if (traversalStep === 0) {
      setTree(savedTree);
    }
    if (traversalStep === traversal.length) {
      setTraversalStep(0);
      setPlaying(false);
      setFinished(true);
      return;
    }
    if (listedTraversal.length < 30) {
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

  const handleInput = (event: any) => {
    const inputValue = event.target.value;
    const numericValue = parseInt(inputValue);
    setNumNodes(numericValue);
  };

  const handleStart = () => {
    if (finished) return;
    if (traversalStep === 0) {
      setListedTraversal([]);
      setTree(savedTree);
      setPlaying(true);
      setFinished(false);
    } else {
      setPlaying(!playing);
    }
  };

  const handleReset = () => {
    setListedTraversal([]);
    setTraversalStep(0);
    setTree(savedTree);
    setPlaying(false);
    setFinished(false);
  };

  const handleTraversalChange = (traversalFunc: Function) => {
    setListedTraversal([]);
    setTraversalStep(0);
    setTree(savedTree);
    setTraversal(traversalFunc(tree));
    setPlaying(false);
    setFinished(false);
  };

  useEffect(() => {
    if (!canvasRef.current || !tree) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const devicePixelRatio = window.devicePixelRatio || 1;

    const width = canvas.clientWidth * devicePixelRatio;
    const height = canvas.clientHeight * devicePixelRatio;

    canvas.width = width;
    canvas.height = height;

    ctx.scale(devicePixelRatio, devicePixelRatio);

    const drawNode = (node: Node, x: number, y: number, color: string) => {
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.font = `${nodeRadius}px Verdana`;
      ctx.fillStyle = color;
      ctx.fill();
      let xTextOffset = 0;
      if (node.value < 10) {
        xTextOffset = x - (4 * nodeRadius) / 15;
      } else if (node.value < 100) {
        xTextOffset = x - (7 * nodeRadius) / 12;
      } else {
        xTextOffset = x - (11 * nodeRadius) / 12;
      }
      if (nodeRadius > 2) {
        ctx.fillStyle = "black"; // Reset fill style
        ctx.fillText(node.value.toString(), xTextOffset, y + nodeRadius / 3);
      }
    };

    const drawTree = (node: Node | null) => {
      if (!node) return;

      let color = "white";
      if (node.state === "visited") {
        color = "yellow";
      } else if (node.state === "processed") {
        color = "green";
      }

      drawNode(node, node.x, node.y, color);

      if (node.left) {
        drawTree(node.left);
        ctx.beginPath();
        ctx.moveTo(node.x, node.y + nodeRadius);
        ctx.lineTo(node.left.x, node.left.y - 0.25 - nodeRadius);
        ctx.stroke();
      }

      if (node.right) {
        drawTree(node.right);
        ctx.beginPath();
        ctx.moveTo(node.x, node.y + nodeRadius);
        ctx.lineTo(node.right.x, node.right.y - 0.25 - nodeRadius);
        ctx.stroke();
      }
    };

    ctx.clearRect(0, 0, width, height);
    drawTree(tree);
  }, [tree]);

  function buildTree() {
    let tree;
    if (random) {
      tree = generateRandomTree(numNodes);
    } else {
      tree = generateTree(numNodes);
    }
    setTree(tree);
    setSavedTree(tree);
    setListedTraversal([]);
    setPlaying(false);
    setFinished(true);
    setTraversalStep(0);
  }

  useEffect(() => {
    if (selectedOption === "inOrder") {
      handleTraversalChange(inOrderTraverse);
      setTraversal(inOrderTraverse(tree));
    } else if (selectedOption === "preOrder") {
      handleTraversalChange(preOrderTraverse);
    } else if (selectedOption === "postOrder") {
      handleTraversalChange(postOrderTraverse);
    } else if (selectedOption === "bfs") {
      handleTraversalChange(bfs);
    }
  }, [selectedOption, updateTraversalFlag]);

  useEffect(() => {
    if (sortingSpeedLabel === "Fast") {
      setSortingSpeed(50);
    } else if (sortingSpeedLabel === "Medium") {
      setSortingSpeed(100);
    } else if (sortingSpeedLabel === "Slow") {
      setSortingSpeed(1000);
    }
  }, [sortingSpeedLabel]);

  // Performs one step to avoid the appearance of delay
  useEffect(() => {
    if (playing) {
      performStep();
    }
  }, [playing]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (playing) {
        performStep();
      } else {
      }
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
      <Modal
        sx={modalStyle}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => setModalOpen(false)}
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
                  style={{ position: "relative", left: 7, marginBottom: 13, height: 25 }}
                  type="number"
                  value={numNodes}
                  onChange={handleInput}
                />
              </label>
            </Box>
            {/* <Box>
            <label>
                Random Tree:
                <Switch onChange={() => setRandom(!random)} />
                </label>
            </Box> */}
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
                  value={selectedOption}
                  label="Age"
                  onChange={(event) => {
                    setSelectedOption(event.target.value);
                  }}
                  MenuProps={{
                    style: {
                      height: 400, // Set the maximum height of the menu
                    },
                  }}
                >
                  <MenuItem sx={{ fontSize: 10 }} value={"inOrder"}>
                    InOrder
                  </MenuItem>
                  <MenuItem sx={{ fontSize: 10 }} value={"preOrder"}>
                    PreOrder
                  </MenuItem>
                  <MenuItem sx={{ fontSize: 10 }} value={"postOrder"}>
                    PostOrder
                  </MenuItem>
                  <MenuItem sx={{ fontSize: 10 }} value={"bfs"}>
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
                    value={sortingSpeedLabel}
                    label="Age"
                    onChange={(event) => {
                      setSortingSpeedLabel(event.target.value);
                    }}
                    MenuProps={{
                      style: {
                        height: 400, // Set the maximum height of the menu
                      },
                    }}
                  >
                    <MenuItem sx={{ fontSize: 10 }} value={"Fast"}>
                      Fast
                    </MenuItem>
                    <MenuItem sx={{ fontSize: 10 }} value={"Medium"}>
                      Medium
                    </MenuItem>
                    <MenuItem sx={{ fontSize: 10 }} value={"Slow"}>
                      Slow
                    </MenuItem>
                  </Select>
                </label>
              </Box>
              <div style={{fontSize: 13, position: 'relative', bottom: 42}}>Note, the tree generator will attempt to randomly place nodes in the canvas until there is no more room. If the number you input contains more nodes than can fit on the screen, the tree generator will construct a tree with as many nodes as possible.</div>
            </Box>
          </Box>
        </Box>
      </Modal>
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
      <div style={{
            width: `${CANVAS_WIDTH_PERCENTAGE}%`,
            height: `${CANVAS_HEIGHT_PERCENTAGE}vh`,
            marginTop: "5px",
            position: "relative",
            left: 5,
          }}>
        
        <canvas
          ref={canvasRef}
          style={{
            width: `${100}%`,
            height: `${100}%`,
            backgroundColor: "lightblue",
          }}
        />
        <Button
                  style={{ marginRight: 5, height: 25, fontSize: 16, position: 'absolute', top: 10, right: 5}}
                  variant="contained"
                  onClick={() => {
                    buildTree();
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
          <Button
            style={{ marginRight: 5, height: 25, fontSize: 16 }}
            variant="contained"
            onClick={() => handleStart()}
          >
            Play
          </Button>
          <Button
            style={{ marginRight: 5, height: 25, fontSize: 16 }}
            variant="contained"
            onClick={() => {
              if (finished) return;
              performStep();
            }}
          >
            Step
          </Button>
          <Button
            style={{ marginRight: 5, height: 25, fontSize: 16 }}
            variant="contained"
            onClick={() => {
              handleReset();
            }}
          >
            Reset
          </Button>
          <Button
            style={{ marginRight: 5, height: 25, fontSize: 16 }}
            variant="contained"
            onClick={() => {
              setModalOpen(true);
            }}
          >
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BinaryTree;
