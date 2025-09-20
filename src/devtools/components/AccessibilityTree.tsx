import React, { useState, useEffect } from 'react';

interface AccessibilityNode {
  role: string;
  name: string;
  description: string;
  children: AccessibilityNode[];
  element?: HTMLElement;
  level: number;
}

const AccessibilityTree: React.FC = () => {
  const [tree, setTree] = useState<AccessibilityNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<AccessibilityNode | null>(null);

  useEffect(() => {
    buildAccessibilityTree();
  }, []);

  const buildAccessibilityTree = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        const response = await chrome.tabs.sendMessage(tab.id, {
          type: 'GET_ACCESSIBILITY_TREE'
        });
        setTree(response || []);
      }
    } catch (error) {
      console.error('Failed to build accessibility tree:', error);
      // Fallback: build tree from current page
      setTree(buildTreeFromDOM());
    }
  };

  const buildTreeFromDOM = (): AccessibilityNode[] => {
    const root = document.body;
    if (!root) return [];

    return buildNodeTree(root, 0);
  };

  const buildNodeTree = (element: HTMLElement, level: number): AccessibilityNode[] => {
    const nodes: AccessibilityNode[] = [];
    
    // Skip hidden elements
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return nodes;
    }

    const role = element.getAttribute('role') || getImplicitRole(element);
    const name = getAccessibleName(element);
    const description = getAccessibleDescription(element);

    if (role && role !== 'none') {
      const node: AccessibilityNode = {
        role,
        name,
        description,
        children: [],
        element,
        level
      };

      // Build children
      for (const child of Array.from(element.children)) {
        if (child instanceof HTMLElement) {
          node.children.push(...buildNodeTree(child, level + 1));
        }
      }

      nodes.push(node);
    } else {
      // If element doesn't have a role, process its children
      for (const child of Array.from(element.children)) {
        if (child instanceof HTMLElement) {
          nodes.push(...buildNodeTree(child, level));
        }
      }
    }

    return nodes;
  };

  const getImplicitRole = (element: HTMLElement): string => {
    const tagName = element.tagName.toLowerCase();
    
    const roleMap: Record<string, string> = {
      'button': 'button',
      'a': 'link',
      'input': element.getAttribute('type') === 'checkbox' ? 'checkbox' : 
              element.getAttribute('type') === 'radio' ? 'radio' : 'textbox',
      'select': 'combobox',
      'textarea': 'textbox',
      'img': 'img',
      'h1': 'heading',
      'h2': 'heading',
      'h3': 'heading',
      'h4': 'heading',
      'h5': 'heading',
      'h6': 'heading',
      'nav': 'navigation',
      'main': 'main',
      'header': 'banner',
      'footer': 'contentinfo',
      'aside': 'complementary',
      'section': 'region',
      'article': 'article',
      'ul': 'list',
      'ol': 'list',
      'li': 'listitem',
      'table': 'table',
      'thead': 'rowgroup',
      'tbody': 'rowgroup',
      'tfoot': 'rowgroup',
      'tr': 'row',
      'th': 'columnheader',
      'td': 'cell',
      'form': 'form',
      'fieldset': 'group',
      'legend': 'legend',
      'label': 'label'
    };

    return roleMap[tagName] || 'none';
  };

  const getAccessibleName = (element: HTMLElement): string => {
    // Check aria-label first
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    // Check aria-labelledby
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const labelElement = document.getElementById(ariaLabelledBy);
      if (labelElement) return labelElement.textContent || '';
    }

    // Check for associated label
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label.textContent || '';
    }

    // Check for text content
    if (element.textContent) {
      return element.textContent.trim().substring(0, 50);
    }

    // Check for alt text on images
    if (element.tagName.toLowerCase() === 'img') {
      return element.getAttribute('alt') || 'Image';
    }

    // Check for title attribute
    const title = element.getAttribute('title');
    if (title) return title;

    return 'Unnamed';
  };

  const getAccessibleDescription = (element: HTMLElement): string => {
    const ariaDescribedBy = element.getAttribute('aria-describedby');
    if (ariaDescribedBy) {
      const descElement = document.getElementById(ariaDescribedBy);
      if (descElement) return descElement.textContent || '';
    }

    const ariaDescription = element.getAttribute('aria-description');
    if (ariaDescription) return ariaDescription;

    return '';
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const highlightNode = async (node: AccessibilityNode) => {
    if (node.element) {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id) {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'HIGHLIGHT_ELEMENT',
            payload: { element: node.element.outerHTML }
          });
        }
      } catch (error) {
        console.error('Failed to highlight element:', error);
      }
    }
  };

  const renderNode = (node: AccessibilityNode, index: number): React.ReactNode => {
    const nodeId = `${node.role}-${index}-${node.level}`;
    const isExpanded = expandedNodes.has(nodeId);
    const hasChildren = node.children.length > 0;

    return (
      <div key={nodeId} className="select-none">
        <div
          className={`flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer ${
            selectedNode === node ? 'bg-blue-100' : ''
          }`}
          style={{ paddingLeft: `${node.level * 20 + 8}px` }}
          onClick={() => setSelectedNode(node)}
        >
          {hasChildren && (
            <button
              className="w-4 h-4 mr-2 flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(nodeId);
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && <div className="w-4 h-4 mr-2" />}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                {node.role}
              </span>
              <span className="text-sm font-medium text-gray-900 truncate">
                {node.name}
              </span>
            </div>
            {node.description && (
              <div className="text-xs text-gray-600 truncate">
                {node.description}
              </div>
            )}
          </div>
          
          <button
            className="btn btn-secondary btn-sm ml-2"
            onClick={(e) => {
              e.stopPropagation();
              highlightNode(node);
            }}
          >
            Highlight
          </button>
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {node.children.map((child, childIndex) => 
              renderNode(child, childIndex)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Accessibility Tree</h2>
          <button
            className="btn btn-secondary btn-sm"
            onClick={buildAccessibilityTree}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto">
        {tree.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">🌳</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No accessibility tree</h3>
              <p className="text-gray-600">
                Unable to build accessibility tree for this page
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4">
            {tree.map((node, index) => renderNode(node, index))}
          </div>
        )}
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-2">Selected Node</h3>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-700">Role:</span>
              <span className="ml-2 font-mono text-sm bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                {selectedNode.role}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Name:</span>
              <span className="ml-2 text-sm text-gray-900">{selectedNode.name}</span>
            </div>
            {selectedNode.description && (
              <div>
                <span className="text-sm font-medium text-gray-700">Description:</span>
                <span className="ml-2 text-sm text-gray-900">{selectedNode.description}</span>
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-gray-700">Level:</span>
              <span className="ml-2 text-sm text-gray-900">{selectedNode.level}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Children:</span>
              <span className="ml-2 text-sm text-gray-900">{selectedNode.children.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityTree;
