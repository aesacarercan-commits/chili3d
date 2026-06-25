# @chili3d/solvespace

SolveSpace geometric constraint solver integration for Chili3D.

This package provides TypeScript bindings and utilities for integrating SolveSpace's powerful 2D/3D constraint solver into Chili3D.

## Features

- **Constraint Solving**: 2D/3D geometric constraint solving using SolveSpace engine
- **Sketch Support**: Create and solve parametric sketches
- **Constraint Types**: Distance, angle, perpendicular, parallel, coincident, and more
- **TypeScript Support**: Full TypeScript definitions and type safety
- **Integration Ready**: Seamless integration with Chili3D core

## Installation

This package is installed as part of the Chili3D workspace:

```bash
npm install
```

## Usage

### Basic Sketch Solving

```typescript
import { SketchSolver } from '@chili3d/solvespace'

// Create a solver instance
const solver = new SketchSolver()
await solver.initialize()

// Add points
await solver.addPoint('p0', 0, 0, true) // Fixed point
await solver.addPoint('p1', 100, 0)
await solver.addPoint('p2', 100, 100)

// Add lines
await solver.addLine('line1', 'p0', 'p1')
await solver.addLine('line2', 'p1', 'p2')

// Add constraints
await solver.addDistanceConstraint('p0', 'p1', 100)
await solver.addPerpendicularConstraint('line1', 'line2')

// Solve
const result = await solver.solve()

if (result.success) {
  const p2 = solver.getPointValue('p2')
  console.log(`Point p2: (${p2?.x}, ${p2?.y})`)
} else {
  console.error('Solving failed:', result.result)
}
```

### Using ConstraintManager

```typescript
import { ConstraintManager } from '@chili3d/solvespace'

const manager = new ConstraintManager()

const sketchId = 'sketch-1'
await manager.initializeSketch(sketchId)

// Add geometry
await manager.addPoint(sketchId, 'p0', 0, 0, true)
await manager.addPoint(sketchId, 'p1', 100, 0)

// Add constraints
await manager.addDistanceConstraint(sketchId, 'p0', 'p1', 100)

// Solve
const result = await manager.solveSketch(sketchId)
const updates = manager.getUpdatedPoints(sketchId)
```

## API Reference

### SolveSpaceWrapper

Low-level wrapper around the SolveSpace module.

```typescript
await wrapper.initialize() // Initialize the solver
wrapper.getModule() // Get the underlying SlvsModule
wrapper.isInitialized() // Check if initialized
wrapper.clearSketch() // Clear the sketch
```

### SketchSolver

High-level 2D sketch solver.

#### Points and Lines

```typescript
await solver.addPoint(id, x, y, fixed?)
await solver.addLine(id, pointAId, pointBId)
```

#### Constraints

```typescript
await solver.addDistanceConstraint(pointAId, pointBId, distance)
await solver.addCoincidentConstraint(pointAId, pointBId)
await solver.addAngleConstraint(lineAId, lineBId, angle, inverse?)
await solver.addPerpendicularConstraint(lineAId, lineBId, inverse?)
await solver.addParallelConstraint(lineAId, lineBId)
await solver.addEqualLengthConstraint(lineAId, lineBId)
await solver.addHorizontalConstraint(lineId)
await solver.addVerticalConstraint(lineId)
await solver.addSymmetricConstraint(pointAId, pointBId, lineId)
```

#### Solving

```typescript
const result = await solver.solve()
const point = solver.getPointValue(pointId)
const allPoints = solver.getAllPointValues()
```

### ConstraintManager

Manages multiple sketches and provides a unified interface.

```typescript
await manager.initializeSketch(sketchId)
await manager.addPoint(sketchId, pointId, x, y, fixed?)
await manager.addDistanceConstraint(sketchId, pointAId, pointBId, distance)
const result = await manager.solveSketch(sketchId)
const updates = manager.getUpdatedPoints(sketchId)
manager.getStats(sketchId)
```

## Constraint Types

Supported constraint types in SolveSpace:

- **Distance**: Set the distance between two points
- **Angle**: Set the angle between two lines
- **Perpendicular**: Make two lines perpendicular
- **Parallel**: Make two lines parallel
- **Coincident**: Make two points coincident
- **Equal Length**: Make two lines equal in length
- **Horizontal**: Make a line horizontal
- **Vertical**: Make a line vertical
- **Symmetric**: Make two points symmetric about a line
- **Fixed Point**: Fix a point's position (degrees of freedom = 0)

## Integration with Chili3D

This package is designed to be integrated with Chili3D's sketch system:

1. **Sketch Editor**: Use `SketchSolver` to validate constraints while editing
2. **Profile Generation**: Generate 2D profiles with parametric constraints
3. **3D Operations**: Use solved sketches for extrusions and other operations
4. **Plugin System**: Create plugins that use constraint-based geometry

## Examples

### Rectangle with Constraints

```typescript
const solver = new SketchSolver()
await solver.initialize()

// Create rectangle corners
await solver.addPoint('p0', 0, 0, true)
await solver.addPoint('p1', 100, 0)
await solver.addPoint('p2', 100, 50)
await solver.addPoint('p3', 0, 50)

// Create lines
await solver.addLine('l0', 'p0', 'p1')
await solver.addLine('l1', 'p1', 'p2')
await solver.addLine('l2', 'p2', 'p3')
await solver.addLine('l3', 'p3', 'p0')

// Add constraints
await solver.addDistanceConstraint('p0', 'p1', 100) // Width
await solver.addDistanceConstraint('p1', 'p2', 50)  // Height
await solver.addHorizontalConstraint('l0')
await solver.addVerticalConstraint('l1')

const result = await solver.solve()
```

### Circle with Center Constraint

```typescript
const solver = new SketchSolver()
await solver.initialize()

// Create center point
await solver.addPoint('center', 50, 50, true)

// Create point on circle
await solver.addPoint('circlePoint', 100, 50)

// The distance between center and circlePoint defines the radius
await solver.addDistanceConstraint('center', 'circlePoint', 50)

const result = await solver.solve()
```

## License

GNU Affero General Public License v3.0 (AGPL-3.0)

SolveSpace is licensed under GPL v3. See SolveSpace documentation for details.
