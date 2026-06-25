/**
 * Sketch Constraint Manager
 * Integration layer between Chili3D core and SolveSpace solver
 * Manages sketch constraints, solving, and geometry updates
 */

import type { ConstraintManager as SolveSpaceConstraintManager } from '@chili3d/solvespace'
import { ConstraintManager } from '@chili3d/solvespace'
import type { SolvedPoint } from '@chili3d/solvespace'

/**
 * Sketch geometry point
 */
export interface SketchPoint {
  id: string
  x: number
  y: number
  fixed: boolean
  constrained: boolean
}

/**
 * Sketch geometry line
 */
export interface SketchLine {
  id: string
  pointAId: string
  pointBId: string
}

/**
 * Sketch constraint
 */
export interface SketchConstraint {
  id: string
  type: string
  entities: string[]
  value?: number
  timestamp: number
}

/**
 * Sketch constraint state
 */
export interface SketchState {
  points: Map<string, SketchPoint>
  lines: Map<string, SketchLine>
  constraints: Map<string, SketchConstraint>
  solved: boolean
  lastSolveResult: any | null
}

/**
 * Constraint solve event
 */
export interface ConstraintSolveEvent {
  success: boolean
  dof: number
  nbad: number
  updates: SolvedPoint[]
}

/**
 * Listener for constraint events
 */
export type ConstraintEventListener = (event: ConstraintSolveEvent) => void

/**
 * Sketch Constraint Manager
 * Manages the constraint solving for a sketch
 */
export class SketchConstraintManager {
  private sketchId: string
  private constraintManager: SolveSpaceConstraintManager
  private state: SketchState
  private listeners: ConstraintEventListener[] = []
  private constraintIdCounter = 0

  constructor(sketchId: string) {
    this.sketchId = sketchId
    this.constraintManager = new ConstraintManager()
    this.state = {
      points: new Map(),
      lines: new Map(),
      constraints: new Map(),
      solved: false,
      lastSolveResult: null,
    }
  }

  /**
   * Initialize the constraint manager
   */
  async initialize(): Promise<void> {
    await this.constraintManager.initializeSketch(this.sketchId)
  }

  /**
   * Add a point to the sketch
   */
  async addPoint(
    id: string,
    x: number,
    y: number,
    fixed = false
  ): Promise<SketchPoint> {
    await this.constraintManager.addPoint(
      this.sketchId,
      id,
      x,
      y,
      fixed
    )

    const point: SketchPoint = {
      id,
      x,
      y,
      fixed,
      constrained: false,
    }

    this.state.points.set(id, point)
    return point
  }

  /**
   * Add a line to the sketch
   */
  async addLine(
    id: string,
    pointAId: string,
    pointBId: string
  ): Promise<SketchLine> {
    await this.constraintManager.addLine(
      this.sketchId,
      id,
      pointAId,
      pointBId
    )

    const line: SketchLine = {
      id,
      pointAId,
      pointBId,
    }

    this.state.lines.set(id, line)
    return line
  }

  /**
   * Add a distance constraint
   */
  async addDistanceConstraint(
    pointAId: string,
    pointBId: string,
    distance: number
  ): Promise<SketchConstraint> {
    await this.constraintManager.addDistanceConstraint(
      this.sketchId,
      pointAId,
      pointBId,
      distance
    )

    const constraint: SketchConstraint = {
      id: `constraint-${++this.constraintIdCounter}`,
      type: 'distance',
      entities: [pointAId, pointBId],
      value: distance,
      timestamp: Date.now(),
    }

    this.state.constraints.set(constraint.id, constraint)
    this.markConstrained([pointAId, pointBId])
    return constraint
  }

  /**
   * Add a coincident constraint
   */
  async addCoincidentConstraint(
    pointAId: string,
    pointBId: string
  ): Promise<SketchConstraint> {
    await this.constraintManager.addCoincidentConstraint(
      this.sketchId,
      pointAId,
      pointBId
    )

    const constraint: SketchConstraint = {
      id: `constraint-${++this.constraintIdCounter}`,
      type: 'coincident',
      entities: [pointAId, pointBId],
      timestamp: Date.now(),
    }

    this.state.constraints.set(constraint.id, constraint)
    this.markConstrained([pointAId, pointBId])
    return constraint
  }

  /**
   * Add an angle constraint
   */
  async addAngleConstraint(
    lineAId: string,
    lineBId: string,
    angle: number
  ): Promise<SketchConstraint> {
    await this.constraintManager.addAngleConstraint(
      this.sketchId,
      lineAId,
      lineBId,
      angle
    )

    const constraint: SketchConstraint = {
      id: `constraint-${++this.constraintIdCounter}`,
      type: 'angle',
      entities: [lineAId, lineBId],
      value: angle,
      timestamp: Date.now(),
    }

    this.state.constraints.set(constraint.id, constraint)
    this.markConstrained([lineAId, lineBId])
    return constraint
  }

  /**
   * Add a perpendicular constraint
   */
  async addPerpendicularConstraint(
    lineAId: string,
    lineBId: string
  ): Promise<SketchConstraint> {
    await this.constraintManager.addPerpendicularConstraint(
      this.sketchId,
      lineAId,
      lineBId
    )

    const constraint: SketchConstraint = {
      id: `constraint-${++this.constraintIdCounter}`,
      type: 'perpendicular',
      entities: [lineAId, lineBId],
      timestamp: Date.now(),
    }

    this.state.constraints.set(constraint.id, constraint)
    this.markConstrained([lineAId, lineBId])
    return constraint
  }

  /**
   * Add a parallel constraint
   */
  async addParallelConstraint(
    lineAId: string,
    lineBId: string
  ): Promise<SketchConstraint> {
    await this.constraintManager.addParallelConstraint(
      this.sketchId,
      lineAId,
      lineBId
    )

    const constraint: SketchConstraint = {
      id: `constraint-${++this.constraintIdCounter}`,
      type: 'parallel',
      entities: [lineAId, lineBId],
      timestamp: Date.now(),
    }

    this.state.constraints.set(constraint.id, constraint)
    this.markConstrained([lineAId, lineBId])
    return constraint
  }

  /**
   * Add an equal length constraint
   */
  async addEqualLengthConstraint(
    lineAId: string,
    lineBId: string
  ): Promise<SketchConstraint> {
    await this.constraintManager.addEqualLengthConstraint(
      this.sketchId,
      lineAId,
      lineBId
    )

    const constraint: SketchConstraint = {
      id: `constraint-${++this.constraintIdCounter}`,
      type: 'equalLength',
      entities: [lineAId, lineBId],
      timestamp: Date.now(),
    }

    this.state.constraints.set(constraint.id, constraint)
    this.markConstrained([lineAId, lineBId])
    return constraint
  }

  /**
   * Add a horizontal constraint
   */
  async addHorizontalConstraint(lineId: string): Promise<SketchConstraint> {
    await this.constraintManager.addHorizontalConstraint(
      this.sketchId,
      lineId
    )

    const constraint: SketchConstraint = {
      id: `constraint-${++this.constraintIdCounter}`,
      type: 'horizontal',
      entities: [lineId],
      timestamp: Date.now(),
    }

    this.state.constraints.set(constraint.id, constraint)
    this.markConstrained([lineId])
    return constraint
  }

  /**
   * Add a vertical constraint
   */
  async addVerticalConstraint(lineId: string): Promise<SketchConstraint> {
    await this.constraintManager.addVerticalConstraint(
      this.sketchId,
      lineId
    )

    const constraint: SketchConstraint = {
      id: `constraint-${++this.constraintIdCounter}`,
      type: 'vertical',
      entities: [lineId],
      timestamp: Date.now(),
    }

    this.state.constraints.set(constraint.id, constraint)
    this.markConstrained([lineId])
    return constraint
  }

  /**
   * Solve the sketch constraints
   */
  async solve(): Promise<ConstraintSolveEvent> {
    const result = await this.constraintManager.solveSketch(this.sketchId)
    const updates = this.constraintManager.getUpdatedPoints(this.sketchId)

    // Update sketch points with solved coordinates
    for (const update of updates) {
      const point = this.state.points.get(update.id)
      if (point) {
        point.x = update.x
        point.y = update.y
      }
    }

    this.state.solved = result.success
    this.state.lastSolveResult = result

    const event: ConstraintSolveEvent = {
      success: result.success,
      dof: result.dof,
      nbad: result.nbad,
      updates,
    }

    // Notify listeners
    this.notifyListeners(event)

    return event
  }

  /**
   * Get the current sketch state
   */
  getState(): SketchState {
    return this.state
  }

  /**
   * Get a specific point
   */
  getPoint(id: string): SketchPoint | undefined {
    return this.state.points.get(id)
  }

  /**
   * Get all points
   */
  getPoints(): SketchPoint[] {
    return Array.from(this.state.points.values())
  }

  /**
   * Get a specific line
   */
  getLine(id: string): SketchLine | undefined {
    return this.state.lines.get(id)
  }

  /**
   * Get all lines
   */
  getLines(): SketchLine[] {
    return Array.from(this.state.lines.values())
  }

  /**
   * Get a specific constraint
   */
  getConstraint(id: string): SketchConstraint | undefined {
    return this.state.constraints.get(id)
  }

  /**
   * Get all constraints
   */
  getConstraints(): SketchConstraint[] {
    return Array.from(this.state.constraints.values())
  }

  /**
   * Get constraint statistics
   */
  getStats(): {
    points: number
    lines: number
    constraints: number
    constrainedEntities: number
  } {
    const constrainedEntities = Array.from(this.state.points.values()).filter(
      (p) => p.constrained
    ).length

    return {
      points: this.state.points.size,
      lines: this.state.lines.size,
      constraints: this.state.constraints.size,
      constrainedEntities,
    }
  }

  /**
   * Get degrees of freedom
   */
  getDegreesOfFreedom(): number {
    return this.state.lastSolveResult?.dof ?? 0
  }

  /**
   * Check if sketch is fully constrained
   */
  isFullyConstrained(): boolean {
    return this.getDegreesOfFreedom() === 0 && this.state.solved
  }

  /**
   * Mark entities as constrained
   */
  private markConstrained(entityIds: string[]): void {
    for (const id of entityIds) {
      const point = this.state.points.get(id)
      if (point) {
        point.constrained = true
      }
    }
  }

  /**
   * Add an event listener
   */
  addEventListener(listener: ConstraintEventListener): void {
    this.listeners.push(listener)
  }

  /**
   * Remove an event listener
   */
  removeEventListener(listener: ConstraintEventListener): void {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(event: ConstraintSolveEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in constraint listener:', error)
      }
    }
  }

  /**
   * Clear all constraints and geometry
   */
  clear(): void {
    this.constraintManager.clearSketch(this.sketchId)
    this.state.points.clear()
    this.state.lines.clear()
    this.state.constraints.clear()
    this.state.solved = false
    this.state.lastSolveResult = null
    this.constraintIdCounter = 0
  }

  /**
   * Destroy the manager
   */
  destroy(): void {
    this.constraintManager.removeSketch(this.sketchId)
    this.clear()
    this.listeners = []
  }
}

export default SketchConstraintManager
