'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  BackgroundVariant,
  ConnectionMode,
  Panel,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';

import { createClient } from '@/lib/supabase/client';
import { PositionNode } from './PositionNode';
import { cn } from '@/lib/utils';

// Edge styling
const defaultEdgeOptions = {
  style: { 
    stroke: '#404040', 
    strokeWidth: 2,
  },
  type: 'smoothstep',
  animated: false,
};

interface OrgMember {
  user_id: string | null;
  role: string;
  display_title?: string;
  reports_to?: string;
  reports_to_role?: string;
  position_order: number;
  position_description?: string;
  is_vacant?: boolean;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    email?: string;
  };
}

interface Team {
  id: string;
  name: string;
  color: string;
  team_members?: {
    user_id: string;
    role: 'lead' | 'member';
  }[];
}

interface OrgChartViewProps {
  organizationId: string;
  members: OrgMember[];
  teams: Team[];
  isEditing?: boolean;
  onPositionClick?: (userId: string, role: string) => void;
}

// Layout algorithm using dagre
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 250;
  const nodeHeight = 100;

  dagreGraph.setGraph({ rankdir: direction, nodesep: 100, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: 'top' as const,
      sourcePosition: 'bottom' as const,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };

    return newNode;
  });

  return { nodes: newNodes, edges };
};

function OrgChartViewInner({ 
  organizationId, 
  members, 
  teams,
  isEditing = false,
  onPositionClick 
}: OrgChartViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();
  
  // Memoize nodeTypes to prevent React Flow warnings
  const nodeTypes = useMemo(() => ({
    position: PositionNode,
  }), []);

  // Convert members to nodes and edges
  useEffect(() => {
    if (!members || members.length === 0) return;

    // Create nodes from members
    const newNodes: Node[] = members
      .map((member, index) => {
        // Generate unique ID for vacant positions
        const nodeId = member.user_id || `vacant-${member.role}-${index}`;
        
        // Find team for this member
        const memberTeam = member.user_id ? teams.find(team => 
          team.team_members?.some(tm => 
            tm.user_id === member.user_id && tm.role === 'lead'
          )
        ) : undefined;

        return {
          id: nodeId,
          type: 'position',
          position: { x: 0, y: 0 }, // Will be calculated by layout
          data: {
            role: member.display_title || member.role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            member: member.user,
            team: memberTeam ? {
              id: memberTeam.id,
              name: memberTeam.name,
              color: memberTeam.color
            } : undefined,
            isVacant: member.is_vacant || !member.user_id,
            description: member.position_description,
            isEditing,
            onEdit: isEditing ? () => onPositionClick?.(nodeId, member.role) : undefined,
          },
        };
      });

    // Create edges from reporting relationships (role-based)
    const newEdges: Edge[] = members
      .filter(member => member.reports_to_role)
      .map((member, index) => {
        // Find the node that has the role this member reports to
        const sourceNode = newNodes.find(node => 
          node.data.role.toLowerCase().replace(/\s+/g, '_') === member.reports_to_role
        );
        
        if (!sourceNode) return null;
        
        const targetNodeId = member.user_id || `vacant-${member.role}-${index}`;
        
        return {
          id: `e${targetNodeId}-${sourceNode.id}`,
          source: sourceNode.id,
          target: targetNodeId,
        };
      })
      .filter(edge => edge !== null) as Edge[];

    // Apply layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      newNodes,
      newEdges,
      'TB' // Top to Bottom
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    // Fit view after layout
    setTimeout(() => {
      fitView({ padding: 0.2 });
    }, 0);
  }, [members, teams, isEditing, onPositionClick, setNodes, setEdges, fitView]);

  return (
    <div className="w-full h-[600px] bg-dark-bg rounded-lg border border-dark-border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        fitView
        minZoom={0.2}
        maxZoom={1.5}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color="#2a2a2a"
        />
        <Controls 
          className="bg-dark-card border-dark-border"
          showInteractive={false}
        />
        <MiniMap 
          className="bg-dark-card border-dark-border"
          nodeColor="#404040"
          maskColor="rgba(0, 0, 0, 0.8)"
          pannable
          zoomable
        />
        
        {/* Empty state */}
        {nodes.length === 0 && (
          <Panel position="top-center" className="bg-dark-card p-4 rounded-lg border border-dark-border">
            <p className="text-gray-400">No organization structure defined yet.</p>
            {isEditing && (
              <p className="text-sm text-gray-500 mt-1">Add members to your organization to see them here.</p>
            )}
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

// Export wrapper component with ReactFlowProvider
export function OrgChartView(props: OrgChartViewProps) {
  return (
    <ReactFlowProvider>
      <OrgChartViewInner {...props} />
    </ReactFlowProvider>
  );
}