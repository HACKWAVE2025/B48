import React, { useRef, useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { 
  X, 
  Pencil, 
  Square, 
  Circle, 
  Type, 
  Eraser, 
  Trash2, 
  Download,
  Undo,
  Redo,
  Minus
} from 'lucide-react';

const Whiteboard = ({ sessionId, onClose, isViewOnly = false }) => {
  const canvasRef = useRef(null);
  const { socket } = useSocket();
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Redraw from history after resize
      if (history.length > 0 && historyStep >= 0) {
        redrawCanvas(history[historyStep]);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Load saved whiteboard data
    if (socket) {
      socket.emit('load_whiteboard', { sessionId });

      socket.on('whiteboard_loaded', ({ data }) => {
        if (data && data.length > 0) {
          setHistory(data);
          setHistoryStep(data.length - 1);
          redrawCanvas(data[data.length - 1]);
        }
      });

      socket.on('whiteboard_draw', ({ drawData }) => {
        performDraw(drawData);
      });

      socket.on('whiteboard_clear', () => {
        clearCanvas();
      });
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (socket) {
        socket.off('whiteboard_loaded');
        socket.off('whiteboard_draw');
        socket.off('whiteboard_clear');
      }
    };
  }, [socket, sessionId]);

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL();
    
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imageData);
    
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);

    // Save to server
    if (socket && !isViewOnly) {
      socket.emit('save_whiteboard', {
        sessionId,
        data: newHistory
      });
    }
  };

  const redrawCanvas = (imageData) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = imageData;
  };

  const performDraw = (drawData) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = drawData.color;
    ctx.lineWidth = drawData.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (drawData.tool === 'pen' || drawData.tool === 'eraser') {
      if (drawData.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = drawData.lineWidth * 5;
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.beginPath();
      ctx.moveTo(drawData.startX, drawData.startY);
      ctx.lineTo(drawData.endX, drawData.endY);
      ctx.stroke();
    } else if (drawData.tool === 'line') {
      ctx.beginPath();
      ctx.moveTo(drawData.startX, drawData.startY);
      ctx.lineTo(drawData.endX, drawData.endY);
      ctx.stroke();
    } else if (drawData.tool === 'rectangle') {
      ctx.strokeRect(
        drawData.startX,
        drawData.startY,
        drawData.endX - drawData.startX,
        drawData.endY - drawData.startY
      );
    } else if (drawData.tool === 'circle') {
      const radius = Math.sqrt(
        Math.pow(drawData.endX - drawData.startX, 2) +
        Math.pow(drawData.endY - drawData.startY, 2)
      );
      ctx.beginPath();
      ctx.arc(drawData.startX, drawData.startY, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  };

  const startDrawing = (e) => {
    if (isViewOnly) return;
    
    const pos = getMousePos(e);
    setIsDrawing(true);
    setStartPos(pos);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'pen' || tool === 'eraser') {
      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = lineWidth * 5;
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e) => {
    if (!isDrawing || isViewOnly) return;

    const pos = getMousePos(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (tool === 'pen' || tool === 'eraser') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();

      // Emit draw event for real-time collaboration
      if (socket) {
        socket.emit('whiteboard_draw', {
          sessionId,
          drawData: {
            tool,
            color,
            lineWidth,
            startX: pos.x - 1,
            startY: pos.y - 1,
            endX: pos.x,
            endY: pos.y
          }
        });
      }
    }
  };

  const stopDrawing = (e) => {
    if (!isDrawing || isViewOnly) return;

    const pos = getMousePos(e);

    if (tool === 'line' || tool === 'rectangle' || tool === 'circle') {
      const drawData = {
        tool,
        color,
        lineWidth,
        startX: startPos.x,
        startY: startPos.y,
        endX: pos.x,
        endY: pos.y
      };

      performDraw(drawData);

      // Emit draw event
      if (socket) {
        socket.emit('whiteboard_draw', {
          sessionId,
          drawData
        });
      }
    }

    setIsDrawing(false);
    saveToHistory();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    setHistory([]);
    setHistoryStep(-1);
  };

  const handleClear = () => {
    if (isViewOnly) return;
    
    clearCanvas();
    
    if (socket) {
      socket.emit('whiteboard_clear', { sessionId });
      socket.emit('save_whiteboard', {
        sessionId,
        data: []
      });
    }
  };

  const handleUndo = () => {
    if (isViewOnly || historyStep <= 0) return;
    
    const newStep = historyStep - 1;
    setHistoryStep(newStep);
    
    if (newStep >= 0) {
      redrawCanvas(history[newStep]);
    } else {
      clearCanvas();
    }
  };

  const handleRedo = () => {
    if (isViewOnly || historyStep >= history.length - 1) return;
    
    const newStep = historyStep + 1;
    setHistoryStep(newStep);
    redrawCanvas(history[newStep]);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `whiteboard-${sessionId}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#008000', '#FFC0CB', '#A52A2A'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[95vw] h-[90vh] bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-white/20 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              <Pencil className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Collaborative Whiteboard
              </h2>
              {isViewOnly && (
                <p className="text-xs text-yellow-400">View Only - Session Ended</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        {!isViewOnly && (
          <div className="flex items-center justify-between p-3 border-b border-white/10 bg-white/5">
            <div className="flex items-center space-x-2">
              {/* Drawing Tools */}
              <button
                onClick={() => setTool('pen')}
                className={`p-2 rounded-lg transition-all ${
                  tool === 'pen'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
                title="Pen"
              >
                <Pencil className="w-4 h-4" />
              </button>

              <button
                onClick={() => setTool('line')}
                className={`p-2 rounded-lg transition-all ${
                  tool === 'line'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
                title="Line"
              >
                <Minus className="w-4 h-4" />
              </button>

              <button
                onClick={() => setTool('rectangle')}
                className={`p-2 rounded-lg transition-all ${
                  tool === 'rectangle'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
                title="Rectangle"
              >
                <Square className="w-4 h-4" />
              </button>

              <button
                onClick={() => setTool('circle')}
                className={`p-2 rounded-lg transition-all ${
                  tool === 'circle'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
                title="Circle"
              >
                <Circle className="w-4 h-4" />
              </button>

              <button
                onClick={() => setTool('eraser')}
                className={`p-2 rounded-lg transition-all ${
                  tool === 'eraser'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
                title="Eraser"
              >
                <Eraser className="w-4 h-4" />
              </button>

              <div className="w-px h-6 bg-white/20 mx-2" />

              {/* Line Width */}
              <div className="flex items-center space-x-2">
                <span className="text-white/60 text-sm">Width:</span>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={lineWidth}
                  onChange={(e) => setLineWidth(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-white text-sm w-8">{lineWidth}px</span>
              </div>

              <div className="w-px h-6 bg-white/20 mx-2" />

              {/* Colors */}
              <div className="flex items-center space-x-1">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      color === c ? 'border-white scale-110' : 'border-white/30'
                    }`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleUndo}
                disabled={historyStep <= 0}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Undo"
              >
                <Undo className="w-4 h-4" />
              </button>

              <button
                onClick={handleRedo}
                disabled={historyStep >= history.length - 1}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Redo"
              >
                <Redo className="w-4 h-4" />
              </button>

              <button
                onClick={handleDownload}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={handleClear}
                className="p-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition-all"
                title="Clear All"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="w-full h-full bg-white rounded-lg shadow-inner">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="w-full h-full cursor-crosshair"
              style={{ cursor: isViewOnly ? 'default' : 'crosshair' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
