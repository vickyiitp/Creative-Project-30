import { Point } from '../types';

// Check if two line segments (p1-p2 and p3-p4) intersect
export const doLinesIntersect = (p1: Point, p2: Point, p3: Point, p4: Point): boolean => {
  const det = (p2.x - p1.x) * (p4.y - p3.y) - (p4.x - p3.x) * (p2.y - p1.y);
  
  if (det === 0) {
    return false; // Parallel lines
  }

  const lambda = ((p4.y - p3.y) * (p4.x - p1.x) + (p3.x - p4.x) * (p4.y - p1.y)) / det;
  const gamma = ((p1.y - p2.y) * (p4.x - p1.x) + (p2.x - p1.x) * (p4.y - p1.y)) / det;

  // Check if intersection point is strictly within the segments
  // We use a small epsilon to avoid floating point errors at endpoints (sharing a node is NOT an intersection)
  const epsilon = 0.001;
  return (epsilon < lambda && lambda < 1 - epsilon) && (epsilon < gamma && gamma < 1 - epsilon);
};

// Calculate distance between two points
export const distance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};
