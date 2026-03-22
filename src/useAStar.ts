import Heap from 'heap-js';
import { useCallback, useState } from 'react';
import { State } from './App';
import { Node, NodeType } from './node';

interface Props {
	state: State;
	gridSize: number;
	speed: number;
	onFinishSearching: (pathFound: boolean) => void;
}

const openList = new Heap<Node>((a, b) => {
  let fDiff = a.fCost - b.fCost;

  if (fDiff !== 0) {
    return fDiff;
  }

  let hDiff = a.hCost - b.hCost;

  if (hDiff !== 0) {
    return hDiff;
  }

  return a.gCost - b.gCost;
})

const closedList = new Set<Node>();
const visited = new Set<Node>();

export default function useAStar({ state, gridSize, speed, onFinishSearching }: Props) {
	const [nodes, setNodes] = useState<Node[]>([]);
	const [startNode, setStartNode] = useState<Node | null>(null);
	const [endNode, setEndNode] = useState<Node | null>(null);
	const [currentNode, setCurrentNode] = useState<Node | null>(null);

	const resetNodes = useCallback(() => {
		setNodes(Array.from(Array(gridSize ** 2)).map((_, idx) => {
      const y = idx % gridSize;
      const x = Math.floor(idx / gridSize);
      return new Node(x, y, gridSize);
    }));
		openList.clear();
    closedList.clear();
    visited.clear();
	}, [gridSize]);

	const selectStart = useCallback((node: Node | null) => {
		if (!node) {
      startNode?.reset(gridSize);
			setStartNode(null);
			return;
		}
    
    node.setType(NodeType.Start);
    node.setGcost(0);
		setStartNode(node);
    setCurrentNode(node);

    openList.clear();
    openList.add(node);
    visited.clear();
    visited.add(node);
  }, [gridSize, startNode, setStartNode]);

	const selectEnd = useCallback((node: Node | null) => {
		if (!node) {
      endNode?.reset(gridSize);
      setEndNode(null);
			return;
		}

		setEndNode(node);
    node.setType(NodeType.End);
    for (let currNode of nodes) {
      currNode.calculateHCost(node);
    }
	}, [gridSize, nodes, endNode, setEndNode]);

	const selectWall = useCallback((node: Node) => {
		if (node.type === NodeType.Start || node.type === NodeType.End) {
			return;
		}
    node.setType(NodeType.Wall);
	}, []);

	const unselectWall = useCallback((node: Node) => {
		if (node.type === NodeType.Wall) {
			node.setType(NodeType.Empty); // don't reset wall because we need to keep the costs
		}
	}, []);

  const drawPath = useCallback(async (node: Node) => {
    while (node.prevNode) {
      node.setType(NodeType.Path);
      setCurrentNode(node.prevNode); // state update to trigger rerender
      node = node.prevNode;
      await new Promise((resolve) => setTimeout(resolve, 50 / speed));
    }
  }, [speed, setCurrentNode]);

	const handleNextStep = useCallback(async  () => {
    // no new nodes to find
		if (openList.isEmpty()) {
			startNode?.setType(NodeType.Start);
			onFinishSearching(false);
			return false;
		}

		let node = openList.pop();

		if (!node) {
			alert('ERROR');
      onFinishSearching(false);
			return false;
		}

		node.setType(NodeType.Visited);
    closedList.add(node!);

		for (let [index, cost] of node!.neighbours) {
			const neighbour = nodes[index];

			if ((!state.diagonals && cost === 1.4) ||
        closedList.has(neighbour) ||
				neighbour.type === NodeType.Wall)
				continue;

      let newCost = node!.gCost + cost;

			if (neighbour === endNode) {
				neighbour.setGcost(newCost);
        startNode?.setType(NodeType.Start);
				onFinishSearching(true);
        await drawPath(node);
        return false;
			}

			if (newCost < neighbour.gCost) {
				neighbour.setGcost(newCost);
				neighbour.prevNode = node;

				if (!visited.has(neighbour)) {
					neighbour.setType(NodeType.Searching);
					visited.add(neighbour);
					openList.add(neighbour);
				}
			}
		}

		let nextNode = openList.peek();
		nextNode?.setType(NodeType.Current);
		setCurrentNode(nextNode ?? null);
		return true;
	}, [state.diagonals, nodes, endNode, startNode, drawPath, onFinishSearching]);

	const handleSkipSteps = useCallback(async () => {
		while (await handleNextStep()) {
			await new Promise((resolve) => setTimeout(resolve, 100 / speed));
		}
	}, [handleNextStep, speed]);

	return {
		currentNode,
		nodes,
		resetNodes,
		selectStart,
		selectEnd,
		selectWall,
		unselectWall,
		handleNextStep,
		handleSkipSteps
	};
}