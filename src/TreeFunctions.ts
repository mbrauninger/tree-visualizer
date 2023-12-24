import { NODE_RADIUS, DISPLAY_WIDTH, DISPLAY_HEIGHT } from "./Constants";
import { Node } from "./Types";
import { Queue } from "queue-typescript";

function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

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

export const updateTreeByValue = (
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

export const generateRandomTree = (size: number) => {
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
    return distance < 2 * NODE_RADIUS + 2 * nodeBorder;
  }

  function isInWidth(node: Node) {
    return node.x - NODE_RADIUS > 0 && node.x + NODE_RADIUS < DISPLAY_WIDTH;
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
    const minXOffset = 2 * NODE_RADIUS + 1;
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
        potentialNode.y + NODE_RADIUS < DISPLAY_HEIGHT &&
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
        potentialNode.y + NODE_RADIUS < DISPLAY_HEIGHT &&
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
        potentialNode.y + NODE_RADIUS < DISPLAY_HEIGHT &&
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
        potentialNode.y + NODE_RADIUS < DISPLAY_HEIGHT &&
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
    leafNodes.splice(index, 1);
    if (leafNodes.length === 0) {
      console.log(`Only could fit ${i} nodes in the screen`);
    }
  }
  bfsNumberAssign(head);
  return head;
};
