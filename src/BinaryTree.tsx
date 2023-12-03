import { useEffect, useRef, useState } from "react";
import { Queue } from "queue-typescript";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import ScrollableTable from "./ScrollableTable";

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
  const CANVAS_WIDTH_PERCENTAGE = 70;
  const CANVAS_HEIGHT_PERCENTAGE = 80;
  const DISPLAY_WIDTH = (window.innerWidth * CANVAS_WIDTH_PERCENTAGE) / 100;
  const DISPLAY_HEIGHT = (window.innerHeight * CANVAS_HEIGHT_PERCENTAGE) / 100;
  const DEFAULT_RADIUS = 10;
  const DEFAULT_NUM_NODES = 15;
  const [nodeRadius, setNodeRadius] = useState(DEFAULT_RADIUS);
  const [numNodes, setNumNodes] = useState(DEFAULT_NUM_NODES);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(true);
  const [traversalStep, setTraversalStep] = useState(0);

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

  const [baseXOffset, setBaseXOffset] = useState(calculateBaseXOffset());

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
    let xOffset = baseXOffset;
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

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [traversal, setTraversal] = useState<Step[]>([]);
  const [listedTraversal, setListedTraversal] = useState<Step[]>([]);
  const [tree, setTree] = useState<Node | null>(
    generateTree(DEFAULT_NUM_NODES),
  );
  const [selectedOption, setSelectedOption] = useState("inOrder"); // Default option

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
    if (traversalStep === traversal.length) {
      setTraversalStep(0);
      setPlaying(false);
      setFinished(true);
      return;
    }
    setListedTraversal((prevListed) => [
      ...prevListed,
      traversal[traversalStep],
    ]);
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
    const numericValue = parseInt(inputValue, 10);
    setNumNodes(numericValue);
  };

  const handleStart = () => {
    setListedTraversal([]);
    setTraversalStep(0);
    setTree(generateTree(numNodes));
    setPlaying(true);
    setFinished(false);
  };

  const handleTraversalChange = (traversalFunc: Function) => {
    setListedTraversal([]);
    setTraversalStep(0);
    setTree(generateTree(numNodes));
    setTraversal(traversalFunc(tree));
    setPlaying(false);
    setFinished(true);
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

  useEffect(() => {
    let currentRadius = DEFAULT_RADIUS;
    while (
      calculateBottomWidth(currentRadius) >
      DISPLAY_WIDTH - 20 - nodeRadius
    ) {
      currentRadius -= 1;
    }
    setNodeRadius(currentRadius);
    setBaseXOffset(calculateBaseXOffset());
  }, [numNodes]);

  useEffect(() => {
    if (selectedOption === "inOrder") {
        handleTraversalChange(inOrderTraverse)
      setTraversal(inOrderTraverse(tree));
    } else if (selectedOption === "preOrder") {
        handleTraversalChange(preOrderTraverse)
    } else if (selectedOption === "postOrder") {
        handleTraversalChange(postOrderTraverse)
    }
  }, [selectedOption]);

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
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [playing, traversalStep]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: `${CANVAS_WIDTH_PERCENTAGE}%`,
            height: `${CANVAS_HEIGHT_PERCENTAGE}vh`,
            backgroundColor: "lightblue",
            marginTop: "5px",
          }}
        />
        <ScrollableTable data={listedTraversal} />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          marginTop: "5px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "start",
          }}
        >
          <Select
            style={{ marginRight: 5, height: 15, width: 100, fontSize: 10 }}
            value={selectedOption}
            label="Age"
            onChange={(event) => {
              setSelectedOption(event.target.value);
            }}
          >
            <MenuItem value={"inOrder"}>inOrder</MenuItem>
            <MenuItem value={"preOrder"}>preOrder</MenuItem>
            <MenuItem value={"postOrder"}>postOrder</MenuItem>
          </Select>
          <Button
            style={{ marginRight: 5, height: 15, fontSize: 10 }}
            variant="contained"
            onClick={() => handleStart()}
          >
            Start
          </Button>
          <Button
            style={{ marginRight: 5, height: 15, fontSize: 10 }}
            variant="contained"
            onClick={() => {
              performStep();
            }}
          >
            Click Through
          </Button>
          <Button
            style={{ marginRight: 5, height: 15, fontSize: 10 }}
            variant="contained"
            onClick={() => {
              if (finished) return;
              setPlaying(!playing);
            }}
          >
            Pause
          </Button>
          <Button
            style={{ marginRight: 5, height: 15, fontSize: 10 }}
            variant="contained"
            onClick={() => {
              setTree(generateTree(numNodes));
            }}
          >
            Generate Tree
          </Button>
        </div>
        <div>
          <label>
            Node Count:
            <input type="number" value={numNodes} onChange={handleInput} />
          </label>
        </div>
      </div>
    </div>
  );
};

export default BinaryTree;
