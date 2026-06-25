/**
 * Constraint manager for integrating SolveSpace with Chili3D core
 * Manages sketch constraints and communicates with the solver
 */

import { SketchSolver } from './SketchSolver'
import type { SolvingResult, SolvedPoint } from './index'

export interface ConstraintUpdate {
  sketchId: string
  pointId: string
  x: number
  y: number
}

/**
 * Manager class for sketch constraints
 * Provides a bridge between Chili3D core and SolveSpace solver
 */
export class ConstraintManager {
  private solvers: Map<string, SketchSolver> = new Map()

  /**
   * Get or create a solver for a sketch
   */
  private getOrCreateSolver(sketchId: string): SketchSolver {
    if (!this.solvers.has(sketchId)) {
      this.solvers.set(sketchId, new SketchSolver())
    }
    return this.solvers.get(sketchId)!
  }

  /**
   * Initialize a sketch solver
   */
  async initializeSketch(sketchId: string): Promise<void> {
    const solver = this.getOrCreateSolver(sketchId)
    await solver.initialize()
  }

  /**
   * Add a point to the sketch
   */
  async addPoint(
    sketchId: string,
    pointId: string,
    x: number,
    y: number,
    fixed = false
  ): Promise<void> {
    const solver = this.getOrCreateSolver(sketchId)
    await solver.addPoint(pointId, x, y, fixed)
  }

  /**
   * Add a line to the sketch
   */
  async addLine(
    sketchId: string,
    lineId: string,
    pointAId: string,
    pointBId: string
  ): Promise<void> {
    const solver = this.getOrCreateSolver(sketchId)
    await solver.addLine(lineId, pointAId, pointBId)
  }

  /**
   * Add a distance constraint
   */
  async addDistanceConstraint(
    sketchId: string,
    pointAId: string,
    pointBId: string,
    distance: number
  ): Promise<void> {
    const solver = this.getOrCreateSolver(sketchId)
    await solver.addDistanceConstraint(pointAId, pointBId, distance)
  }

  /**
   * Add a coincident constraint
   */
  async addCoincidentConstraint(
    sketchId: string,
    pointAId: string,
    pointBId: string
  ): Promise<void> {
    const solver = this.getOrCreateSolver(sketchId)
    await solver.addCoincidentConstraint(pointAId, pointBId)
  }

  /**
   * Add an angle constraint
   */
  async addAngleConstraint(
    sketchId: string,
    lineAId: string,
    lineBId: string,
    angle: number
  ): Promise<void> {
    const solver = this.getOrCreateSolver(sketchId)
    await solver.addAngleConstraint(lineAId, lineBId, angle)
  }

  /**
   * Add a perpendicular constraint
   */
  async addPerpendicularConstraint(
    sketchId: string,
    lineAId: string,
    lineBId: string
  ): Promise<void> {
    const solver = this.getOrCreateSolver(sketchId)
    await solver.addPerpendicularConstraint(lineAId, lineBId)
  }

  /**
   * Add a parallel constraint
   */
  async addParallelConstraint(
    sketchId: string,
    lineAId: string,
    lineBId: string
  ): Promise<void> {
    const solver = this.getOrCreateSolver(sketchId)
    await solver.addParallelConstraint(lineAId, lineBId)
  }

  /**
   * Add an equal length constraint
   */
  async addEqualLengthConstraint(
    sketchId: string,
    lineAId: string,
    lineBId: string
  ): Promise<void> {
    const solver = this.getOrCreateSolver(sketchId)
    await solver.addEqualLengthConstraint(lineAId, lineBId)
  }

  /**
   * Add a horizontal constraint
   */
  async addHorizontalConstraint(
    sketchId: string,
    lineId: string
  ): Promise<void> {
    const solver = this.getOrCreateSolver(sketchId)
    await solver.addHorizontalConstraint(lineId)
  }

  /**
   * Add a vertical constraint
   */
  async addVerticalConstraint(
    sketchId: string,
    lineId: string
  ): Promise<void> {
    const solver = this.getOrCreateSolver(sketchId)
    await solver.addVerticalConstraint(lineId)
  }

  /**
   * Solve the sketch constraints
   */
  async solveSketch(sketchId: string): Promise<SolvingResult> {
    const solver = this.getOrCreateSolver(sketchId)
    return await solver.solve()
  }

  /**
   * Get updated point coordinates after solving
   */
  getUpdatedPoints(sketchId: string): SolvedPoint[] {
    const solver = this.solvers.get(sketchId)
    if (!solver) return []
    return solver.getAllPointValues()
  }

  /**
   * Get a specific point's coordinates
   */
  getPointValue(sketchId: string, pointId: string): SolvedPoint | null {
    const solver = this.solvers.get(sketchId)
    if (!solver) return null
    return solver.getPointValue(pointId)
  }

  /**
   * Clear a sketch
   */
  clearSketch(sketchId: string): void {
    const solver = this.solvers.get(sketchId)
    if (solver) {
      solver.clear()
    }
  }

  /**
   * Remove a sketch
   */
  removeSketch(sketchId: string): void {
    this.solvers.delete(sketchId)
  }

  /**
   * Get solver statistics
   */
  getStats(sketchId: string): { points: number; lines: number; constraints: number } | null {
    const solver = this.solvers.get(sketchId)
    if (!solver) return null
    return {
      points: solver.getPointCount(),
      lines: solver.getLineCount(),
      constraints: solver.getConstraintCount(),
    }
  }
}

export default ConstraintManager
