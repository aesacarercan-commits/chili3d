/**
 * SolveSpace wrapper module for constraint solving
 * Provides a TypeScript interface to the SolveSpace geometric constraint solver
 */

import solvespace from 'slvs'
import type { SlvsModule, Entity, Constraint, SolveResult } from 'slvs'

export type { SlvsModule, Entity, Constraint, SolveResult, Vector, Quaternion } from 'slvs'

/**
 * Main wrapper class for SolveSpace solver
 * Handles initialization and constraint solving operations
 */
export class SolveSpaceWrapper {
  private slvs: SlvsModule | null = null
  private initialized = false

  /**
   * Initialize the SolveSpace module
   * Must be called before any solving operations
   */
  async initialize(): Promise<void> {
    if (this.initialized) return
    try {
      this.slvs = await solvespace()
      this.initialized = true
    } catch (error) {
      throw new Error(`Failed to initialize SolveSpace: ${error}`)
    }
  }

  /**
   * Get the underlying SlvsModule instance
   * @throws Error if not initialized
   */
  getModule(): SlvsModule {
    if (!this.slvs) {
      throw new Error('SolveSpace not initialized. Call initialize() first.')
    }
    return this.slvs
  }

  /**
   * Check if the solver is initialized
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Clear the current sketch
   */
  clearSketch(): void {
    if (this.slvs) {
      this.slvs.clearSketch()
    }
  }
}

/**
 * Constraint definition interface
 */
export interface ConstraintDefinition {
  type: string
  entities: string[]
  value?: number
  workplane?: Entity
  other?: boolean
  other2?: boolean
}

/**
 * Point definition for sketch
 */
export interface PointDefinition {
  id: string
  x: number
  y: number
  fixed?: boolean
}

/**
 * Line definition for sketch
 */
export interface LineDefinition {
  id: string
  pointA: string
  pointB: string
}

/**
 * Solved point result with coordinates
 */
export interface SolvedPoint {
  id: string
  x: number
  y: number
}

/**
 * Constraint solving result
 */
export interface SolvingResult {
  success: boolean
  result: number
  dof: number // Degrees of freedom
  nbad: number // Number of bad constraints
  bad: Uint32Array // Bad constraint indices
}

export default SolveSpaceWrapper
