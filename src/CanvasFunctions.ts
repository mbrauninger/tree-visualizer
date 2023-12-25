import { Node } from "./Types";
import { NODE_RADIUS } from "./Constants";

/**
 * Draws a tree node.
 * @param ctx - The canvas context object.
 * @param node - The node object to draw.
 * @param color - The color of the node.
 */
const drawNode = (ctx: CanvasRenderingContext2D, node: Node, color: string) => {
  ctx.beginPath();
  ctx.arc(node.x, node.y, NODE_RADIUS, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.font = `${NODE_RADIUS}px Verdana`;
  ctx.fillStyle = color;
  ctx.fill();
  let xTextOffset = 0;
  if (node.value < 10) {
    xTextOffset = node.x - (4 * NODE_RADIUS) / 15;
  } else if (node.value < 100) {
    xTextOffset = node.x - (7 * NODE_RADIUS) / 12;
  } else {
    xTextOffset = node.x - (11 * NODE_RADIUS) / 12;
  }
  if (NODE_RADIUS > 2) {
    ctx.fillStyle = "black"; // Reset fill style
    ctx.fillText(node.value.toString(), xTextOffset, node.y + NODE_RADIUS / 3);
  }
};

/**
 *
 * @param ctx - The canvas context object.
 * @param node - The head of the tree.
 * @returns
 */
const drawTree = (ctx: CanvasRenderingContext2D, node: Node | null) => {
  if (!node) return;

  let color = "white";
  if (node.state === "visited") {
    color = "yellow";
  } else if (node.state === "processed") {
    color = "green";
  }

  drawNode(ctx, node, color);

  if (node.left) {
    drawTree(ctx, node.left);
    ctx.beginPath();
    ctx.moveTo(node.x, node.y + NODE_RADIUS);
    ctx.lineTo(node.left.x, node.left.y - 0.25 - NODE_RADIUS);
    ctx.stroke();
  }

  if (node.right) {
    drawTree(ctx, node.right);
    ctx.beginPath();
    ctx.moveTo(node.x, node.y + NODE_RADIUS);
    ctx.lineTo(node.right.x, node.right.y - 0.25 - NODE_RADIUS);
    ctx.stroke();
  }
};

/**
 * Draws the entire canvas.
 * @param canvasRef - The ref to the canvas.
 * @param tree - The head of the tree.
 */
export function drawCanvas(
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
  tree: Node | null,
) {
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

  ctx.clearRect(0, 0, width, height);
  drawTree(ctx, tree);
}
