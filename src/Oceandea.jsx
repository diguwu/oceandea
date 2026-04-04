import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Oceandea.css';

const Oceandea = () => {
  const canvasRef = useRef(null);
  const [treeData, setTreeData] = useState(() => {
    const saved = localStorage.getItem('oceandea_tree');
    return saved ? JSON.parse(saved) : getDefaultTree();
  });
  const [expandedNodes, setExpandedNodes] = useState(() => {
    const saved = localStorage.getItem('oceandea_expanded');
    return saved ? JSON.parse(saved) : new Set();
  });
  const [selectedNode, setSelectedNode] = useState(null);
  const [detailContent, setDetailContent] = useState(null);
  const [isPersonality, setIsPersonality] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [customParent, setCustomParent] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get default tree structure
  function getDefaultTree() {
    return {
      id: 'root',
      label: 'My Hobbies',
      type: 'nucleus',
      children: [
        {
          id: 'filmmaking',
          label: 'Filmmaking',
          type: 'hobby',
          children: [
            { id: 'fm_short', label: 'Short Format', type: 'option' },
            { id: 'fm_long', label: 'Long Format', type: 'option' }
          ]
        },
        {
          id: 'music',
          label: 'Music',
          type: 'hobby',
          children: [
            { id: 'music_prod', label: 'Production', type: 'option' },
            { id: 'music_listen', label: 'Listening', type: 'option' }
          ]
        },
        {
          id: 'art',
          label: 'Visual Art',
          type: 'hobby',
          children: [
            { id: 'art_digital', label: 'Digital', type: 'option' },
            { id: 'art_traditional', label: 'Traditional', type: 'option' }
          ]
        }
      ]
    };
  }

  // Auto-save tree and expanded nodes
  useEffect(() => {
    localStorage.setItem('oceandea_tree', JSON.stringify(treeData));
  }, [treeData]);

  useEffect(() => {
    localStorage.setItem('oceandea_expanded', JSON.stringify(Array.from(expandedNodes)));
  }, [expandedNodes]);

  // Fetch description for a node
  const fetchDescription = useCallback(async (label) => {
    setLoading(true);
    try {
      // Simple description generator (you can replace with API call)
      const descriptions = {
        'Filmmaking': 'The art of telling stories through moving images. Combines cinematography, editing, direction, and sound design.',
        'Short Format': 'Content designed for quick viewing—TikTok, YouTube Shorts, Instagram Reels. Fast-paced and attention-grabbing.',
        'Long Format': 'Full-length films, documentaries, and series. Allows for deeper storytelling and character development.',
        'Music': 'The creation, performance, or appreciation of organized sound. A universal form of expression.',
        'Production': 'Creating music from scratch using instruments, software, and creative vision.',
        'Listening': 'Appreciating music across genres, discovering new artists, and understanding musical elements.',
        'Visual Art': 'Creating visual expressions through various mediums—painting, drawing, sculpture, and more.',
        'Digital': 'Art created using digital tools like tablets, computers, and software.',
        'Traditional': 'Art created with physical materials like paint, pencil, clay, and canvas.'
      };
      
      return descriptions[label] || `${label} is a creative pursuit that involves skill, passion, and continuous learning.`;
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate personality insight
  const generatePersonalityInsight = useCallback((label) => {
    const insights = {
      'Filmmaking': 'You\'re a visual storyteller with a passion for crafting narratives that move people emotionally.',
      'Short Format': 'You thrive in fast-paced creativity, capturing attention and telling compelling stories in seconds.',
      'Long Format': 'You\'re patient, detail-oriented, and enjoy diving deep into complex narratives and character arcs.',
      'Music': 'You have a deep emotional connection to sound and rhythm. Music is likely a significant part of your identity.',
      'Production': 'You\'re creative and technical—you enjoy building things from the ground up.',
      'Listening': 'You\'re contemplative and open to new experiences. Music helps you process emotions and connect with others.',
      'Visual Art': 'You see the world through a unique lens and express yourself through visual means.',
      'Digital': 'You\'re comfortable with technology and enjoy blending creativity with digital tools.',
      'Traditional': 'You appreciate tactile, hands-on creation and the organic quality of physical mediums.'
    };
    
    return insights[label] || `Your interest in ${label} reveals your creative and curious nature.`;
  }, []);

  // Handle node click
  const handleNodeClick = (e, nodeId) => {
    e.stopPropagation();
    const node = findNodeById(treeData, nodeId);
    
    if (!node) return;

    if (selectedNode === nodeId) {
      // Double click
      setIsPersonality(true);
      setDetailContent(generatePersonalityInsight(node.label));
    } else {
      // Single click
      setSelectedNode(nodeId);
      setIsPersonality(false);
      fetchDescription(node.label).then(desc => {
        setDetailContent(desc);
      });
      
      // Toggle expand
      setExpandedNodes(prev => {
        const newSet = new Set(prev);
        if (newSet.has(nodeId)) {
          newSet.delete(nodeId);
        } else {
          newSet.add(nodeId);
        }
        return newSet;
      });
    }
  };

  // Handle background click
  const handleBackgroundClick = () => {
    setSelectedNode(null);
    setDetailContent(null);
    setIsPersonality(false);
    setCustomInput('');
    setCustomParent(null);
  };

  // Find node by ID
  const findNodeById = (node, id) => {
    if (node.id === id) return node;
    if (node.children) {
      for (let child of node.children) {
        const found = findNodeById(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Add custom option
  const handleAddCustom = async (parentId) => {
    if (!customInput.trim()) return;

    setLoading(true);
    const newNodeId = `custom_${Date.now()}`;
    
    const newNode = {
      id: newNodeId,
      label: customInput,
      type: 'custom',
      children: [
        { id: `${newNodeId}_opt1`, label: 'Option 1', type: 'option' },
        { id: `${newNodeId}_opt2`, label: 'Option 2', type: 'option' }
      ]
    };

    setTreeData(prev => addNodeToTree(prev, parentId, newNode));
    setCustomInput('');
    setCustomParent(null);
    setLoading(false);
    
    // Auto-expand the new node
    setExpandedNodes(prev => new Set([...prev, newNodeId]));
  };

  // Add node to tree recursively
  const addNodeToTree = (node, parentId, newNode) => {
    if (node.id === parentId) {
      return {
        ...node,
        children: [...(node.children || []), newNode]
      };
    }
    if (node.children) {
      return {
        ...node,
        children: node.children.map(child => addNodeToTree(child, parentId, newNode))
      };
    }
    return node;
  };

  // Export as PNG (simplified)
  const handleExportImage = () => {
    alert('Image export requires canvas library. For now, take a screenshot of the tree!');
  };

  // Export as JSON
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(treeData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'oceandea_tree.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Copy to clipboard
  const handleCopyText = () => {
    const text = generateTreeText(treeData);
    navigator.clipboard.writeText(text);
    alert('Tree copied to clipboard!');
  };

  // Generate text representation
  const generateTreeText = (node, depth = 0) => {
    let text = '  '.repeat(depth) + '• ' + node.label + '\n';
    if (node.children) {
      node.children.forEach(child => {
        text += generateTreeText(child, depth + 1);
      });
    }
    return text;
  };

  // Clear all data
  const handleClearAll = () => {
    if (window.confirm('Are you sure? This will delete all your hobbies.')) {
      setTreeData(getDefaultTree());
      setExpandedNodes(new Set());
      setSelectedNode(null);
      setDetailContent(null);
      localStorage.removeItem('oceandea_tree');
      localStorage.removeItem('oceandea_expanded');
    }
  };

  // Render tree nodes
  const renderNodes = (node, parentPos = { x: 0, y: 0 }, angle = 0, radius = 120, depth = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNode === node.id;
    
    // Position calculation for radiating branches
    const childCount = node.children ? node.children.length : 0;
    const angleStep = childCount > 0 ? (Math.PI * 2) / childCount : 0;
    
    return (
      <g key={node.id}>
        {/* Draw branches to children */}
        {isExpanded && node.children && node.children.map((child, index) => {
          const childAngle = angleStep * index;
          const childX = parentPos.x + radius * Math.cos(childAngle);
          const childY = parentPos.y + radius * Math.sin(childAngle);
          
          return (
            <line
              key={`line_${node.id}_${child.id}`}
              x1={parentPos.x}
              y1={parentPos.y}
              x2={childX}
              y2={childY}
              stroke="#A8C5A1"
              strokeWidth="1.5"
              opacity="0.6"
            />
          );
        })}

        {/* Draw node circle */}
        <circle
          cx={parentPos.x}
          cy={parentPos.y}
          r={isSelected ? 15 : 10}
          fill={node.type === 'nucleus' ? '#A8C5A1' : '#B4A8D8'}
          stroke={isSelected ? '#3C3C3C' : 'none'}
          strokeWidth={isSelected ? '2' : '0'}
          style={{ cursor: 'pointer', transition: 'r 0.2s' }}
          onClick={(e) => handleNodeClick(e, node.id)}
          role="button"
          tabIndex="0"
          aria-label={`${node.label}${node.children ? ', expandable' : ''}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleNodeClick(e, node.id);
            }
          }}
        />

        {/* Draw label */}
        <text
          x={parentPos.x}
          y={parentPos.y + 25}
          textAnchor="middle"
          fontSize="12"
          fill="#3C3C3C"
          pointerEvents="none"
          style={{ userSelect: 'none' }}
        >
          {node.label}
        </text>

        {/* Render children if expanded */}
        {isExpanded && node.children && node.children.map((child, index) => {
          const childAngle = angleStep * index;
          const childX = parentPos.x + radius * Math.cos(childAngle);
          const childY = parentPos.y + radius * Math.sin(childAngle);
          
          return renderNodes(child, { x: childX, y: childY }, childAngle, radius * 0.7, depth + 1);
        })}
      </g>
    );
  };

  return (
    <div className="oceandea-container" onClick={handleBackgroundClick}>
      {/* Header */}
      <div className="oceandea-header">
        <h1>Oceandea</h1>
        <div className="oceandea-controls">
          <button onClick={handleExportJSON} aria-label="Export tree as JSON">📥 Export JSON</button>
          <button onClick={handleCopyText} aria-label="Copy tree to clipboard">📋 Copy Text</button>
          <button onClick={handleExportImage} aria-label="Export tree as image">🖼️ Export Image</button>
          <button onClick={handleClearAll} aria-label="Clear all data" className="danger">🗑️ Clear All</button>
        </div>
      </div>

      {/* Main canvas area */}
      <div className="oceandea-canvas" role="main">
        <svg width="100%" height="100%" viewBox="0 0 1000 700">
          {/* Background */}
          <rect width="1000" height="700" fill="#F5F1E8" />
          
          {/* Render tree */}
          {renderNodes(treeData, { x: 500, y: 350 })}
        </svg>
      </div>

      {/* Detail panel */}
      {selectedNode && (
        <div className="oceandea-detail-panel" role="region" aria-live="polite" aria-label="Details panel">
          <div className="detail-content">
            <h3>{isPersonality ? '✨ What This Means About You' : '📖 About'}</h3>
            {loading ? <p>Loading...</p> : <p>{detailContent}</p>}
            <small>Single click for description • Double click for insight</small>
          </div>
        </div>
      )}

      {/* Custom option input */}
      {customParent && (
        <div className="oceandea-custom-input" role="region" aria-label="Add custom option">
          <input
            type="text"
            placeholder="Enter custom hobby or option..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddCustom(customParent);
              if (e.key === 'Escape') {
                setCustomParent(null);
                setCustomInput('');
              }
            }}
            autoFocus
            aria-label="Custom option input"
          />
          <button onClick={() => handleAddCustom(customParent)} aria-label="Add custom option">Add</button>
          <button onClick={() => { setCustomParent(null); setCustomInput(''); }} aria-label="Cancel">Cancel</button>
        </div>
      )}

      {/* Footer info */}
      <div className="oceandea-footer" role="contentinfo">
        <p>💾 Your tree is auto-saved to your browser • 📱 Works on mobile • ♿ Fully accessible</p>
      </div>
    </div>
  );
};

export default Oceandea;
