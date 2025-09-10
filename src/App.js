import React, { useState, useCallback, useRef } from 'react';
import {
  Play,
  Plus,
  Save,
  Download,
  Upload,
  Settings,
  GitBranch,
  Cloud,
  Database,
  Monitor,
  Trash2,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

const CICDPipelineBuilder = () => {
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [pipelineBlocks, setPipelineBlocks] = useState([]);
  const [connections, setConnections] = useState([]);
  const [pipelineName, setPipelineName] = useState('My Pipeline');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState([]);
  const dragRef = useRef(null);

  // Available pipeline blocks
  const blockTypes = {
    source: {
      icon: GitBranch,
      name: 'Source Control',
      color: '#3B82F6',
      config: { repo: '', branch: 'main', provider: 'github' }
    },
    build: {
      icon: Settings,
      name: 'Build',
      color: '#10B981',
      config: { buildspec: '', runtime: 'node18', commands: ['npm install', 'npm run build'] }
    },
    test: {
      icon: CheckCircle,
      name: 'Test',
      color: '#F59E0B',
      config: { testCommand: 'npm test', coverage: true, reports: true }
    },
    deploy: {
      icon: Cloud,
      name: 'Deploy',
      color: '#8B5CF6',
      config: { environment: 'staging', service: 'lambda', region: 'us-east-1' }
    },
    database: {
      icon: Database,
      name: 'Database Migration',
      color: '#6366F1',
      config: { type: 'rds', scripts: [], backup: true }
    },
    monitoring: {
      icon: Monitor,
      name: 'Monitoring',
      color: '#EF4444',
      config: { alerts: true, dashboard: true, logs: true }
    }
  };

  // CSS styles
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#F9FAFB',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    header: {
      backgroundColor: 'white',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      borderBottom: '1px solid #E5E7EB',
      padding: '16px 24px'
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#111827',
      margin: 0
    },
    pipelineNameInput: {
      padding: '8px 12px',
      border: '1px solid #D1D5DB',
      borderRadius: '6px',
      outline: 'none',
      fontSize: '14px'
    },
    headerButtons: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    button: {
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.2s'
    },
    executeButton: {
      backgroundColor: '#2563EB',
      color: 'white'
    },
    executeButtonHover: {
      backgroundColor: '#1D4ED8'
    },
    executeButtonDisabled: {
      backgroundColor: '#9CA3AF',
      cursor: 'not-allowed'
    },
    saveButton: {
      backgroundColor: '#059669',
      color: 'white'
    },
    saveButtonHover: {
      backgroundColor: '#047857'
    },
    mainLayout: {
      display: 'flex',
      height: 'calc(100vh - 73px)'
    },
    sidebar: {
      width: '320px',
      backgroundColor: 'white',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      borderRight: '1px solid #E5E7EB',
      padding: '24px'
    },
    sidebarTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '16px'
    },
    blockLibrary: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    blockItem: {
      padding: '16px',
      borderRadius: '8px',
      cursor: 'move',
      transition: 'opacity 0.2s',
      color: 'white'
    },
    blockItemContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    blockName: {
      fontWeight: '500'
    },
    configPanel: {
      marginTop: '32px',
      borderTop: '1px solid #E5E7EB',
      paddingTop: '24px'
    },
    configTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '16px'
    },
    configFields: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    fieldLabel: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '4px'
    },
    fieldInput: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #D1D5DB',
      borderRadius: '6px',
      outline: 'none',
      fontSize: '14px'
    },
    fieldTextarea: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #D1D5DB',
      borderRadius: '6px',
      outline: 'none',
      fontSize: '14px',
      minHeight: '80px',
      resize: 'vertical'
    },
    checkboxContainer: {
      display: 'flex',
      alignItems: 'center'
    },
    checkbox: {
      marginRight: '8px'
    },
    deleteButton: {
      width: '100%',
      backgroundColor: '#DC2626',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: '500'
    },
    canvas: {
      flex: 1,
      position: 'relative'
    },
    canvasArea: {
      width: '100%',
      height: '100%',
      backgroundColor: '#F3F4F6',
      position: 'relative'
    },
    gridPattern: {
      position: 'absolute',
      inset: 0,
      opacity: 0.2,
      pointerEvents: 'none'
    },
    pipelineBlock: {
      position: 'absolute',
      padding: '16px',
      borderRadius: '8px',
      cursor: 'pointer',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      transition: 'box-shadow 0.2s',
      color: 'white',
      border: '2px solid transparent'
    },
    pipelineBlockSelected: {
      border: '2px solid white'
    },
    pipelineBlockHover: {
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    },
    blockContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    blockTitle: {
      fontWeight: '500',
      fontSize: '14px'
    },
    blockId: {
      fontSize: '12px',
      marginTop: '4px',
      opacity: 0.75
    },
    connectionSvg: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none'
    },
    emptyState: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    emptyStateContent: {
      textAlign: 'center',
      color: '#6B7280'
    },
    emptyStateIcon: {
      margin: '0 auto 16px',
      opacity: 0.5
    },
    emptyStateTitle: {
      fontSize: '20px',
      fontWeight: '500',
      marginBottom: '8px'
    },
    emptyStateSubtitle: {
      fontSize: '14px'
    },
    logsPanel: {
      width: '384px',
      backgroundColor: 'white',
      borderLeft: '1px solid #E5E7EB',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    },
    logsPanelHeader: {
      padding: '16px',
      borderBottom: '1px solid #E5E7EB'
    },
    logsPanelTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    logsContent: {
      padding: '16px',
      maxHeight: '384px',
      overflowY: 'auto'
    },
    logsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    logEntry: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px'
    },
    logIcon: {
      flexShrink: 0,
      marginTop: '2px'
    },
    logContent: {},
    logStage: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#111827'
    },
    logTime: {
      fontSize: '12px',
      color: '#6B7280'
    },
    logMessage: {
      fontSize: '14px',
      color: '#374151',
      marginTop: '4px'
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, blockType) => {
    e.dataTransfer.setData('blockType', blockType);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const blockType = e.dataTransfer.getData('blockType');
    const rect = e.target.getBoundingClientRect();
   
    const newBlock = {
      id: `${blockType}-${Date.now()}`,
      type: blockType,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      config: { ...blockTypes[blockType].config }
    };
   
    setPipelineBlocks([...pipelineBlocks, newBlock]);
  };

  const handleBlockClick = (block) => {
    setSelectedBlock(block);
  };

  const updateBlockConfig = (blockId, config) => {
    setPipelineBlocks(prev =>
      prev.map(block =>
        block.id === blockId ? { ...block, config } : block
      )
    );
  };

  const deleteBlock = (blockId) => {
    setPipelineBlocks(prev => prev.filter(block => block.id !== blockId));
    setConnections(prev =>
      prev.filter(conn => conn.from !== blockId && conn.to !== blockId)
    );
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(null);
    }
  };

  const connectBlocks = (fromId, toId) => {
    if (fromId !== toId && !connections.some(conn => conn.from === fromId && conn.to === toId)) {
      setConnections([...connections, { from: fromId, to: toId }]);
    }
  };

  const executePipeline = async () => {
    if (pipelineBlocks.length === 0) {
      alert('Please add at least one block to the pipeline');
      return;
    }

    setIsExecuting(true);
    setExecutionLogs([]);
   
    // Simulate pipeline execution
    const sortedBlocks = [...pipelineBlocks]; // In real implementation, sort by dependencies
   
    for (let i = 0; i < sortedBlocks.length; i++) {
      const block = sortedBlocks[i];
      const blockInfo = blockTypes[block.type];
     
      setExecutionLogs(prev => [
        ...prev,
        {
          time: new Date().toLocaleTimeString(),
          stage: blockInfo.name,
          status: 'running',
          message: `Starting ${blockInfo.name}...`
        }
      ]);
     
      // Simulate execution time
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
     
      const success = Math.random() > 0.1; // 90% success rate
     
      setExecutionLogs(prev => [
        ...prev,
        {
          time: new Date().toLocaleTimeString(),
          stage: blockInfo.name,
          status: success ? 'success' : 'error',
          message: success ? `${blockInfo.name} completed successfully` : `${blockInfo.name} failed`
        }
      ]);
     
      if (!success) break;
    }
   
    setIsExecuting(false);
  };

  const generateCloudFormation = () => {
    const template = {
      AWSTemplateFormatVersion: '2010-09-09',
      Description: `CI/CD Pipeline for ${pipelineName}`,
      Resources: {}
    };

    // Generate CodePipeline resource
    template.Resources.CodePipeline = {
      Type: 'AWS::CodePipeline::Pipeline',
      Properties: {
        Name: pipelineName.replace(/\s+/g, '-'),
        RoleArn: { Ref: 'CodePipelineRole' },
        Stages: pipelineBlocks.map((block, index) => ({
          Name: `Stage${index + 1}`,
          Actions: [{
            Name: blockTypes[block.type].name.replace(/\s+/g, ''),
            ActionTypeId: {
              Category: block.type === 'source' ? 'Source' : block.type === 'build' ? 'Build' : 'Deploy',
              Owner: 'AWS',
              Provider: block.type === 'source' ? 'GitHub' : 'CodeBuild'
            }
          }]
        }))
      }
    };

    return JSON.stringify(template, null, 2);
  };

  const savePipeline = () => {
    const pipelineData = {
      name: pipelineName,
      blocks: pipelineBlocks,
      connections,
      cloudFormation: generateCloudFormation()
    };
   
    const blob = new Blob([JSON.stringify(pipelineData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pipelineName.replace(/\s+/g, '-')}-pipeline.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const createGridPattern = () => {
    const gridSize = 20;
    const lines = [];
   
    for (let i = 0; i <= 40; i++) {
      lines.push(
        <line
          key={`v-${i}`}
          x1={i * gridSize}
          y1={0}
          x2={i * gridSize}
          y2={800}
          stroke="#D1D5DB"
          strokeWidth="1"
        />
      );
    }
   
    for (let i = 0; i <= 40; i++) {
      lines.push(
        <line
          key={`h-${i}`}
          x1={0}
          y1={i * gridSize}
          x2={800}
          y2={i * gridSize}
          stroke="#D1D5DB"
          strokeWidth="1"
        />
      );
    }
   
    return lines;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <h1 style={styles.title}>CI/CD Pipeline Builder</h1>
            <input
              type="text"
              value={pipelineName}
              onChange={(e) => setPipelineName(e.target.value)}
              style={styles.pipelineNameInput}
            />
          </div>
          <div style={styles.headerButtons}>
            <button
              onClick={executePipeline}
              disabled={isExecuting}
              style={{
                ...styles.button,
                ...(isExecuting ? styles.executeButtonDisabled : styles.executeButton)
              }}
              onMouseEnter={(e) => {
                if (!isExecuting) {
                  e.target.style.backgroundColor = styles.executeButtonHover.backgroundColor;
                }
              }}
              onMouseLeave={(e) => {
                if (!isExecuting) {
                  e.target.style.backgroundColor = styles.executeButton.backgroundColor;
                }
              }}
            >
              <Play size={16} />
              <span>{isExecuting ? 'Executing...' : 'Execute Pipeline'}</span>
            </button>
            <button
              onClick={savePipeline}
              style={{...styles.button, ...styles.saveButton}}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = styles.saveButtonHover.backgroundColor;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = styles.saveButton.backgroundColor;
              }}
            >
              <Save size={16} />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>

      <div style={styles.mainLayout}>
        {/* Sidebar - Block Library */}
        <div style={styles.sidebar}>
          <h2 style={styles.sidebarTitle}>Pipeline Blocks</h2>
          <div style={styles.blockLibrary}>
            {Object.entries(blockTypes).map(([type, info]) => {
              const IconComponent = info.icon;
              return (
                <div
                  key={type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, type)}
                  style={{
                    ...styles.blockItem,
                    backgroundColor: info.color
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = '1';
                  }}
                >
                  <div style={styles.blockItemContent}>
                    <IconComponent size={24} />
                    <span style={styles.blockName}>{info.name}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Configuration Panel */}
          {selectedBlock && (
            <div style={styles.configPanel}>
              <h3 style={styles.configTitle}>
                Configure {blockTypes[selectedBlock.type].name}
              </h3>
              <div style={styles.configFields}>
                {Object.entries(selectedBlock.config).map(([key, value]) => (
                  <div key={key}>
                    <label style={styles.fieldLabel}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                    {Array.isArray(value) ? (
                      <textarea
                        value={value.join('\n')}
                        onChange={(e) => updateBlockConfig(selectedBlock.id, {
                          ...selectedBlock.config,
                          [key]: e.target.value.split('\n')
                        })}
                        style={styles.fieldTextarea}
                      />
                    ) : typeof value === 'boolean' ? (
                      <label style={styles.checkboxContainer}>
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => updateBlockConfig(selectedBlock.id, {
                            ...selectedBlock.config,
                            [key]: e.target.checked
                          })}
                          style={styles.checkbox}
                        />
                        <span>Enable</span>
                      </label>
                    ) : (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateBlockConfig(selectedBlock.id, {
                          ...selectedBlock.config,
                          [key]: e.target.value
                        })}
                        style={styles.fieldInput}
                      />
                    )}
                  </div>
                ))}
                <button
                  onClick={() => deleteBlock(selectedBlock.id)}
                  style={styles.deleteButton}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#B91C1C';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#DC2626';
                  }}
                >
                  <Trash2 size={16} />
                  <span>Delete Block</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Canvas */}
        <div style={styles.canvas}>
          <div
            style={styles.canvasArea}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            ref={dragRef}
          >
            {/* Grid Pattern */}
            <div style={styles.gridPattern}>
              <svg width="100%" height="100%">
                {createGridPattern()}
              </svg>
            </div>

            {/* Pipeline Blocks */}
            {pipelineBlocks.map((block) => {
              const blockInfo = blockTypes[block.type];
              const IconComponent = blockInfo.icon;
             
              return (
                <div
                  key={block.id}
                  onClick={() => handleBlockClick(block)}
                  style={{
                    ...styles.pipelineBlock,
                    backgroundColor: blockInfo.color,
                    left: block.x,
                    top: block.y,
                    transform: 'translate(-50%, -50%)',
                    ...(selectedBlock?.id === block.id ? styles.pipelineBlockSelected : {})
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.boxShadow = styles.pipelineBlockHover.boxShadow;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = styles.pipelineBlock.boxShadow;
                  }}
                >
                  <div style={styles.blockContent}>
                    <IconComponent size={20} />
                    <span style={styles.blockTitle}>{blockInfo.name}</span>
                  </div>
                  <div style={styles.blockId}>
                    {block.id.split('-')[0]}
                  </div>
                </div>
              );
            })}

            {/* Connection Lines */}
            <svg style={styles.connectionSvg} width="100%" height="100%">
              {connections.map((connection, index) => {
                const fromBlock = pipelineBlocks.find(b => b.id === connection.from);
                const toBlock = pipelineBlocks.find(b => b.id === connection.to);
               
                if (!fromBlock || !toBlock) return null;
               
                return (
                  <line
                    key={index}
                    x1={fromBlock.x}
                    y1={fromBlock.y}
                    x2={toBlock.x}
                    y2={toBlock.y}
                    stroke="#4F46E5"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#4F46E5" />
                </marker>
              </defs>
            </svg>

            {/* Empty State */}
            {pipelineBlocks.length === 0 && (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateContent}>
                  <div style={styles.emptyStateIcon}>
                    <Plus size={48} />
                  </div>
                  <p style={styles.emptyStateTitle}>Start Building Your Pipeline</p>
                  <p style={styles.emptyStateSubtitle}>Drag blocks from the sidebar to create your CI/CD pipeline</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Execution Logs Panel */}
        {(isExecuting || executionLogs.length > 0) && (
          <div style={styles.logsPanel}>
            <div style={styles.logsPanelHeader}>
              <h3 style={styles.logsPanelTitle}>
                <Monitor size={20} />
                <span>Execution Logs</span>
              </h3>
            </div>
            <div style={styles.logsContent}>
              <div style={styles.logsList}>
                {executionLogs.map((log, index) => (
                  <div key={index} style={styles.logEntry}>
                    <div style={styles.logIcon}>
                      {log.status === 'running' && <Clock size={16} color="#F59E0B" />}
                      {log.status === 'success' && <CheckCircle size={16} color="#10B981" />}
                      {log.status === 'error' && <AlertCircle size={16} color="#EF4444" />}
                    </div>
                    <div style={styles.logContent}>
                      <div style={styles.logStage}>{log.stage}</div>
                      <div style={styles.logTime}>{log.time}</div>
                      <div style={styles.logMessage}>{log.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CICDPipelineBuilder;