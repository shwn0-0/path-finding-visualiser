export enum NodeType {
  Current,
  Empty,
  End,
  Path,
  Searching,
  Start,
  Visited,
  Wall,
}

export class Node {
  x: number;
  y: number;
  fCost: number;
  hCost: number;
  gCost: number;
  type: NodeType;
  neighbours: [number, number][];
  prevNode: Node | undefined;

  constructor(x: number, y: number, gridSize: number) {
    this.x = x;
    this.y = y;
    this.type = NodeType.Empty;
    this.fCost = Number.MAX_VALUE;
    this.hCost = 0;
    this.gCost = Number.MAX_VALUE;
    this.neighbours = Node.getNeighbours(x, y, gridSize);
  }

  calculateFCost() {
    this.fCost = this.hCost + this.gCost;
  }

  calculateHCost(endNode: Node) {
    this.hCost = Math.abs(this.x - endNode.x) + Math.abs(this.y - endNode.y);
  }

  setGcost(gCost: number) {
    this.gCost = gCost;
    this.calculateFCost();
  }

  index(gridSize: number): number {
    return Node.getIndex(this.x, this.y, gridSize);
  }

  key(): string {
    return `${this.x},${this.y}`;
  }

  reset(gridSize: number) {
    this.fCost = Number.MAX_VALUE;
    this.hCost = 0;
    this.gCost = Number.MAX_VALUE;
    this.prevNode = undefined;
    this.type = NodeType.Empty;
    this.neighbours = Node.getNeighbours(this.x, this.y, gridSize);
  }

  setType(type: NodeType) {
    this.type = type;
  }

  private static getIndex(x: number, y: number, gridSize: number): number {
    return x * gridSize + y;
  }

  private static getNeighbours(
    x: number,
    y: number,
    gridSize: number
  ) {
    const neighbours: [number, number][] = [];

    // left
    if (y > 0) {
      neighbours.push([Node.getIndex(x, y - 1, gridSize), 1]);
    }

    // right
    if (y < gridSize - 1) {
      neighbours.push([Node.getIndex(x, y + 1, gridSize), 1]);
    }

    // top
    if (x > 0) {
      neighbours.push([Node.getIndex(x - 1, y, gridSize), 1]);

      // left top
      if (y > 0) {
        neighbours.push([Node.getIndex(x - 1, y - 1, gridSize), 1.4]);
      }

      // right top
      if (y < gridSize - 1) {
        neighbours.push([Node.getIndex(x - 1, y + 1, gridSize), 1.4]);
      }
    }

    // bottom
    if (x < gridSize - 1) {
      neighbours.push([Node.getIndex(x + 1, y, gridSize), 1]);

      // left bottom
      if (y > 0) {
        neighbours.push([Node.getIndex(x + 1, y - 1, gridSize), 1.4]);
      }

      // right bottom
      if (y < gridSize - 1) {
        neighbours.push([Node.getIndex(x + 1, y + 1, gridSize), 1.4]);
      }
    }

    return neighbours;
  }
}
