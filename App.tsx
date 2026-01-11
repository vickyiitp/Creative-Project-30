import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NodeData, EdgeData, Point } from './types';
import { generateLevel } from './utils/levelGen';
import { doLinesIntersect } from './utils/geometry';
import { NODE_WIDTH, NODE_HEIGHT, COLORS } from './constants';
import { Play, RotateCcw, CheckCircle, Code, Settings } from 'lucide-react';
import LandingPage from './LandingPage';

// --- Error Boundary Component ---
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(_: any): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Game Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white p-4 text-center">
          <h1 className="text-3xl font-bold mb-4 text-red-500">System Failure</h1>
          <p className="mb-6 text-slate-400">A critical runtime error occurred. Please refresh the page.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-sky-600 px-6 py-2 rounded-lg font-bold hover:bg-sky-500"
          >
            Reboot System
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Particle System for Win Effect ---
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
}

export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  // Load saved level from localStorage or default to 1
  const [level, setLevel] = useState(() => {
    try {
      const saved = localStorage.getItem('spaghetti-level');
      return saved ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  });
  
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [edges, setEdges] = useState<EdgeData[]>([]);
  const [isSolved, setIsSolved] = useState(false);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // For particles

  // Save progress
  useEffect(() => {
    try {
      localStorage.setItem('spaghetti-level', level.toString());
    } catch (e) {
      console.warn("Could not save progress", e);
    }
  }, [level]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize Level
  const initLevel = useCallback((lvl: number) => {
    // Generate based on current window size
    const { nodes: newNodes, edges: newEdges } = generateLevel(lvl, window.innerWidth, window.innerHeight);
    setNodes(newNodes);
    setEdges(newEdges);
    setIsSolved(false);
  }, []);

  // Check for intersections
  const checkIntersections = useCallback((currentNodes: NodeData[], currentEdges: EdgeData[]): EdgeData[] => {
    const nodeMap = new Map(currentNodes.map(n => [n.id, n]));
    
    // Reset intersection status
    const updatedEdges = currentEdges.map(e => ({ ...e, isIntersecting: false }));
    let anyIntersection = false;

    // Center point of nodes for line calculation
    const getCenter = (n: NodeData) => ({ x: n.x + n.width / 2, y: n.y + n.height / 2 });

    for (let i = 0; i < updatedEdges.length; i++) {
      for (let j = i + 1; j < updatedEdges.length; j++) {
        const edgeA = updatedEdges[i];
        const edgeB = updatedEdges[j];

        // Skip if they share a node
        if (edgeA.sourceId === edgeB.sourceId || edgeA.sourceId === edgeB.targetId ||
            edgeA.targetId === edgeB.sourceId || edgeA.targetId === edgeB.targetId) {
          continue;
        }

        const nA1 = nodeMap.get(edgeA.sourceId)!;
        const nA2 = nodeMap.get(edgeA.targetId)!;
        const nB1 = nodeMap.get(edgeB.sourceId)!;
        const nB2 = nodeMap.get(edgeB.targetId)!;

        if (doLinesIntersect(getCenter(nA1), getCenter(nA2), getCenter(nB1), getCenter(nB2))) {
          updatedEdges[i].isIntersecting = true;
          updatedEdges[j].isIntersecting = true;
          anyIntersection = true;
        }
      }
    }

    if (!anyIntersection && !isSolved) {
      setIsSolved(true);
      triggerConfetti();
    } else if (anyIntersection && isSolved) {
      setIsSolved(false);
    }

    return updatedEdges;
  }, [isSolved]);

  // Initial Load - Only if playing
  useEffect(() => {
    if (isPlaying) {
      initLevel(level);
    }
  }, [level, initLevel, isPlaying]);

  // Update edges when nodes move
  useEffect(() => {
    if (nodes.length > 0 && edges.length > 0) {
      const newEdges = checkIntersections(nodes, edges);
      // Determine if we need to update state to avoid render loops
      // We check if intersection counts match
      const countIntersecting = newEdges.filter(e => e.isIntersecting).length;
      const prevIntersecting = edges.filter(e => e.isIntersecting).length;
      
      if (countIntersecting !== prevIntersecting || (countIntersecting === 0 && !isSolved)) {
          setEdges(newEdges);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes]); 

  // --- Confetti Logic ---
  const triggerConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const colors = ['#38bdf8', '#f472b6', '#facc15', '#22c55e', '#ffffff'];
    
    // Spawn particles
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 1.0
        });
    }

    const animate = () => {
        if (!canvasRef.current) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let alive = false;
        particles.forEach(p => {
            if (p.life > 0) {
                alive = true;
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.2; // Gravity
                p.vx *= 0.95; // Friction
                p.life -= 0.01;
                
                ctx.globalAlpha = Math.max(0, p.life);
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        if (alive) {
            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };
    animate();
  };

  // --- Input Handlers (Mouse + Touch) ---
  
  const handleStart = (clientX: number, clientY: number, nodeId: string) => {
    if (isSolved) return; 
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      // Find the element via DOM to get accurate offset
      // (Using a simple search by ID style attribute or similar would be better in a bigger app,
      // but here we rely on the React structure)
      // Since we map nodes, we can calculate offset from node.x/y state directly
      // relative to the click.
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      setDragOffset({
        x: clientX - containerRect.left - node.x,
        y: clientY - containerRect.top - node.y
      });
      setDraggingNode(nodeId);
    }
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (draggingNode) {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const newX = clientX - containerRect.left - dragOffset.x;
      const newY = clientY - containerRect.top - dragOffset.y;

      // Bound checks (keep inside screen with padding)
      const clampedX = Math.max(10, Math.min(newX, dimensions.width - NODE_WIDTH - 10));
      const clampedY = Math.max(10, Math.min(newY, dimensions.height - NODE_HEIGHT - 10));

      setNodes(prev => prev.map(n => 
        n.id === draggingNode ? { ...n, x: clampedX, y: clampedY } : n
      ));
    }
  };

  const handleEnd = () => {
    setDraggingNode(null);
  };

  // Mouse Events
  const onMouseDown = (e: React.MouseEvent, nodeId: string) => {
      e.stopPropagation(); // Prevent hitting container
      handleStart(e.clientX, e.clientY, nodeId);
  };

  const onMouseMove = (e: React.MouseEvent) => {
      handleMove(e.clientX, e.clientY);
  };

  // Touch Events
  const onTouchStart = (e: React.TouchEvent, nodeId: string) => {
      // e.preventDefault(); // Sometimes needed to prevent scroll, but handled by css touch-action usually
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY, nodeId);
  };

  const onTouchMove = (e: React.TouchEvent) => {
      // Prevent scrolling while dragging
      if (draggingNode) {
          // e.preventDefault(); 
      }
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
  };

  const handleNextLevel = () => {
    setLevel(l => l + 1);
  };

  const handleReset = () => {
    initLevel(level);
  };

  // Render Helpers
  const getNodeCenter = (id: string) => {
    const n = nodes.find(x => x.id === id);
    if (!n) return { x: 0, y: 0 };
    return { x: n.x + n.width / 2, y: n.y + n.height / 2 };
  };

  if (!isPlaying) {
    return <LandingPage onStart={() => setIsPlaying(true)} />;
  }

  return (
    <div 
      className="w-full h-screen bg-slate-900 text-slate-200 overflow-hidden flex flex-col select-none relative font-mono touch-none"
      onMouseMove={onMouseMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchMove={onTouchMove}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
    >
      {/* Particle Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-50" />

      {/* Header / HUD */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20 pointer-events-none">
        <div className="bg-slate-800/90 backdrop-blur border border-slate-700 p-3 rounded-lg shadow-xl flex items-center gap-4 pointer-events-auto">
          <div className="flex items-center gap-2">
            <Code className="text-sky-400 hidden sm:block" size={20} />
            <h1 className="font-bold text-lg tracking-tight">Spaghetti<span className="text-sky-400">Untangler</span></h1>
          </div>
          <div className="h-6 w-px bg-slate-600"></div>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Level</span>
            <span className="text-xl font-mono text-white">{level}</span>
          </div>
          <div className="h-6 w-px bg-slate-600"></div>
           <div className="flex flex-col leading-none">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Status</span>
            <span className={`text-sm font-mono font-bold ${isSolved ? 'text-green-400' : 'text-amber-400'}`}>
              {isSolved ? 'COMPILED' : 'ERROR'}
            </span>
          </div>
        </div>

        <div className="flex gap-2 pointer-events-auto">
             <button 
            onClick={handleReset}
            className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-lg border border-slate-700 shadow-lg transition-all flex items-center justify-center"
            title="Reset Level"
            aria-label="Reset Level"
          >
            <RotateCcw size={18} />
          </button>
           <button 
            onClick={() => setIsPlaying(false)}
            className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-lg border border-slate-700 shadow-lg transition-all hidden sm:flex items-center justify-center"
            title="Exit to Menu"
            aria-label="Exit to Menu"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Victory Overlay */}
      {isSolved && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-500 p-4">
          <div className="bg-slate-800 border-2 border-green-500 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 max-w-md w-full text-center transform scale-100 transition-all">
            <div className="bg-green-500/20 p-4 rounded-full animate-bounce">
                <CheckCircle className="text-green-400 w-16 h-16" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Build Successful!</h2>
              <p className="text-slate-400">The spaghetti code has been refactored successfully.</p>
            </div>
            <button 
              onClick={handleNextLevel}
              className="group bg-green-500 hover:bg-green-400 text-slate-900 font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-105 w-full shadow-[0_0_20px_rgba(34,197,94,0.4)]"
            >
              <Play className="fill-current" size={20} />
              Deploy to Production
            </button>
          </div>
        </div>
      )}

      {/* Game Area */}
      <div className="relative flex-1 w-full h-full" ref={containerRef}>
        
        {/* Connection Lines (SVG Layer) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
                <filter id="glow-normal" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                 <filter id="glow-intersect" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feFlood floodColor={COLORS.lineIntersect} result="color" />
                    <feComposite in="color" in2="blur" operator="in" result="glow" />
                    <feComposite in="SourceGraphic" in2="glow" operator="over" />
                </filter>
            </defs>
          {edges.map((edge) => {
            const start = getNodeCenter(edge.sourceId);
            const end = getNodeCenter(edge.targetId);
            
            const strokeColor = isSolved 
                ? COLORS.lineSolved 
                : edge.isIntersecting 
                    ? COLORS.lineIntersect 
                    : COLORS.lineNormal;

            const strokeWidth = edge.isIntersecting ? 3 : 2;
            const opacity = edge.isIntersecting ? 1 : 0.6;

            return (
              <line
                key={edge.id}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                opacity={opacity}
                strokeLinecap="round"
                filter={isSolved ? "url(#glow-normal)" : (edge.isIntersecting ? "url(#glow-intersect)" : "")}
                className="transition-colors duration-300"
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => {
            let borderColor = COLORS.nodeBorder;
            let icon = null;
            if (node.type === 'function') {
                borderColor = COLORS.accentFunction;
                icon = <span className="text-sky-400 mr-2 font-bold font-mono">ƒ</span>;
            } else if (node.type === 'class') {
                borderColor = COLORS.accentClass;
                icon = <span className="text-pink-400 mr-2 font-bold font-mono">©</span>;
            } else {
                borderColor = COLORS.accentVar;
                icon = <span className="text-yellow-400 mr-2 font-bold font-mono">x</span>;
            }

            return (
                <div
                    key={node.id}
                    className={`node-element absolute rounded-md shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing border-l-4 transition-transform z-10 select-none touch-none ${draggingNode === node.id ? 'z-30 scale-105 shadow-2xl ring-2 ring-white/20' : 'hover:scale-105'}`}
                    style={{
                        left: node.x,
                        top: node.y,
                        width: node.width,
                        height: node.height,
                        backgroundColor: COLORS.nodeBg,
                        borderLeftColor: borderColor,
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                        backgroundSize: '10px 10px'
                    }}
                    onMouseDown={(e) => onMouseDown(e, node.id)}
                    onTouchStart={(e) => onTouchStart(e, node.id)}
                >
                    <div className="flex items-center px-3 w-full pointer-events-none">
                        {icon}
                        <span className="font-mono text-xs sm:text-sm truncate text-slate-300">{node.label}</span>
                    </div>
                    
                    {/* Fake connector dots */}
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-500"></div>
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-500"></div>
                </div>
            );
        })}
      </div>
      
      {/* Footer Instructions */}
      <div className="absolute bottom-6 w-full text-center pointer-events-none z-10 px-4">
          <p className="text-slate-400 text-[10px] sm:text-xs uppercase tracking-widest font-semibold bg-slate-900/90 inline-block px-4 py-2 rounded-full backdrop-blur border border-slate-800 shadow-xl">
              {isSolved ? "System Stable. Ready for Deploy." : "Drag blocks to untangle dependencies"}
          </p>
      </div>
    </div>
  );
}