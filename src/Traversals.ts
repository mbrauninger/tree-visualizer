import { Node } from "./Types";
import { Step } from "./Types";

export const bfs = (node: Node | null | undefined) => {
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

export const inOrderTraverse = (node: Node | null | undefined) => {
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

export const preOrderTraverse = (node: Node | null | undefined) => {
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

export const postOrderTraverse = (node: Node | null | undefined) => {
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
