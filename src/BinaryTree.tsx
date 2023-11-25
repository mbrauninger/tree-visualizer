import React, { useEffect, useRef, useState } from "react";
import { Queue } from "queue-typescript";
import Grid from "@mui/material/Grid";
import  Table from "@mui/material/Table";

interface Node {
  value: number;
  left?: Node | null;
  right?: Node | null;
  state: string;
  x: number;
  y: number;
}

interface Step {
  value: number;
  state: string;
}

const BinaryTree = () => {
  const CANVAS_WIDTH_PERCENTAGE = 90; // Set your desired width percentage
  const CANVAS_HEIGHT_PERCENTAGE = 90; // Set your desired height percentage
  const DISPLAY_WIDTH = window.innerWidth * CANVAS_WIDTH_PERCENTAGE / 100;
  const DISPLAY_HEIGHT = window.innerHeight * CANVAS_HEIGHT_PERCENTAGE / 100;
  console.log(DISPLAY_HEIGHT)
  const DEFAULT_RADIUS = 10;
  const DEFAULT_NUM_NODES = 15
  const [nodeRadius, setNodeRadius] = useState(DEFAULT_RADIUS);
  const [numNodes, setNumNodes] = useState(DEFAULT_NUM_NODES);

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
  useEffect(() => {
    let currentRadius = DEFAULT_RADIUS;
    while (calculateBottomWidth(currentRadius) > DISPLAY_WIDTH - 20 - nodeRadius) {
        currentRadius -= 1;
    }
    setNodeRadius(currentRadius);
    setBaseXOffset(calculateBaseXOffset())
  }, [numNodes])

  const generateTree = (size: number) => {
    const numLevels = Math.floor(Math.log2(numNodes));
    const yOffset = (DISPLAY_HEIGHT - 10) / (numLevels + 1)
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
    console.log(xOffset)
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
  const [tree, setTree] = useState<Node | null>(
    generateTree(DEFAULT_NUM_NODES)
  );
  const [selectedOption, setSelectedOption] = useState('inOrder'); // Default option

  useEffect(() => {
    if (selectedOption === 'inOrder') {
        const x: Step[] = []; inOrderTraverse(tree, x); setTraversal(x)
    } else if (selectedOption === 'preOrder') {
        const x: Step[] = []; preOrderTraverse(tree, x); setTraversal(x)
    } else if (selectedOption === 'postOrder') {
        const x: Step[] = []; postOrderTraverse(tree, x); setTraversal(x)
    }
  }, [selectedOption, tree])

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
      ctx.font = `${nodeRadius}px Verdana`
      ctx.fillStyle = color;
      ctx.fill();
      let xTextOffset = 0;
      if (node.value < 10) {
        xTextOffset = x - 4 * nodeRadius / 15;
      } else if (node.value < 100) {
        xTextOffset = x - 7 * nodeRadius / 12;
      }
      if (nodeRadius > 2) {
          ctx.fillStyle = "black"; // Reset fill style
          ctx.fillText(
            node.value.toString(),
            xTextOffset,
            y + nodeRadius / 3,
          );
      }
    };

    const drawTree = (node: Node | null) => {
      if (!node) return;

      let color = "white";
      if (node.state === "highlighted") {
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

  async function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const inOrderTraverse = (node: Node | null | undefined, result: Step[]) => {
    if (!node) {
      return result;
    }
    result.push({ state: "highlighted", value: node.value });
    inOrderTraverse(node.left, result);
    result.push({ state: "processed", value: node.value });
    inOrderTraverse(node.right, result);
  };

  const preOrderTraverse = (node: Node | null | undefined, result: Step[]) => {
    if (!node) {
      return result;
    }
    result.push({ state: "processed", value: node.value });
    preOrderTraverse(node.left, result);
    preOrderTraverse(node.right, result);
  };

  const postOrderTraverse = (node: Node | null | undefined, result: Step[]) => {
    if (!node) {
      return result;
    }
    result.push({ state: "highlighted", value: node.value });
    postOrderTraverse(node.left, result);
    postOrderTraverse(node.right, result);
    result.push({ state: "processed", value: node.value });
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

  const animate = async (traversal: Step[]) => {
    for (const step of traversal) {
      if (tree) {
        setTree((prevTree) => {
          const currentTree = JSON.parse(JSON.stringify(prevTree));
          updateTreeByValue(currentTree, step.value, step.state);
          return currentTree; // Return the updated state
        });
      }
      await delay(100);
    }
  };

  const handleInput = (event: any) => {
    const inputValue = event.target.value;
    // Convert the input value to a number using parseInt or parseFloat
    const numericValue = parseInt(inputValue, 10); // Use parseFloat if dealing with decimal numbers
    setNumNodes(numericValue); // Set to an empty string if conversion fails
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "20px",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
            width: `${CANVAS_WIDTH_PERCENTAGE}%`,
            height: `${CANVAS_HEIGHT_PERCENTAGE}vh`,
          backgroundColor: "lightblue",
          marginTop: "10px",
        }}
      />
      <button
        onClick={() => {
            setTree(generateTree(numNodes))
            const x: Step[] = [];
          postOrderTraverse(tree, x);
          setTraversal(x);
          animate(traversal);
        }}
      >
        Start
      </button>
      <button
        onClick={() => {
            setTree(generateTree(numNodes));
        }}
      >
        Generate Tree
      </button>
      <div>
        <label>
          <input
            type="radio"
            value="inOrder"
            checked={selectedOption === 'inOrder'}
            onChange={() => setSelectedOption('inOrder')}
          />
          In-Order
        </label>
        <label>
          <input
            type="radio"
            value="postOrder"
            checked={selectedOption === 'postOrder'}
            onChange={() => setSelectedOption('postOrder')}
          />
          Pre-Order
        </label>
        <label>
          <input
            type="radio"
            value="preOrder"
            checked={selectedOption === 'preOrder'}
            onChange={() => setSelectedOption('preOrder')}
          />
          Post-Order
        </label>
      </div>
      <div>
        <label>
          Node Count:
          <input
            type="number"
            value={numNodes}
            onChange={handleInput}
          />
        </label>
      </div>
    </div>
  );
};

export default BinaryTree;
