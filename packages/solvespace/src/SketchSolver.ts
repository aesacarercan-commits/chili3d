/**
 * High-level sketch solver using SolveSpace
 * Handles 2D sketch constraints and solving
 */

import { SolveSpaceWrapper } from './index'
import type { Entity, Constraint, SolveResult } from 'slvs'
import type {
  PointDefinition,
  LineDefinition,
  SolvedPoint,
  SolvingResult,
} from './index'

const GROUP_ID = 1

export class SketchSolver {
  private solver: SolveSpaceWrapper
  private points: Map<string, Entity> = new Map()
  private lines: Map<string, Entity> = new Map()
  private constraints: Constraint[] = []
  private workplane: Entity | null = null
  private group = GROUP_ID

  constructor() {
    this.solver = new SolveSpaceWrapper()
  }

  /**
   * Initialize the solver
   */
  async initialize(): Promise<void> {
    await this.solver.initialize()
    this.setupWorkplane()
  }

  /**
   * Setup the base 2D workplane
   */
  private setupWorkplane(): void {
    const slvs = this.solver.getModule()
    this.solver.clearSketch()
    this.workplane = slvs.addBase2D(this.group)
    this.points.clear()
    this.lines.clear()
    this.constraints = []
  }

  /**
   * Add a 2D point to the sketch
   */
  async addPoint(id: string, x: number, y: number, fixed = false): Promise<Entity> {
    await this.solver.initialize()
    if (!this.workplane) this.setupWorkplane()

    const slvs = this.solver.getModule()
    const point = slvs.addPoint2D(this.group, x, y, this.workplane!)
    this.points.set(id, point)

    // If point is fixed, add a constraint
    if (fixed) {
      slvs.dragged(this.group, point, this.workplane!)
    }

    return point
  }

  /**
   * Add a line connecting two points
   */
  async addLine(
    id: string,
    pointAId: string,
    pointBId: string
  ): Promise<Entity> {
    await this.solver.initialize()
    if (!this.workplane) this.setupWorkplane()

    const pointA = this.points.get(pointAId)
    const pointB = this.points.get(pointBId)

    if (!pointA || !pointB) {
      throw new Error(`Points not found: ${pointAId}, ${pointBId}`)
    }

    const slvs = this.solver.getModule()
    const line = slvs.addLine2D(this.group, pointA, pointB, this.workplane!)
    this.lines.set(id, line)

    return line
  }

  /**
   * Add a distance constraint between two points
   */
  async addDistanceConstraint(
    pointAId: string,
    pointBId: string,
    distance: number
  ): Promise<Constraint> {
    await this.solver.initialize()
    if (!this.workplane) this.setupWorkplane()

    const pointA = this.points.get(pointAId)
    const pointB = this.points.get(pointBId)

    if (!pointA || !pointB) {
      throw new Error(`Points not found for distance constraint`)
    }

    const slvs = this.solver.getModule()
    const constraint = slvs.distance(
      this.group,
      pointA,
      pointB,
      distance,
      this.workplane!
    )
    this.constraints.push(constraint)

    return constraint
  }

  /**
   * Add a coincident constraint (two points coincide)
   */
  async addCoincidentConstraint(
    pointAId: string,
    pointBId: string
  ): Promise<Constraint> {
    await this.solver.initialize()
    if (!this.workplane) this.setupWorkplane()

    const pointA = this.points.get(pointAId)
    const pointB = this.points.get(pointBId)

    if (!pointA || !pointB) {
      throw new Error(`Points not found for coincident constraint`)
    }

    const slvs = this.solver.getModule()
    const constraint = slvs.coincident(
      this.group,
      pointA,
      pointB,
      this.workplane!
    )
    this.constraints.push(constraint)

    return constraint
  }

  /**
   * Add an angle constraint between two lines
   */
  async addAngleConstraint(
    lineAId: string,
    lineBId: string,
    angle: number,
    inverse = false
  ): Promise<Constraint> {
    await this.solver.initialize()
    if (!this.workplane) this.setupWorkplane()

    const lineA = this.lines.get(lineAId)
    const lineB = this.lines.get(lineBId)

    if (!lineA || !lineB) {
      throw new Error(`Lines not found for angle constraint`)
    }

    const slvs = this.solver.getModule()
    const constraint = slvs.angle(
      this.group,
      lineA,
      lineB,
      angle,
      this.workplane!,
      inverse
    )
    this.constraints.push(constraint)

    return constraint
  }

  /**
   * Add a perpendicular constraint between two lines
   */
  async addPerpendicularConstraint(
    lineAId: string,
    lineBId: string,
    inverse = false
  ): Promise<Constraint> {
    await this.solver.initialize()
    if (!this.workplane) this.setupWorkplane()

    const lineA = this.lines.get(lineAId)
    const lineB = this.lines.get(lineBId)

    if (!lineA || !lineB) {
      throw new Error(`Lines not found for perpendicular constraint`)
    }

    const slvs = this.solver.getModule()
    const constraint = slvs.perpendicular(
      this.group,
      lineA,
      lineB,
      this.workplane!,
      inverse
    )
    this.constraints.push(constraint)

    return constraint
  }

  /**
   * Add a parallel constraint between two lines
   */
  async addParallelConstraint(
    lineAId: string,
    lineBId: string
  ): Promise<Constraint> {
    await this.solver.initialize()
    if (!this.workplane) this.setupWorkplane()

    const lineA = this.lines.get(lineAId)
    const lineB = this.lines.get(lineBId)

    if (!lineA || !lineB) {
      throw new Error(`Lines not found for parallel constraint`)
    }

    const slvs = this.solver.getModule()
    const constraint = slvs.parallel(
      this.group,
      lineA,
      lineB,
      this.workplane!
    )
    this.constraints.push(constraint)

    return constraint
  }

  /**
   * Add equal length constraint for two lines
   */
  async addEqualLengthConstraint(
    lineAId: string,
    lineBId: string
  ): Promise<Constraint> {
    await this.solver.initialize()
    if (!this.workplane) this.setupWorkplane()

    const lineA = this.lines.get(lineAId)
    const lineB = this.lines.get(lineBId)

    if (!lineA || !lineB) {
      throw new Error(`Lines not found for equal length constraint`)
    }

    const slvs = this.solver.getModule()
    const constraint = slvs.equal(
      this.group,
      lineA,
      lineB,
      this.workplane!
    )
    this.constraints.push(constraint)

    return constraint
  }

  /**
   * Add a horizontal constraint to a line
   */
  async addHorizontalConstraint(lineId: string): Promise<Constraint> {
    await this.solver.initialize()
    if (!this.workplane) this.setupWorkplane()

    const line = this.lines.get(lineId)
    if (!line) {
      throw new Error(`Line not found for horizontal constraint`)
    }

    const slvs = this.solver.getModule()
    const constraint = slvs.horizontal(
      this.group,
      line,
      this.workplane!,
      slvs.E_NONE
    )
    this.constraints.push(constraint)

    return constraint
  }

  /**
   * Add a vertical constraint to a line
   */
  async addVerticalConstraint(lineId: string): Promise<Constraint> {
    await this.solver.initialize()
    if (!this.workplane) this.setupWorkplane()

    const line = this.lines.get(lineId)
    if (!line) {
      throw new Error(`Line not found for vertical constraint`)
    }

    const slvs = this.solver.getModule()
    const constraint = slvs.vertical(
      this.group,
      line,
      this.workplane!,
      slvs.E_NONE
    )
    this.constraints.push(constraint)

    return constraint
  }

  /**
   * Add a symmetric constraint
   */
  async addSymmetricConstraint(
    pointAId: string,
    pointBId: string,
    lineId: string
  ): Promise<Constraint> {
    await this.solver.initialize()
    if (!this.workplane) this.setupWorkplane()

    const pointA = this.points.get(pointAId)
    const pointB = this.points.get(pointBId)
    const line = this.lines.get(lineId)

    if (!pointA || !pointB || !line) {
      throw new Error(`Entities not found for symmetric constraint`)
    }

    const slvs = this.solver.getModule()
    const constraint = slvs.symmetric(
      this.group,
      pointA,
      pointB,
      line
    )
    this.constraints.push(constraint)

    return constraint
  }

  /**
   * Solve the current sketch
   */
  async solve(): Promise<SolvingResult> {
    await this.solver.initialize()
    if (!this.workplane) this.setupWorkplane()

    const slvs = this.solver.getModule()
    const result: SolveResult = slvs.solveSketch(this.group, true)

    return {
      success: result.result === 0,
      result: result.result,
      dof: result.dof,
      nbad: result.nbad,
      bad: result.bad,
    }
  }

  /**
   * Get the solved coordinates of a point
   */
  getPointValue(id: string): SolvedPoint | null {
    const point = this.points.get(id)
    if (!point) return null

    const slvs = this.solver.getModule()
    const x = slvs.getParamValue(point.param[0])
    const y = slvs.getParamValue(point.param[1])

    return { id, x, y }
  }

  /**
   * Get all solved point coordinates
   */
  getAllPointValues(): SolvedPoint[] {
    const slvs = this.solver.getModule()
    const results: SolvedPoint[] = []

    for (const [id, point] of this.points.entries()) {
      const x = slvs.getParamValue(point.param[0])
      const y = slvs.getParamValue(point.param[1])
      results.push({ id, x, y })
    }

    return results
  }

  /**
   * Set a parameter value
   */
  setParamValue(paramHandle: number, value: number): void {
    const slvs = this.solver.getModule()
    slvs.setParamValue(paramHandle, value)
  }

  /**
   * Get the number of constraints
   */
  getConstraintCount(): number {
    return this.constraints.length
  }

  /**
   * Get the number of points
   */
  getPointCount(): number {
    return this.points.size
  }

  /**
   * Get the number of lines
   */
  getLineCount(): number {
    return this.lines.size
  }

  /**
   * Clear all data and reset solver
   */
  clear(): void {
    this.solver.clearSketch()
    this.points.clear()
    this.lines.clear()
    this.constraints = []
    this.workplane = null
  }
}

export default SketchSolver
