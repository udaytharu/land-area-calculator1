import React, { useState, useRef, useEffect } from 'react';
import './LandAreaCalculator.css';

const LandAreaCalculator = () => {
  // State variables
  const [numSides, setNumSides] = useState(4);
  const [unitType, setUnitType] = useState('mm');
  const [baseMeasurement, setBaseMeasurement] = useState(500);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isTriangulated, setIsTriangulated] = useState(false);
  const [vertices, setVertices] = useState([]);
  const [triangles, setTriangles] = useState([]);
  const [selectedVertex, setSelectedVertex] = useState(-1);
  const [sideInputs, setSideInputs] = useState([]);
  const [calculatedArea, setCalculatedArea] = useState(null);
  const [converterInput, setConverterInput] = useState('0');
  const [converterFromUnit, setConverterFromUnit] = useState('square_meters');
  const [teraiInput, setTeraiInput] = useState({ bigha: '', katha: '', dhur: '' });
  const [hillInput, setHillInput] = useState({ ropani: '', anna: '', paisa: '', daam: '' });
  const [converterResults, setConverterResults] = useState({
    square_meters: 0,
    square_feet: 0,
    terai: { bigha: 0, katha: 0, dhur: 0 },
    hill: { ropani: 0, anna: 0, paisa: 0, daam: 0 }
  });

  // Refs
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    drawPolygon(ctx);
  }, [vertices, isTriangulated, triangles, isEditMode, selectedVertex]);

  // Draw polygon
  const drawPolygon = (ctx) => {
    if (!ctx || vertices.length === 0) return;

    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw compass
    drawCompass(ctx);

    if (isTriangulated && vertices.length > 3 && triangles.length > 0) {
      // Draw triangulated polygons
      drawTriangulatedPolygon(ctx);
    } else {
      // Draw regular polygon
      drawRegularPolygon(ctx);
    }

    // Draw vertices if in edit mode
    if (isEditMode) {
      drawVertices(ctx);
    }
  };

  const drawCompass = (ctx) => {
    const compassX = 40;
    const compassY = 40;
    const compassSize = 30;

    ctx.save();
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(compassX, compassY, compassSize / 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = '14px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#4a5568';
    ctx.fillText('N', compassX, compassY - compassSize / 2 - 5);
    ctx.fillText('S', compassX, compassY + compassSize / 2 + 15);
    ctx.fillText('E', compassX + compassSize / 2 + 5, compassY);
    ctx.fillText('W', compassX - compassSize / 2 - 5, compassY);

    ctx.beginPath();
    ctx.moveTo(compassX, compassY - compassSize / 2);
    ctx.lineTo(compassX, compassY + compassSize / 2);
    ctx.moveTo(compassX - compassSize / 2, compassY);
    ctx.lineTo(compassX + compassSize / 2, compassY);
    ctx.stroke();

    // Draw north arrow
    const arrowLength = compassSize / 3;
    const arrowY = compassY - arrowLength;
    ctx.beginPath();
    ctx.moveTo(compassX, arrowY - 5);
    ctx.lineTo(compassX - 3, arrowY);
    ctx.lineTo(compassX + 3, arrowY);
    ctx.closePath();
    ctx.fillStyle = '#e53e3e';
    ctx.fill();
    ctx.restore();
  };

  const drawRegularPolygon = (ctx) => {
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.save();
    ctx.fillStyle = 'rgba(66, 153, 225, 0.1)';
    ctx.strokeStyle = '#4299e1';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    vertices.forEach((v, i) => {
      if (i === 0) ctx.moveTo(v.x, v.y);
      else ctx.lineTo(v.x, v.y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw side labels
    ctx.font = '16px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#2d3748';

    vertices.forEach((v, i) => {
      const nextV = vertices[(i + 1) % vertices.length];
      const midX = (v.x + nextV.x) / 2;
      const midY = (v.y + nextV.y) / 2;
      
      // Calculate vector from midpoint to center
      const dx = centerX - midX;
      const dy = centerY - midY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        const scale = 12 / distance;
        const labelX = midX + dx * scale;
        const labelY = midY + dy * scale;
        const label = String.fromCharCode(65 + i);
        
        // Draw label background
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(labelX, labelY, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        ctx.fillStyle = '#2b6cb0';
        ctx.fillText(label, labelX, labelY);
      }
    });

    ctx.restore();
  };

  const drawTriangulatedPolygon = (ctx) => {
    ctx.save();

    // Draw all triangles with light fill
    triangles.forEach((triangle, index) => {
      const colors = [
        'rgba(102, 126, 234, 0.15)',
        'rgba(237, 100, 166, 0.15)',
        'rgba(56, 178, 172, 0.15)',
        'rgba(245, 158, 11, 0.15)'
      ];
      ctx.fillStyle = colors[index % colors.length];
      ctx.strokeStyle = 'rgba(74, 85, 104, 0.4)';
      ctx.lineWidth = 1;

      ctx.beginPath();
      triangle.forEach((v, i) => {
        if (i === 0) ctx.moveTo(v.x, v.y);
        else ctx.lineTo(v.x, v.y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    // Draw original polygon outline on top
    ctx.strokeStyle = '#4299e1';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    vertices.forEach((v, i) => {
      if (i === 0) ctx.moveTo(v.x, v.y);
      else ctx.lineTo(v.x, v.y);
    });
    ctx.closePath();
    ctx.stroke();

    // Draw ALL side labels (outer + inner diagonals)
    ctx.font = '14px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const centerX = canvasRef.current.width / 2;
    const centerY = canvasRef.current.height / 2;

    // First, draw labels for Sides (BLUE)
    ctx.fillStyle = '#2b6cb0';
    vertices.forEach((v, i) => {
      const nextV = vertices[(i + 1) % vertices.length];
      const midX = (v.x + nextV.x) / 2;
      const midY = (v.y + nextV.y) / 2;
      
      const dx = centerX - midX;
      const dy = centerY - midY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        const scale = 15 / distance;
        const labelX = midX + dx * scale;
        const labelY = midY + dy * scale;
        const label = String.fromCharCode(65 + i);
        
        // Draw label background
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(labelX, labelY, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        ctx.fillText(label, labelX, labelY);
      }
    });

    // Now draw labels for inner diagonals (RED)
    ctx.fillStyle = '#c53030';
    let diagonalIndex = 0;
    const drawnDiagonals = new Set();
    
    triangles.forEach((triangle) => {
      for (let i = 0; i < 3; i++) {
        const v1 = triangle[i];
        const v2 = triangle[(i + 1) % 3];
        
        // Check if this edge is NOT an Side (not consecutive vertices)
        const isSide = vertices.some((v, idx) => {
          const nextIdx = (idx + 1) % vertices.length;
          const nextV = vertices[nextIdx];
          
          // Check if v1-v2 matches v-nextV or nextV-v
          const match1 = Math.abs(v.x - v1.x) < 0.1 && Math.abs(v.y - v1.y) < 0.1 &&
                        Math.abs(nextV.x - v2.x) < 0.1 && Math.abs(nextV.y - v2.y) < 0.1;
          const match2 = Math.abs(v.x - v2.x) < 0.1 && Math.abs(v.y - v2.y) < 0.1 &&
                        Math.abs(nextV.x - v1.x) < 0.1 && Math.abs(nextV.y - v1.y) < 0.1;
          
          return match1 || match2;
        });
        
        if (!isSide) {
          // This is an inner diagonal
          // Create a unique key for this diagonal
          const points = [v1, v2];
          points.sort((a, b) => {
            if (a.x === b.x) return a.y - b.y;
            return a.x - b.x;
          });
          
          const diagonalKey = `${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}-${points[1].x.toFixed(2)},${points[1].y.toFixed(2)}`;
          
          if (!drawnDiagonals.has(diagonalKey)) {
            drawnDiagonals.add(diagonalKey);
            
            const midX = (v1.x + v2.x) / 2;
            const midY = (v1.y + v2.y) / 2;
            
            // Draw the diagonal
            ctx.strokeStyle = '#c53030';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([5, 3]);
            ctx.beginPath();
            ctx.moveTo(v1.x, v1.y);
            ctx.lineTo(v2.x, v2.y);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Label the diagonal
            const dx = centerX - midX;
            const dy = centerY - midY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
              const scale = 15 / distance;
              const labelX = midX + dx * scale;
              const labelY = midY + dy * scale;
              const label = String.fromCharCode(65 + vertices.length + diagonalIndex);
              
              // Draw label background
              ctx.save();
              ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
              ctx.beginPath();
              ctx.arc(labelX, labelY, 12, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
              
              ctx.fillText(label, labelX, labelY);
              diagonalIndex++;
            }
          }
        }
      }
    });

    ctx.restore();
  };

  const drawVertices = (ctx) => {
    ctx.save();
    
    vertices.forEach((v, i) => {
      ctx.beginPath();
      ctx.arc(v.x, v.y, i === selectedVertex ? 9 : 7, 0, Math.PI * 2);
      ctx.fillStyle = i === selectedVertex ? '#38a169' : '#e53e3e';
      ctx.fill();
      ctx.strokeStyle = i === selectedVertex ? '#2f855a' : '#c53030';
      ctx.lineWidth = i === selectedVertex ? 2 : 1.5;
      ctx.stroke();
    });
    
    ctx.restore();
  };

  // Initialize polygon
  const initializePolygon = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    const newVertices = [];
    for (let i = 0; i < numSides; i++) {
      const angle = (2 * Math.PI * i) / numSides;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      newVertices.push({ x, y });
    }

    setVertices(newVertices);
    setIsTriangulated(false);
    setTriangles([]);
    setSelectedVertex(-1);
    setCalculatedArea(null);
    updateSideTable(newVertices, []);
  };

  // Update side table - SHOW ALL SIDES (outer + inner diagonals)
  const updateSideTable = (verts, triList = triangles) => {
    // If we're triangulated and have triangles, use the updated logic
    if (isTriangulated && triList.length > 0) {
      const baseScaleValue = calculateBaseScaleValue();
      const newSideInputs = [];

      // Add all Sides
      for (let i = 0; i < verts.length; i++) {
        const v1 = verts[i];
        const v2 = verts[(i + 1) % verts.length];
        const length = Math.sqrt(
          Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2)
        );
        
        newSideInputs.push({
          id: i,
          label: String.fromCharCode(65 + i),
          scaleValue: baseScaleValue,
          unitType,
          inputValue: '',
          finalLength: null,
          pixelLength: length,
          isSide: true,
          vertex1: i,
          vertex2: (i + 1) % verts.length
        });
      }

      // Add inner diagonals
      const addedDiagonals = new Set();
      let diagonalIndex = 0;
      
      triList.forEach((triangle) => {
        for (let i = 0; i < 3; i++) {
          const v1 = triangle[i];
          const v2 = triangle[(i + 1) % 3];
          
          // Check if this edge is NOT an Side (not consecutive vertices)
          const isSide = verts.some((v, idx) => {
            const nextIdx = (idx + 1) % verts.length;
            const nextV = verts[nextIdx];
            
            // Check if v1-v2 matches v-nextV or nextV-v
            const match1 = Math.abs(v.x - v1.x) < 0.1 && Math.abs(v.y - v1.y) < 0.1 &&
                          Math.abs(nextV.x - v2.x) < 0.1 && Math.abs(nextV.y - v2.y) < 0.1;
            const match2 = Math.abs(v.x - v2.x) < 0.1 && Math.abs(v.y - v2.y) < 0.1 &&
                          Math.abs(nextV.x - v1.x) < 0.1 && Math.abs(nextV.y - v1.y) < 0.1;
            
            return match1 || match2;
          });
          
          if (!isSide) {
            // This is an inner diagonal
            // Create a unique key for this diagonal
            const points = [v1, v2];
            points.sort((a, b) => {
              if (a.x === b.x) return a.y - b.y;
              return a.x - b.x;
            });
            
            const diagonalKey = `${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}-${points[1].x.toFixed(2)},${points[1].y.toFixed(2)}`;
            
            if (!addedDiagonals.has(diagonalKey)) {
              addedDiagonals.add(diagonalKey);
              
              const v1Index = verts.findIndex(v => 
                Math.abs(v.x - v1.x) < 0.1 && Math.abs(v.y - v1.y) < 0.1
              );
              const v2Index = verts.findIndex(v => 
                Math.abs(v.x - v2.x) < 0.1 && Math.abs(v.y - v2.y) < 0.1
              );
              
              if (v1Index !== -1 && v2Index !== -1) {
                const length = Math.sqrt(
                  Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2)
                );
                
                newSideInputs.push({
                  id: verts.length + diagonalIndex,
                  label: String.fromCharCode(65 + verts.length + diagonalIndex),
                  scaleValue: baseScaleValue,
                  unitType,
                  inputValue: '',
                  finalLength: null,
                  pixelLength: length,
                  isSide: false,
                  vertex1: v1Index,
                  vertex2: v2Index,
                  isDiagonal: true
                });
                
                diagonalIndex++;
              }
            }
          }
        }
      });

      setSideInputs(newSideInputs);
    } else {
      // Regular polygon (not triangulated)
      const baseScaleValue = calculateBaseScaleValue(verts);
      const newSideInputs = [];

      for (let i = 0; i < verts.length; i++) {
        const v1 = verts[i];
        const v2 = verts[(i + 1) % verts.length];
        const length = Math.sqrt(
          Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2)
        );
        
        newSideInputs.push({
          id: i,
          label: String.fromCharCode(65 + i),
          scaleValue: baseScaleValue,
          unitType,
          inputValue: '',
          finalLength: null,
          pixelLength: length,
          isSide: true,
          vertex1: i,
          vertex2: (i + 1) % verts.length
        });
      }

      setSideInputs(newSideInputs);
    }
  };

  // Calculate base scale value - uses baseMeasurement from polygon settings
  const calculateBaseScaleValue = () => {
    return baseMeasurement.toString();
  };

  // Handle side input change with validation
  const handleSideInputChange = (id, value) => {
    const newSideInputs = [...sideInputs];
    const sideIndex = newSideInputs.findIndex(side => side.id === id);
    
    if (sideIndex !== -1) {
      const side = newSideInputs[sideIndex];
      const numValue = parseFloat(value);
      
      // Validate input - prevent negative values
      if (value === '') {
        side.inputValue = '';
        side.finalLength = null;
      } else if (!isNaN(numValue) && numValue >= 0) {
        side.inputValue = value;
        side.finalLength = (numValue * parseFloat(side.scaleValue)).toFixed(2);
      } else if (numValue < 0) {
        // If negative value entered, set to 0
        side.inputValue = '0';
        side.finalLength = '0.00';
      }
      
      setSideInputs(newSideInputs);
    }
  };

  // Check if all inputs are valid
  const allInputsValid = () => {
    return sideInputs.length > 0 && sideInputs.every(side => 
      side.finalLength !== null && parseFloat(side.finalLength) >= 0
    );
  };

  // Reset side lengths
  const handleResetSideLengths = () => {
    const resetInputs = sideInputs.map(side => ({
      ...side,
      inputValue: '',
      finalLength: null
    }));
    setSideInputs(resetInputs);
    setCalculatedArea(null);
  };

  // Download combined image of table + results
  const handleDownloadCombinedImage = async () => {
    try {
      const tableEl = document.querySelector('.results-panel');
      const converterEl = document.querySelector('.converter-results');
      if (!tableEl && !converterEl) {
        alert('Nothing to capture');
        return;
      }

      // Create export container and clone nodes
      const exportContainer = document.createElement('div');
      exportContainer.style.background = '#ffffff';
      exportContainer.style.padding = '20px';
      exportContainer.style.boxSizing = 'border-box';
      exportContainer.style.width = '1200px';
      exportContainer.style.position = 'fixed';
      exportContainer.style.left = '-9999px';

      if (tableEl) {
        const clonedTable = tableEl.cloneNode(true);
        exportContainer.appendChild(clonedTable);
      }

      if (converterEl) {
        const hr = document.createElement('hr');
        hr.style.margin = '20px 0';
        exportContainer.appendChild(hr);
        const clonedConv = converterEl.cloneNode(true);
        exportContainer.appendChild(clonedConv);
      }

      document.body.appendChild(exportContainer);

      // Inject temporary CSS to force solid colors, remove shadows and gradients
      const tempStyle = document.createElement('style');
      tempStyle.id = 'export-temp-style';
      tempStyle.innerHTML = `
        .result-box { background: #ffffff !important; box-shadow: none !important; border-color: #e5e7eb !important; }
        .result-box .text-2xl { background: none !important; -webkit-background-clip: unset !important; background-clip: unset !important; -webkit-text-fill-color: unset !important; color: #0f172a !important; font-size: 28px !important; }
        .result-box *, .results-panel * , .converter-results * { opacity: 1 !important; filter: none !important; backdrop-filter: none !important; background: none !important; }
        .results-panel { background: #ffffff !important; }
      `;
      document.head.appendChild(tempStyle);

      // Improve clarity: remove interactive elements and force full opacity/backgrounds in the cloned content
      try {
        // Replace inputs/selects/textarea with plain text nodes so their values are visible in the snapshot
        const inputs = exportContainer.querySelectorAll('input, textarea');
        inputs.forEach((el) => {
          const span = document.createElement('span');
          span.textContent = el.value || el.placeholder || '';
          span.style.display = 'inline-block';
          span.style.padding = '8px 12px';
          span.style.background = '#ffffff';
          span.style.borderRadius = '6px';
          span.style.color = '#0f172a';
          span.style.fontSize = window.getComputedStyle(el).fontSize || '14px';
          span.style.width = el.offsetWidth ? el.offsetWidth + 'px' : 'auto';
          try { el.parentNode.replaceChild(span, el); } catch (e) { el.style.display = 'none'; }
        });

        const selects = exportContainer.querySelectorAll('select');
        selects.forEach((el) => {
          const span = document.createElement('span');
          span.textContent = el.options[el.selectedIndex]?.text || '';
          span.style.color = '#0f172a';
          span.style.fontSize = window.getComputedStyle(el).fontSize || '14px';
          try { el.parentNode.replaceChild(span, el); } catch (e) { el.style.display = 'none'; }
        });

        // Hide buttons and other interactive controls
        const buttons = exportContainer.querySelectorAll('button');
        buttons.forEach(el => { el.style.display = 'none'; });

        // Force full opacity, remove filters and ensure white backgrounds for readability
        const allEls = exportContainer.querySelectorAll('*');
        allEls.forEach(el => {
          el.style.opacity = '1';
          el.style.filter = 'none';
          el.style.backdropFilter = 'none';
          el.style.boxShadow = 'none';
          const bg = window.getComputedStyle(el).backgroundColor;
          if (!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') {
            el.style.backgroundColor = '#ffffff';
          }
        });

        // Remove gradient text backgrounds (these appear as bars in canvas capture)
        const gradientEls = exportContainer.querySelectorAll('.result-box .text-2xl');
        gradientEls.forEach(el => {
          el.style.background = 'none';
          el.style.webkitBackgroundClip = 'unset';
          el.style.backgroundClip = 'unset';
          el.style.webkitTextFillColor = 'initial';
          el.style.color = '#0f172a';
          el.style.fontWeight = '700';
        });
      } catch (e) {
        // ignore errors during DOM tweaks
      }

      // Load html2canvas if not present
      if (!window.html2canvas) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }
      // Increase width and capture scale for better resolution
      exportContainer.style.width = '1600px';
      exportContainer.style.padding = '40px';
      exportContainer.style.maxHeight = 'none';
      const canvas = await window.html2canvas(exportContainer, { scale: 3, useCORS: true, scrollY: -window.scrollY });
      canvas.toBlob((blob) => {
        if (!blob) {
          alert('Failed to create image');
          document.body.removeChild(exportContainer);
          const existing = document.getElementById('export-temp-style');
          if (existing) existing.remove();
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'table_results.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        document.body.removeChild(exportContainer);
        const existing = document.getElementById('export-temp-style');
        if (existing) existing.remove();
      }, 'image/png');
    } catch (err) {
      console.error(err);
      alert('Unable to create image. Make sure you are online to load required library.');
    }
  };

  // Calculate area - using triangle areas
  const handleCalculateArea = () => {
    if (!allInputsValid()) {
      alert('Please enter valid lengths for all sides (non-negative values)');
      return;
    }

    let totalArea = 0;

    if (isTriangulated && vertices.length > 3 && triangles.length > 0) {
      // Create map from side label to length
      const sideLengthMap = {};
      sideInputs.forEach(side => {
        sideLengthMap[side.label] = parseFloat(side.finalLength);
      });

      // Calculate area for each triangle using Heron's formula
      triangles.forEach((triangle) => {
        // Find the 3 sides of this triangle
        const triangleSides = [];
        
        for (let i = 0; i < 3; i++) {
          const v1 = triangle[i];
          const v2 = triangle[(i + 1) % 3];
          
          // Find which side in sideInputs matches this edge
          const matchingSide = sideInputs.find(side => {
            const sideV1 = vertices[side.vertex1];
            const sideV2 = vertices[side.vertex2];
            
            // Check if vertices match (within tolerance)
            const match1 = Math.abs(sideV1.x - v1.x) < 0.1 && Math.abs(sideV1.y - v1.y) < 0.1 &&
                          Math.abs(sideV2.x - v2.x) < 0.1 && Math.abs(sideV2.y - v2.y) < 0.1;
            const match2 = Math.abs(sideV1.x - v2.x) < 0.1 && Math.abs(sideV1.y - v2.y) < 0.1 &&
                          Math.abs(sideV2.x - v1.x) < 0.1 && Math.abs(sideV2.y - v1.y) < 0.1;
            
            return match1 || match2;
          });
          
          if (matchingSide && sideLengthMap[matchingSide.label] !== undefined) {
            triangleSides.push(sideLengthMap[matchingSide.label]);
          }
        }
        
        // If we have all 3 sides, calculate triangle area
        if (triangleSides.length === 3) {
          const [a, b, c] = triangleSides;
          if (a + b > c && b + c > a && a + c > b) {
            const s = (a + b + c) / 2;
            const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
            if (!isNaN(area)) {
              totalArea += area;
            }
          }
        }
      });
    } else if (sideInputs.length === 3) {
      // Single triangle
      const [a, b, c] = sideInputs.map(side => parseFloat(side.finalLength));
      if (a >= 0 && b >= 0 && c >= 0 && a + b > c && b + c > a && a + c > b) {
        const s = (a + b + c) / 2;
        totalArea = Math.sqrt(s * (s - a) * (s - b) * (s - c));
      }
    }

    if (totalArea > 0 && !isNaN(totalArea)) {
      // Convert area based on unit type
      let areaInOriginalUnit, unitValue;
      switch(unitType) {
        case 'mm':
          areaInOriginalUnit = totalArea; // mm²
          unitValue = 'square_millimeters';
          break;
        case 'cm':
        default:
          areaInOriginalUnit = totalArea; // cm²
          unitValue = 'square_centimeters';
      }

      setCalculatedArea({
        value: totalArea,
        originalValue: areaInOriginalUnit,
        unit: unitType,
        unitValue
      });

      // Update converter input
      const areaInMeters = unitType === 'mm' ? areaInOriginalUnit / 1000000 : areaInOriginalUnit / 10000;
      setConverterInput(areaInMeters.toFixed(4));
      setConverterFromUnit('square_meters');
      
      // Clear Terai and Hill inputs
      setTeraiInput({ bigha: '', katha: '', dhur: '' });
      setHillInput({ ropani: '', anna: '', paisa: '', daam: '' });
      
      convertArea(areaInMeters, 'square_meters');

      // Scroll to converter
      setTimeout(() => {
        const converterSection = document.querySelector('.unit-converter-section');
        if (converterSection) {
          converterSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    } else {
      alert('Unable to calculate area. Please check your side length inputs (must form a valid polygon).');
    }
  };

  // Triangulation algorithm
  const triangulatePolygon = () => {
    if (vertices.length <= 3) {
      alert('Polygon must have at least 4 sides to triangulate');
      return;
    }

    const earClipping = (verts) => {
      const tempVerts = verts.map((v, i) => ({ ...v, index: i }));
      const newTriangles = [];

      // Helper function to calculate cross product
      const cross = (a, b, c) => {
        return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
      };

      // Check if point is inside triangle
      const pointInTriangle = (p, a, b, c) => {
        const area = Math.abs(cross(a, b, c));
        const area1 = Math.abs(cross(p, a, b));
        const area2 = Math.abs(cross(p, b, c));
        const area3 = Math.abs(cross(p, c, a));
        return Math.abs(area1 + area2 + area3 - area) < 0.01;
      };

      // Check if vertex is an ear
      const isEar = (i) => {
        const n = tempVerts.length;
        const a = tempVerts[(i - 1 + n) % n];
        const b = tempVerts[i];
        const c = tempVerts[(i + 1) % n];

        // Check if vertex is convex (interior angle < 180)
        if (cross(a, b, c) <= 0) return false;

        // Check if any other vertex is inside triangle abc
        for (let j = 0; j < n; j++) {
          if (j === (i - 1 + n) % n || j === i || j === (i + 1) % n) continue;
          const p = tempVerts[j];
          if (pointInTriangle(p, a, b, c)) {
            return false;
          }
        }

        return true;
      };

      while (tempVerts.length > 3) {
        let earFound = false;
        
        for (let i = 0; i < tempVerts.length; i++) {
          if (isEar(i)) {
            const a = tempVerts[(i - 1 + tempVerts.length) % tempVerts.length];
            const b = tempVerts[i];
            const c = tempVerts[(i + 1) % tempVerts.length];
            
            newTriangles.push([a, b, c]);
            tempVerts.splice(i, 1);
            earFound = true;
            break;
          }
        }
        
        if (!earFound) {
          // Fallback: use simple triangle fan from first vertex
          newTriangles.length = 0;
          for (let i = 1; i < tempVerts.length - 1; i++) {
            newTriangles.push([tempVerts[0], tempVerts[i], tempVerts[i + 1]]);
          }
          break;
        }
      }

      if (tempVerts.length === 3) {
        newTriangles.push([...tempVerts]);
      }

      return newTriangles;
    };

    const newTriangles = earClipping(vertices);
    
    setIsTriangulated(true);
    setTriangles(newTriangles);
    
    // Calculate and update side inputs immediately
    const baseScaleValue = calculateBaseScaleValue();
    const newSideInputs = [];

    // Add all Sides
    for (let i = 0; i < vertices.length; i++) {
      const v1 = vertices[i];
      const v2 = vertices[(i + 1) % vertices.length];
      const length = Math.sqrt(
        Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2)
      );
      
      newSideInputs.push({
        id: i,
        label: String.fromCharCode(65 + i),
        scaleValue: baseScaleValue,
        unitType,
        inputValue: '',
        finalLength: null,
        pixelLength: length,
        isSide: true,
        vertex1: i,
        vertex2: (i + 1) % vertices.length
      });
    }

    // Add inner diagonals
    const addedDiagonals = new Set();
    let diagonalIndex = 0;
    
    newTriangles.forEach((triangle) => {
      for (let i = 0; i < 3; i++) {
        const v1 = triangle[i];
        const v2 = triangle[(i + 1) % 3];
        
        // Check if this edge is NOT an Side
        const isSide = vertices.some((v, idx) => {
          const nextIdx = (idx + 1) % vertices.length;
          const nextV = vertices[nextIdx];
          
          const match1 = Math.abs(v.x - v1.x) < 0.1 && Math.abs(v.y - v1.y) < 0.1 &&
                        Math.abs(nextV.x - v2.x) < 0.1 && Math.abs(nextV.y - v2.y) < 0.1;
          const match2 = Math.abs(v.x - v2.x) < 0.1 && Math.abs(v.y - v2.y) < 0.1 &&
                        Math.abs(nextV.x - v1.x) < 0.1 && Math.abs(nextV.y - v1.y) < 0.1;
          
          return match1 || match2;
        });
        
        if (!isSide) {
          // This is an inner diagonal
          const points = [v1, v2];
          points.sort((a, b) => {
            if (a.x === b.x) return a.y - b.y;
            return a.x - b.x;
          });
          
          const diagonalKey = `${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}-${points[1].x.toFixed(2)},${points[1].y.toFixed(2)}`;
          
          if (!addedDiagonals.has(diagonalKey)) {
            addedDiagonals.add(diagonalKey);
            
            // Find which vertices these are
            const v1Index = vertices.findIndex(v => 
              Math.abs(v.x - v1.x) < 0.1 && Math.abs(v.y - v1.y) < 0.1
            );
            const v2Index = vertices.findIndex(v => 
              Math.abs(v.x - v2.x) < 0.1 && Math.abs(v.y - v2.y) < 0.1
            );
            
            if (v1Index !== -1 && v2Index !== -1) {
              const length = Math.sqrt(
                Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2)
              );
              
              newSideInputs.push({
                id: vertices.length + diagonalIndex,
                label: String.fromCharCode(65 + vertices.length + diagonalIndex),
                scaleValue: baseScaleValue,
                unitType,
                inputValue: '',
                finalLength: null,
                pixelLength: length,
                isSide: false,
                vertex1: v1Index,
                vertex2: v2Index,
                isDiagonal: true
              });
              
              diagonalIndex++;
            }
          }
        }
      }
    });

    // Set the side inputs directly - this ensures immediate update
    setSideInputs(newSideInputs);
  };

  // Canvas mouse event handlers
  const getCanvasCoordinates = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Scale coordinates to match canvas size
    const scaledX = (x / rect.width) * canvas.width;
    const scaledY = (y / rect.height) * canvas.height;

    return { x: scaledX, y: scaledY };
  };

  const findNearestVertex = (x, y) => {
    let nearestIndex = -1;
    let minDistance = 20; // Click radius

    vertices.forEach((v, i) => {
      const distance = Math.sqrt(
        Math.pow(x - v.x, 2) + Math.pow(y - v.y, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    });

    return nearestIndex;
  };

  const handleCanvasMouseDown = (e) => {
    if (!isEditMode) return;

    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY);
    const vertexIndex = findNearestVertex(x, y);
    
    if (vertexIndex !== -1) {
      setSelectedVertex(vertexIndex);
      isDraggingRef.current = true;
      lastMousePosRef.current = { x, y };
      e.preventDefault();
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!isEditMode || !isDraggingRef.current || selectedVertex === -1) return;

    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY);
    
    const deltaX = x - lastMousePosRef.current.x;
    const deltaY = y - lastMousePosRef.current.y;

    const newVertices = [...vertices];
    newVertices[selectedVertex] = { 
      x: newVertices[selectedVertex].x + deltaX, 
      y: newVertices[selectedVertex].y + deltaY 
    };
    
    setVertices(newVertices);
    lastMousePosRef.current = { x, y };

    // If triangulated, update triangles too
    if (isTriangulated && triangles.length > 0) {
      const newTriangles = triangles.map(triangle => 
        triangle.map(v => {
          if (Math.abs(v.x - vertices[selectedVertex].x) < 0.1 && 
              Math.abs(v.y - vertices[selectedVertex].y) < 0.1) {
            return { ...v, x: v.x + deltaX, y: v.y + deltaY };
          }
          return v;
        })
      );
      setTriangles(newTriangles);
      updateSideTable(newVertices, newTriangles);
    } else {
      updateSideTable(newVertices, triangles);
    }
  };

  const handleCanvasMouseUp = () => {
    isDraggingRef.current = false;
    setSelectedVertex(-1);
  };

  // Touch events for mobile
  const handleCanvasTouchStart = (e) => {
    if (!isEditMode) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const { x, y } = getCanvasCoordinates(touch.clientX, touch.clientY);
    const vertexIndex = findNearestVertex(x, y);
    
    if (vertexIndex !== -1) {
      setSelectedVertex(vertexIndex);
      isDraggingRef.current = true;
      lastMousePosRef.current = { x, y };
    }
  };

  const handleCanvasTouchMove = (e) => {
    if (!isEditMode || !isDraggingRef.current || selectedVertex === -1) return;
    e.preventDefault();

    const touch = e.touches[0];
    const { x, y } = getCanvasCoordinates(touch.clientX, touch.clientY);
    
    const deltaX = x - lastMousePosRef.current.x;
    const deltaY = y - lastMousePosRef.current.y;

    const newVertices = [...vertices];
    newVertices[selectedVertex] = { 
      x: newVertices[selectedVertex].x + deltaX, 
      y: newVertices[selectedVertex].y + deltaY 
    };
    
    setVertices(newVertices);
    lastMousePosRef.current = { x, y };

    // If triangulated, update triangles too
    if (isTriangulated && triangles.length > 0) {
      const newTriangles = triangles.map(triangle => 
        triangle.map(v => {
          if (Math.abs(v.x - vertices[selectedVertex].x) < 0.1 && 
              Math.abs(v.y - vertices[selectedVertex].y) < 0.1) {
            return { ...v, x: v.x + deltaX, y: v.y + deltaY };
          }
          return v;
        })
      );
      setTriangles(newTriangles);
      updateSideTable(newVertices, newTriangles);
    } else {
      updateSideTable(newVertices, triangles);
    }
  };

  // Unit converter functions
  const convertFromTerai = (bigha, katha, dhur) => {
    const bighaValue = parseFloat(bigha) || 0;
    const kathaValue = parseFloat(katha) || 0;
    const dhurValue = parseFloat(dhur) || 0;
    
    // Ensure non-negative values
    const safeBigha = Math.max(0, bighaValue);
    const safeKatha = Math.max(0, kathaValue);
    const safeDhur = Math.max(0, dhurValue);
    
    // 1 Bigha = 20 Katha, 1 Katha = 20 Dhur
    const totalBigha = safeBigha + (safeKatha / 20) + (safeDhur / 400);
    
    // Convert to square meters
    const squareMeters = totalBigha * 6772.63;
    
    setConverterInput(squareMeters.toFixed(4));
    setConverterFromUnit('terai');
    convertArea(squareMeters, 'terai');
  };

  const convertFromHill = (ropani, anna, paisa, daam) => {
    const ropaniValue = parseFloat(ropani) || 0;
    const annaValue = parseFloat(anna) || 0;
    const paisaValue = parseFloat(paisa) || 0;
    const daamValue = parseFloat(daam) || 0;
    
    // Ensure non-negative values
    const safeRopani = Math.max(0, ropaniValue);
    const safeAnna = Math.max(0, annaValue);
    const safePaisa = Math.max(0, paisaValue);
    const safeDaam = Math.max(0, daamValue);
    
    // 1 Ropani = 16 Aana, 1 Aana = 4 Paisa, 1 Paisa = 4 Daam
    const totalRopani = safeRopani + (safeAnna / 16) + (safePaisa / 64) + (safeDaam / 256);
    
    // Convert to square meters
    const squareMeters = totalRopani * 508.74;
    
    setConverterInput(squareMeters.toFixed(4));
    setConverterFromUnit('hill');
    convertArea(squareMeters, 'hill');
  };

  const convertArea = (value = converterInput, fromUnit = converterFromUnit) => {
    const inputValue = parseFloat(value);
    if (isNaN(inputValue) || inputValue < 0) {
      // If negative, set to 0
      const safeValue = Math.max(0, inputValue);
      setConverterInput(safeValue.toString());
      return;
    }

    let areaInMeters = 0;

    // Convert to square meters first
    switch(fromUnit) {
      case 'square_millimeters':
        areaInMeters = inputValue / 1000000;
        break;
      case 'square_centimeters':
        areaInMeters = inputValue / 10000;
        break;
      case 'square_feet':
        areaInMeters = inputValue / 10.7639;
        break;
      case 'square_meters':
      default:
        areaInMeters = inputValue;
    }

    // Clear Terai and Hill inputs when converting from other units
    if (fromUnit !== 'terai') {
      setTeraiInput({ bigha: '', katha: '', dhur: '' });
    }
    if (fromUnit !== 'hill') {
      setHillInput({ ropani: '', anna: '', paisa: '', daam: '' });
    }

    // Convert to other units
    const squareFeet = areaInMeters * 10.7639;
    
    // Terai Region Conversions
    const squareMetersPerBigha = 6772.63;
    const bigha = areaInMeters / squareMetersPerBigha;
    const katha = (bigha % 1) * 20;
    const dhur = (katha % 1) * 20;

    // Hill Region Conversions
    const squareMetersPerRopani = 508.74;
    const ropani = areaInMeters / squareMetersPerRopani;
    const anna = (ropani % 1) * 16;
    const paisa = (anna % 1) * 4;
    const daam = (paisa % 1) * 4;

    // Format with leading zeros
    const formatWithLeadingZeros = (value) => {
      const intValue = Math.floor(Math.max(0, value));
      return intValue < 10 ? `0${intValue}` : intValue.toString();
    };

    // Update results
    setConverterResults({
      square_meters: areaInMeters,
      square_feet: squareFeet,
      terai: {
        bigha: formatWithLeadingZeros(bigha),
        katha: formatWithLeadingZeros(katha),
        dhur: formatWithLeadingZeros(dhur)
      },
      hill: {
        ropani: formatWithLeadingZeros(ropani),
        anna: formatWithLeadingZeros(anna),
        paisa: formatWithLeadingZeros(paisa),
        daam: formatWithLeadingZeros(daam)
      }
    });
  };

  const handleConvert = () => {
    // Ensure converter input is non-negative
    const inputValue = parseFloat(converterInput);
    if (isNaN(inputValue) || inputValue < 0) {
      setConverterInput('0');
      convertArea(0, converterFromUnit);
    } else {
      convertArea();
    }
  };

  const handleConverterInputChange = (value) => {
    // Prevent negative values
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setConverterInput('');
    } else if (numValue < 0) {
      setConverterInput('0');
    } else {
      setConverterInput(value);
    }
  };

  const transferToConverter = () => {
    if (calculatedArea) {
      // Convert calculated area to square meters
      let areaInMeters = 0;
      if (unitType === 'mm') {
        areaInMeters = calculatedArea.originalValue / 1000000;
      } else {
        areaInMeters = calculatedArea.originalValue / 10000;
      }
      
      // Ensure non-negative
      areaInMeters = Math.max(0, areaInMeters);
      
      // Set square meters input
      setConverterInput(areaInMeters.toFixed(4));
      setConverterFromUnit('square_meters');
      
      // Clear Terai and Hill inputs
      setTeraiInput({ bigha: '', katha: '', dhur: '' });
      setHillInput({ ropani: '', anna: '', paisa: '', daam: '' });
      
      convertArea(areaInMeters, 'square_meters');
      
      // Scroll to converter
      setTimeout(() => {
        const converterSection = document.querySelector('.unit-converter-section');
        if (converterSection) {
          converterSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    }
  };

  // Get all vertex names for display
  const getAllVertexNames = () => {
    if (sideInputs.length === 0) return "";
    
    const outerNames = [];
    const diagonalNames = [];
    
    sideInputs.forEach(side => {
      if (side.isSide) {
        outerNames.push(side.label);
      } else {
        diagonalNames.push(side.label);
      }
    });
    
    let result = "";
    if (outerNames.length > 0) {
      result += `Sides: ${outerNames.join(', ')}`;
    }
    if (diagonalNames.length > 0) {
      if (result) result += " | ";
      result += `Diagonals: ${diagonalNames.join(', ')}`;
    }
    
    return result;
  };

  // Initialize on component mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = Math.min(600, window.innerWidth - 40);
    canvas.height = Math.min(800, window.innerHeight * 0.6);
    
    initializePolygon();

    // Add event listeners
    const handleMouseUp = () => handleCanvasMouseUp();
    const handleTouchEnd = () => handleCanvasMouseUp();

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Reinitialize polygon when numSides changes
  useEffect(() => {
    initializePolygon();
  }, [numSides, unitType, baseMeasurement]);

  return (
    <div className="land-area-calculator bg-gray-50 min-h-screen" ref={containerRef}>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Area of Land Calculator & Area Unit Converter</h1>
            <p className="text-gray-600">Draw, edit, triangulate polygons and calculate areas with precision</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          {/* Controls Panel */}
          <div className="controls-panel bg-white rounded-2xl shadow-lg p-6 lg:w-80 flex-shrink-0">
            <div className="control-group mb-8">
              <div className="flex items-center gap-2 mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Polygon Settings</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Sides
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="12"
                    value={numSides}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow empty value
                      if (value === '') {
                    setNumSides('');
                  } else {
                  const parsedValue = parseInt(value);
                  if (!isNaN(parsedValue)) {
                    // Constrain to valid range
                    setNumSides(Math.max(3, Math.min(12, parsedValue)));
                   }
                   }
                  }}
                  onBlur={(e) => {
                  // When input loses focus and is empty, set to default
                  if (e.target.value === '' || e.target.value === null || e.target.value === undefined) {
                  setNumSides(4);
                  }
                }}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Type (Note: for accurate measurement, measure in mm)
                  </label>
                  <div className="relative">
                    <select
                      value={unitType}
                      onChange={(e) => setUnitType(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    >
                      <option value="cm">Centimeters (cm)</option>
                      <option value="mm">Millimeters (mm)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scale Ratio 1:{baseMeasurement} [px to {unitType}]  
                  </label>
                    <input
                    type="number"
                    min="1"
                    value={baseMeasurement}
                    onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty value
                    if (value === '') {
                    setBaseMeasurement('');
                    } else {
                    const parsedValue = parseFloat(value);
                    if (!isNaN(parsedValue)) {
                    // Ensure minimum value
                    setBaseMeasurement(Math.max(1, parsedValue));
                    }
                    }
                    }}
                    onBlur={(e) => {
                    // When input loses focus and is empty, set to default
                    if (e.target.value === '' || e.target.value === null || e.target.value === undefined) {
                    setBaseMeasurement(500);
                    }
                    }}
                    step="1"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                </div>
              </div>
            </div>

            <div className="button-group space-y-4">
              <button
                onClick={initializePolygon}
                className="w-full px-4 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Draw Polygon
              </button>
              <button
                onClick={() => {
                  setIsEditMode(!isEditMode);
                  setSelectedVertex(-1);
                }}
                className={`w-full px-4 py-4 font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                  isEditMode 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                {isEditMode ? 'Exit Edit Mode' : 'Edit Mode'}
              </button>
              <button
  onClick={triangulatePolygon}
  className="w-full px-4 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
>
  {/* Replace with triangle SVG */}
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19L12 5l7 14M5 19h14" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14" />
  </svg>
  Triangulate ({isTriangulated ? 'On' : 'Off'})
</button>
            </div>
            
            <div className="mt-8 space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-sm font-medium text-blue-800 mb-1">All Vertex Names</p>
                <p className="text-sm text-blue-700">
                  {getAllVertexNames() || "Draw a polygon to see vertex names"}
                </p>
              </div>
              {isTriangulated && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <p className="text-sm font-medium text-emerald-800 mb-1">Triangulation Complete</p>
                  <p className="text-sm text-emerald-700">
                    {triangles.length} triangle(s) created
                  </p>
                  <p className="text-sm text-emerald-700 mt-1">
                    Total sides: {sideInputs.length} ({vertices.length} outer + {sideInputs.length - vertices.length} diagonals)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Workspace */}
          <div className="workspace flex-1 flex flex-col gap-8">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Polygon Canvas</h3>
                <p className="text-sm text-gray-600">(Draw Your Rough Map Here But Measurement Data Should Take From Your Trace/Blue Print Map From  Department of Survey)</p>
              </div>
              <canvas
                ref={canvasRef}
                className="w-full max-h-[500px] md:max-h-[600px] lg:max-h-[700px] object-contain"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseLeave={handleCanvasMouseUp}
                onTouchStart={handleCanvasTouchStart}
                onTouchMove={handleCanvasTouchMove}
                onTouchEnd={handleCanvasMouseUp}
                style={{ 
                  touchAction: isEditMode ? 'none' : 'auto',
                  cursor: isEditMode ? 'pointer' : 'default'
                }}
              />
            </div>

            <div className="results-panel bg-white rounded-2xl shadow-lg">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-6 bg-green-500 rounded-full"></div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Side Lengths {isTriangulated && <span className="text-sm font-normal text-gray-500">({sideInputs.length} total)</span>}
                  </h3>
                </div>
                
                {/* Vertex name summary */}
                {sideInputs.length > 0 && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">All Sides Overview</p>
                    <p className="text-sm text-gray-600 mb-2">
                      {getAllVertexNames()}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Scale Value:</span> 1:{sideInputs.length > 0 ? sideInputs[0].scaleValue : '0'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Unit Type:</span> {sideInputs.length > 0 ? (sideInputs[0].unitType === 'cm' ? 'Centimeters (cm)' : 'Millimeters (mm)') : 'N/A'}
                    </p>
                  </div>
                )}
                
                <div className="rounded-xl border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 border-b">Side</th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 border-b">Enter Length</th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 border-b">Ground Length</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sideInputs.length > 0 ? (
                        sideInputs.map((side) => (
                          <tr key={side.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-6 border-b">
                              <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-medium ${
                                  side.isSide 
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                                    : 'bg-red-100 text-red-700 border border-red-200'
                                }`}>
                                  {side.label}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {side.isSide ? 'Side' : 'Diagonal'}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6 border-b">
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                placeholder={`Enter length in ${side.unitType}`}
                                value={side.inputValue}
                                onChange={(e) => handleSideInputChange(side.id, e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                              />
                            </td>
                            <td className="py-4 px-6 border-b">
                              {side.finalLength ? (
                                <span className="text-gray-700 font-medium">
                                  {(() => {
                                    const length = parseFloat(side.finalLength);
                                    let lengthInFeet;
                                    if (side.unitType === 'mm') {
                                      lengthInFeet = length / 304.8;
                                    } else {
                                      lengthInFeet = length / 30.48;
                                    }
                                    return lengthInFeet.toFixed(6) + ' ft';
                                  })()}
                                </span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="py-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p className="text-gray-500">Click "Draw Polygon" to start calculating</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  {/* On mobile: stack buttons vertically, on desktop: keep them inline */}
                  <div className="flex flex-col md:flex-row gap-4 w-full">
                    <button
                      onClick={handleCalculateArea}
                      disabled={!allInputsValid()}
                      className={`w-full md:flex-1 px-6 py-4 font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 ${
                        allInputsValid()
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Calculate Area
                    </button>
                    <button
                      onClick={handleResetSideLengths}
                      className="w-full md:w-auto px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reset
                    </button>
                    <button
                      onClick={handleDownloadCombinedImage}
                      className="w-full md:w-auto px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h16V4M4 10v6h16v-6M4 16v4h16v-4" />
                      </svg>
                      Download Snapshot
                    </button>
                  </div>
                </div>

                {calculatedArea && (
                  <button
                    onClick={transferToConverter}
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Use this value in converter
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Unit Converter Section */}
        <div className="unit-converter-section mb-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Area Unit Converter</h2>
                <p className="text-gray-600">Convert between different area measurement systems</p>
              </div>
              
              <div className="converter-input mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Square Meters Input */}
                  <div className="input-group">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Square Meters (m²)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={converterFromUnit === 'square_meters' ? converterInput : ''}
                      onChange={(e) => {
                        handleConverterInputChange(e.target.value);
                        setConverterFromUnit('square_meters');
                      }}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Square Feet Input */}
                  <div className="input-group">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Square Feet (ft²)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={converterFromUnit === 'square_feet' ? converterInput : ''}
                      onChange={(e) => {
                        handleConverterInputChange(e.target.value);
                        setConverterFromUnit('square_feet');
                      }}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Terai Region Input */}
                  <div className="input-group">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Terai Region (Nepal)
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={teraiInput.bigha}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === '' || /^[0-9]*\.?[0-9]*$/.test(raw)) {
                              setTeraiInput({ ...teraiInput, bigha: raw });
                              setConverterFromUnit('terai');
                              convertFromTerai(raw, teraiInput.katha, teraiInput.dhur);
                            }
                          }}
                          onBlur={() => {
                            if (teraiInput.bigha === '' || parseFloat(teraiInput.bigha) < 0) {
                              setTeraiInput({...teraiInput, bigha: '0'});
                              convertFromTerai('0', teraiInput.katha, teraiInput.dhur);
                            }
                          }}
                          placeholder="00"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1 text-center">Bigha</p>
                      </div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={teraiInput.katha}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === '' || /^[0-9]*\.?[0-9]*$/.test(raw)) {
                              setTeraiInput({ ...teraiInput, katha: raw });
                              setConverterFromUnit('terai');
                              convertFromTerai(teraiInput.bigha, raw, teraiInput.dhur);
                            }
                          }}
                          onBlur={() => {
                            if (teraiInput.katha === '' || parseFloat(teraiInput.katha) < 0) {
                              setTeraiInput({...teraiInput, katha: '0'});
                              convertFromTerai(teraiInput.bigha, '0', teraiInput.dhur);
                            }
                          }}
                          placeholder="00"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1 text-center">Katha</p>
                      </div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={teraiInput.dhur}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === '' || /^[0-9]*\.?[0-9]*$/.test(raw)) {
                              setTeraiInput({ ...teraiInput, dhur: raw });
                              setConverterFromUnit('terai');
                              convertFromTerai(teraiInput.bigha, teraiInput.katha, raw);
                            }
                          }}
                          onBlur={() => {
                            if (teraiInput.dhur === '' || parseFloat(teraiInput.dhur) < 0) {
                              setTeraiInput({...teraiInput, dhur: '0'});
                              convertFromTerai(teraiInput.bigha, teraiInput.katha, '0');
                            }
                          }}
                          placeholder="00"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1 text-center">Dhur</p>
                      </div>
                    </div>
                  </div>

                  {/* Hill Region Input */}
                  <div className="input-group">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Hill Region (Nepal)
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={hillInput.ropani}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === '' || /^[0-9]*\.?[0-9]*$/.test(raw)) {
                              setHillInput({ ...hillInput, ropani: raw });
                              setConverterFromUnit('hill');
                              convertFromHill(raw, hillInput.anna, hillInput.paisa, hillInput.daam);
                            }
                          }}
                          onBlur={() => {
                            if (hillInput.ropani === '' || parseFloat(hillInput.ropani) < 0) {
                              setHillInput({...hillInput, ropani: '0'});
                              convertFromHill('0', hillInput.anna, hillInput.paisa, hillInput.daam);
                            }
                          }}
                          placeholder="00"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1 text-center">Ropani</p>
                      </div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={hillInput.anna}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === '' || /^[0-9]*\.?[0-9]*$/.test(raw)) {
                              setHillInput({ ...hillInput, anna: raw });
                              setConverterFromUnit('hill');
                              convertFromHill(hillInput.ropani, raw, hillInput.paisa, hillInput.daam);
                            }
                          }}
                          onBlur={() => {
                            if (hillInput.anna === '' || parseFloat(hillInput.anna) < 0) {
                              setHillInput({...hillInput, anna: '0'});
                              convertFromHill(hillInput.ropani, '0', hillInput.paisa, hillInput.daam);
                            }
                          }}
                          placeholder="00"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1 text-center">Anna</p>
                      </div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={hillInput.paisa}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === '' || /^[0-9]*\.?[0-9]*$/.test(raw)) {
                              setHillInput({ ...hillInput, paisa: raw });
                              setConverterFromUnit('hill');
                              convertFromHill(hillInput.ropani, hillInput.anna, raw, hillInput.daam);
                            }
                          }}
                          onBlur={() => {
                            if (hillInput.paisa === '' || parseFloat(hillInput.paisa) < 0) {
                              setHillInput({...hillInput, paisa: '0'});
                              convertFromHill(hillInput.ropani, hillInput.anna, '0', hillInput.daam);
                            }
                          }}
                          placeholder="00"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1 text-center">Paisa</p>
                      </div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={hillInput.daam}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === '' || /^[0-9]*\.?[0-9]*$/.test(raw)) {
                              setHillInput({ ...hillInput, daam: raw });
                              setConverterFromUnit('hill');
                              convertFromHill(hillInput.ropani, hillInput.anna, hillInput.paisa, raw);
                            }
                          }}
                          onBlur={() => {
                            if (hillInput.daam === '' || parseFloat(hillInput.daam) < 0) {
                              setHillInput({...hillInput, daam: '0'});
                              convertFromHill(hillInput.ropani, hillInput.anna, hillInput.paisa, '0');
                            }
                          }}
                          placeholder="00"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1 text-center">Daam</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleConvert}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Convert All Units
                  </button>
                </div>
              </div>

              <div className="converter-results grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="result-box bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 text-center border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 8H22V16H2V8Z" fill="#3B82F6" fill-opacity="0.2"/>
                    <rect x="2" y="8" width="20" height="8" rx="1" stroke="#3B82F6" stroke-width="2"/>
                    
                    <line x1="4" y1="8" x2="4" y2="14" stroke="#3B82F6" stroke-width="1.5"/>
                    <line x1="8" y1="8" x2="8" y2="12" stroke="#3B82F6" stroke-width="1.5"/>
                    <line x1="12" y1="8" x2="12" y2="14" stroke="#3B82F6" stroke-width="1.5"/>
                    <line x1="16" y1="8" x2="16" y2="12" stroke="#3B82F6" stroke-width="1.5"/>
                    <line x1="20" y1="8" x2="20" y2="14" stroke="#3B82F6" stroke-width="1.5"/>
                    
                    
                    <text x="4" y="20" fill="#3B82F6" font-size="4" text-anchor="middle">0</text>
                    <text x="12" y="20" fill="#3B82F6" font-size="4" text-anchor="middle">5</text>
                    <text x="20" y="20" fill="#3B82F6" font-size="4" text-anchor="middle">10</text>
                  </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Square Meters</h3>
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {converterResults.square_meters.toFixed(4)}
                  </div>
                  <div className="text-sm text-gray-500">m²</div>
                </div>

                <div className="result-box bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 text-center border border-gray-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      
                      <circle cx="12" cy="12" r="8" fill="#059669"/>
                      <circle cx="12" cy="12" r="6" fill="#34D399"/>
                      <circle cx="12" cy="12" r="4" fill="#10B981"/>
                      <circle cx="12" cy="12" r="2" fill="#047857"/>
                      
                      <rect x="16" y="11" width="6" height="2" rx="1" fill="#059669"/>
                      
                      <rect x="17" y="11" width="1" height="2" fill="#FFFFFF"/>
                      <rect x="19" y="11" width="1" height="2" fill="#FFFFFF"/>
                      <rect x="21" y="11" width="1" height="2" fill="#FFFFFF"/>
                      
                      <path d="M14 5C14 6.65685 12.6569 8 11 8C9.34315 8 8 6.65685 8 5" stroke="#064E3B" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Square Feet</h3>
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {converterResults.square_feet.toFixed(4)}
                  </div>
                  <div className="text-sm text-gray-500">ft²</div>
                </div>

                <div className="result-box bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 text-center border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">

                    <rect x="5" y="8" width="14" height="12" fill="#C084FC" rx="1"/>

                    <rect x="5" y="8" width="14" height="12" rx="1" stroke="#9333EA" stroke-width="1.5"/>
                    
                    <line x1="12" y1="8" x2="12" y2="20" stroke="#9333EA" stroke-width="1" stroke-dasharray="2,1"/>
                    <line x1="5" y1="14" x2="19" y2="14" stroke="#9333EA" stroke-width="1" stroke-dasharray="2,1"/>
                  </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Terai Region</h3>
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {converterResults.terai.bigha || "00"}
                  </div>
                  <div className="text-sm text-gray-500 mb-3">Bigha</div>
                  <div className="sub-result mt-4 pt-4 border-t border-gray-200 space-y-2">
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">{converterResults.terai.katha || "00"}</span> Katha
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">{converterResults.terai.dhur || "00"}</span> Dhur
                    </div>
                  </div>
                </div>

                <div className="result-box bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 text-center border border-gray-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    
                    <rect width="24" height="24" fill="url(#orangeSky)"/>
                    
                    <path d="M0 18L6 8L12 14L18 6L24 18H0Z" fill="#EA580C"/>
                    
                    <path d="M6 8L9 11L6 11Z" fill="#FFFFFF"/>
                    <path d="M18 6L21 9L18 9Z" fill="#FFFFFF"/>
                    
                    <ellipse cx="12" cy="20" rx="10" ry="4" fill="#F97316"/>
                    
                    <defs>
                      <linearGradient id="orangeSky" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#FEF3C7"/>
                        <stop offset="100%" stop-color="#FFEDD5"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Hill Region</h3>
                  <div className="text-2xl font-bold text-orange-600 mb-2">
                    {converterResults.hill.ropani || "00"}
                  </div>
                  <div className="text-sm text-gray-500 mb-3">Ropani</div>
                  <div className="sub-result mt-4 pt-4 border-t border-gray-200 space-y-2">
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">{converterResults.hill.anna || "00"}</span> Anna
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">{converterResults.hill.paisa || "00"}</span> Paisa
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">{converterResults.hill.daam || "00"}</span> Daam
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 border-t border-gray-200 p-6">
              <div className="text-center text-gray-600 text-sm">
                <p>© 2026 <a href="www.udayrajchaudhary.com.np">uday-studio</a>. All Rights Reserved. Developed by <a href="www.udayrajchaudhary.com.np">udaytharu</a>.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandAreaCalculator;
