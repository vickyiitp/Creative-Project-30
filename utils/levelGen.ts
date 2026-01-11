import { NodeData, EdgeData, Point } from '../types';
import { NODE_WIDTH, NODE_HEIGHT, CANVAS_PADDING, FUNCTION_NAMES } from '../constants';
import { doLinesIntersect } from './geometry';

// Helper to generate a random planar graph
export const generateLevel = (level: number, width: number, height: number): { nodes: NodeData[], edges: EdgeData[] } => {
  const nodeCount = 4 + level; // Increase nodes with levels
  const nodes: NodeData[] = [];
  const edges: EdgeData[] = [];
  const edgeSet = new Set<string>();

  // 1. Position nodes in a circle initially to guarantee we can create a planar graph easily
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - CANVAS_PADDING - 100;

  for (let i = 0; i < nodeCount; i++) {
    const angle = (2 * Math.PI * i) / nodeCount;
    // Initial positions for generating edges - these are "virtual" positions on a circle
    // We will scramble these later for the puzzle.
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    nodes.push({
      id: `node-${i}`,
      label: FUNCTION_NAMES[i % FUNCTION_NAMES.length],
      type: i % 3 === 0 ? 'function' : i % 3 === 1 ? 'class' : 'variable',
      x, 
      y,
      width: NODE_WIDTH,
      height: NODE_HEIGHT
    });
  }

  // 2. Connect nodes to form a cycle (guarantees connectivity)
  for (let i = 0; i < nodeCount; i++) {
    const target = (i + 1) % nodeCount;
    const u = nodes[i];
    const v = nodes[target];
    edges.push({
      id: `edge-${i}-${target}`,
      sourceId: u.id,
      targetId: v.id,
      isIntersecting: false
    });
    edgeSet.add(`${i}-${target}`);
    edgeSet.add(`${target}-${i}`);
  }

  // 3. Add random non-crossing chords (internal edges)
  // Since points are on a convex hull (circle), a straight line between non-adjacent vertices
  // is a valid edge if it doesn't cross existing edges.
  // We try to add (nodeCount - 3) chords to triangulate, or slightly fewer for easier levels.
  const maxEdges = level * 2 + nodeCount;
  let attempts = 0;

  while (edges.length < maxEdges && attempts < 200) {
    attempts++;
    const i = Math.floor(Math.random() * nodeCount);
    const j = Math.floor(Math.random() * nodeCount);

    if (i === j || Math.abs(i - j) === 1 || (i === 0 && j === nodeCount - 1) || (j === 0 && i === nodeCount - 1)) {
      continue; // Adjacent or same
    }
    
    if (edgeSet.has(`${i}-${j}`)) continue;

    // Check intersection with existing edges
    const p1 = { x: nodes[i].x, y: nodes[i].y };
    const p2 = { x: nodes[j].x, y: nodes[j].y };
    
    let intersects = false;
    for (const edge of edges) {
      const uIdx = parseInt(edge.sourceId.split('-')[1]);
      const vIdx = parseInt(edge.targetId.split('-')[1]);
      
      const p3 = { x: nodes[uIdx].x, y: nodes[uIdx].y };
      const p4 = { x: nodes[vIdx].x, y: nodes[vIdx].y };

      // We only care about strict intersection, not sharing endpoints
      if (uIdx !== i && uIdx !== j && vIdx !== i && vIdx !== j) {
         if (doLinesIntersect(p1, p2, p3, p4)) {
           intersects = true;
           break;
         }
      }
    }

    if (!intersects) {
      edges.push({
        id: `edge-${i}-${j}`,
        sourceId: nodes[i].id,
        targetId: nodes[j].id,
        isIntersecting: false
      });
      edgeSet.add(`${i}-${j}`);
      edgeSet.add(`${j}-${i}`);
    }
  }

  // 4. Scramble node positions to create the puzzle
  // Keep them somewhat centered but random
  nodes.forEach(node => {
    node.x = CANVAS_PADDING + Math.random() * (width - NODE_WIDTH - CANVAS_PADDING * 2);
    node.y = CANVAS_PADDING + Math.random() * (height - NODE_HEIGHT - CANVAS_PADDING * 2);
  });

  return { nodes, edges };
};
