import React, { useEffect, useRef, useState } from "react";
import { Queue } from "queue-typescript";

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
  const DISPLAY_WIDTH = 300;
  const DISPLAY_HEIGHT = 450;
  const BASE_X_OFFSET = 50;
  const Y_OFFSET = 50;
  const NODE_RADIUS = 10;

  const generateTree = (size: number, initialX: number, initialY: number) => {
    let i = 2;
    const head = {
      value: 1,
      state: "clean",
      left: null,
      right: null,
      x: DISPLAY_WIDTH / 2,
      y: DISPLAY_HEIGHT / 5,
    };
    const queue = new Queue<Node>(head);
    let xOffset = BASE_X_OFFSET;
    while (i < size) {
      const current = queue.dequeue();
      current.left = {
        value: i,
        state: "clean",
        left: null,
        right: null,
        x: current.x - xOffset,
        y: current.y + Y_OFFSET,
      };
      current.right = {
        value: i + 1,
        state: "clean",
        left: null,
        right: null,
        x: current.x + xOffset,
        y: current.y + Y_OFFSET,
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
    generateTree(15, DISPLAY_WIDTH / 2, DISPLAY_HEIGHT / 5),
  );

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
      ctx.arc(x, y, NODE_RADIUS, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.fillStyle = "black"; // Reset fill style
      ctx.fillText(
        node.value.toString(),
        x - NODE_RADIUS / 5,
        y + NODE_RADIUS / 5,
      );
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
        ctx.moveTo(node.x, node.y + NODE_RADIUS);
        ctx.lineTo(node.left.x, node.left.y - NODE_RADIUS);
        ctx.stroke();
      }

      if (node.right) {
        drawTree(node.right);
        ctx.beginPath();
        ctx.moveTo(node.x, node.y + NODE_RADIUS);
        ctx.lineTo(node.right.x, node.right.y - NODE_RADIUS);
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

  const animate = async () => {
    for (const step of traversal) {
      if (tree) {
        setTree((prevTree) => {
          const currentTree = JSON.parse(JSON.stringify(prevTree));
          updateTreeByValue(currentTree, step.value, step.state);
          return currentTree; // Return the updated state
        });
      }
      await delay(500);
    }
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
      <button
        onClick={() => {
          const x: Step[] = [];
          postOrderTraverse(tree, x);
          setTraversal(x);
        }}
      >
        Set
      </button>
      <button
        onClick={() => {
          animate();
        }}
      >
        Start
      </button>
      <canvas
        ref={canvasRef}
        style={{
          width: DISPLAY_WIDTH,
          height: DISPLAY_HEIGHT,
          backgroundColor: "lightblue",
          marginTop: "10px",
        }}
      />
    </div>
  );
};

export default BinaryTree;
