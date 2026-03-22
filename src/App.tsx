import React, { useState, useCallback, useEffect } from 'react';
import Square from './Square';
import './App.css';
import useAStar from './useAStar';
import { Node, NodeType } from './node';

export interface State {
  operation: number;
  diagonals: boolean;
  debug: boolean;
}

enum Operation {
  SelectStart,
  SelectEnd,
  SelectWalls,
  FindPath,
  PathFound,
  PathNotFound,
}

const Headers = new Map([
  [Operation.SelectStart, 'Select start position'],
  [Operation.SelectEnd, 'Select end position'],
  [Operation.SelectWalls, 'Draw walls'],
  [Operation.FindPath, 'Calculating Path'],
  [Operation.PathFound, 'Path Found'],
  [Operation.PathNotFound, 'No Possible Path'],
])

function App() {
  const [gridSize, setGridSize] = useState<number>(10);
  const [speed, setSpeed] = useState<number>(1);
  const [state, setState] = useState<State>({
    operation: Operation.SelectStart,
    diagonals: false,
    debug: false,
  });
  const [wallCount, setWallCount] = useState<number>(0);

  const onFinishSearching = useCallback((pathFound: boolean) => {
    setState((prev) => ({ ...prev, operation: pathFound ? Operation.PathFound : Operation.PathNotFound }));
  }, [setState]);

  const {
    currentNode,
    nodes,
    selectStart,
    selectEnd,
    selectWall,
    unselectWall,
    resetNodes,
    handleNextStep,
    handleSkipSteps
  } = useAStar({ state, gridSize, speed, onFinishSearching });

  const handleNext = useCallback(() => {
    setState((prev) => ({ ...prev, operation: Operation.FindPath }));
    handleNextStep();
  }, [setState, handleNextStep])

  const handleSkip = useCallback(() => {
    setState((prev) => ({ ...prev, operation: Operation.FindPath }));
    handleSkipSteps();
  }, [setState, handleSkipSteps]);

  const handleReset = useCallback(() => {
    setWallCount(0);
    resetNodes();
    setState((prev) => ({ ...prev, operation: Operation.SelectStart }));
  }, [resetNodes, setState, setWallCount]);

  const handleSelectStart = useCallback((node: Node, isLeftClick) => {
    if (isLeftClick) {
      selectStart(node);
      setState((prev) => ({ ...prev, operation: Operation.SelectEnd }));
    }
  }, [selectStart, setState]);

  const handleSelectEnd = useCallback((node: Node, isLeftClick) => {
    if (isLeftClick) {
      if (node.type === NodeType.Empty) {
        selectEnd(node);
        setState((prev) => ({ ...prev, operation: Operation.SelectWalls }));
      }
    } else if (node.type === NodeType.Start) {
      selectStart(null);
      setState((prev) => ({ ...prev, operation: Operation.SelectStart }));
    }
  }, [selectStart, selectEnd, setState]);

  const handleSelectWall = useCallback((node: Node, isLeftClick: boolean) => {
    if (isLeftClick) {
      if (node.type === NodeType.Empty) {
        selectWall(node);
        setWallCount((prev) => prev + 1); // trick react into rerendering by updating state
      }
    } else if (node.type === NodeType.End) {
      selectEnd(null);
      setState((prev) => ({ ...prev, operation: Operation.SelectEnd }));
    } else if (node.type === NodeType.Wall) {
      unselectWall(node);
      setWallCount((prev) => prev - 1);
    }
  }, [selectWall, unselectWall, selectEnd, setState, setWallCount]);

  const handleClickSquare = useCallback((node: Node, isLeftClick: boolean) => {
    switch (state.operation) {
      case Operation.SelectStart:
        handleSelectStart(node, isLeftClick);
        break;

      case Operation.SelectEnd:
        handleSelectEnd(node, isLeftClick);
        break;

      case Operation.SelectWalls:
        handleSelectWall(node, isLeftClick);
        break;
    }
  }, [state, handleSelectStart, handleSelectEnd, handleSelectWall]);

  useEffect(handleReset, [gridSize, handleReset]);

  return (
    <div className="app">
      <h2 className='header'>{Headers.get(state.operation)}</h2>
      <p
        style={{
          display: state.debug ? 'block' : 'none',
          textAlign: "center",
          gridColumn: 1,
          gridRow: 1
        }}
      >{`Position: ${currentNode?.x},${currentNode?.y} FCost: ${currentNode?.fCost.toFixed(
        2
      )} Walls: ${wallCount}`}
      </p>
      <div
        className="menu-bar"
      >
        <div className='menu-bar-buttons'>
          <button className="menu-bar-button" onClick={() => handleReset()}>Reset</button>
          <button
            className="menu-bar-button"
            disabled={
              state.operation !== Operation.SelectWalls &&
              state.operation !== Operation.FindPath
            }
            onClick={() => handleNext()}
          >
            {state.operation <= Operation.SelectWalls ? 'Start' : 'Next'}
          </button>
          <button
            className="menu-bar-button"
            disabled={
              state.operation !== Operation.SelectWalls &&
              state.operation !== Operation.FindPath
            }
            onClick={() => handleSkip()}
          >
            Run
          </button>
        </div>
        <div>
          <div className="menu-bar-option">
            <label>Grid Size</label>
            <select className="menu-bar-option-input" onChange={(e) => setGridSize(Number(e.target.value))}>
              <option value="10">10x10</option>
              <option value="15">15x15</option>
              <option value="20">20x20</option>
            </select>
          </div>
          <div className="menu-bar-option">
            <label>Speed</label>
            <input
              className='menu-bar-option-input'
              type="number"
              value={speed}
              onChange={(e) => {
                let num = Number(e.target.value);

                if (num < 1) {
                  num = 1;
                }

                if (num > 10) {
                  num = 10;
                }

                setSpeed(num);
              }}
            />
          </div>
          <div className="menu-bar-option">
            <label>Diagonals</label>
            <input
              type="checkbox"
              checked={state.diagonals}
              onChange={(e) =>
                setState((prev) => ({ ...prev, diagonals: e.target.checked }))
              }
            />
          </div>
          <div className="menu-bar-option">
            <label>Debug</label>
            <input
              type="checkbox"
              checked={state.debug}
              onChange={(e) =>
                setState((prev) => ({ ...prev, debug: e.target.checked }))
              }
            />
          </div>
        </div>
      </div>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, auto)`,
        }}
      >
        {nodes.map((node) => (
          <Square
            key={node.key()}
            node={node}
            debug={state.debug}
            onClick={handleClickSquare}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
