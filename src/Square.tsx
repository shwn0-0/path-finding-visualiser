import React, { useCallback } from 'react';
import { Node, NodeType } from './node';

const NodeColor = new Map([
  [NodeType.Empty, 'white'],
  [NodeType.Wall, '#222'],
  [NodeType.Path, 'gray'],
  [NodeType.End, 'blue'],
  [NodeType.Start, 'green'],
  [NodeType.Current, 'green'],
  [NodeType.Searching, 'lightblue'],
  [NodeType.Visited, 'red'],
]);

interface Props {
  node: Node;
  debug: boolean;
  onClick: (node: Node, isLeftClick: boolean) => void;
}

export default function Square({
  node,
  debug,
  onClick,
}: Props) {
  const handleMouseDown = useCallback((event) => {
    if (event.buttons === 1 || event.buttons === 2)
      onClick(node, event.buttons === 1);
  }, [node, onClick])

  return (
    <div
      draggable="false"
      className='square'
      style={{ backgroundColor: NodeColor.get(node.type) }}
      onContextMenu={(e) => e.preventDefault()}
      onMouseDown={handleMouseDown}
      onMouseOver={handleMouseDown}
    >
      {debug &&
        node.type !== NodeType.Empty &&
        node.type !== NodeType.Wall && [
          <p
            draggable="false"
            key={0}
            className = "square-info"
          >
            {node.gCost < 99.0 ? node.gCost.toFixed(1) : '∞'}
          </p>,
          <p
            draggable="false"
            key={1}
            className = "square-info"
          >
            {node.fCost < 99.0 ? node.fCost.toFixed(1) : '∞'}
          </p>,
          <p
            draggable="false"
            key={2}
            className = "square-info"
          >
            {node.hCost.toFixed(1)}
          </p>,
        ]}
    </div>
  );
}
