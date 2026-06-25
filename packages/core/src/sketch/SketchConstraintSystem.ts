/**
 * Sketch Constraint System
 * Central point for managing sketch constraints across Chili3D
 */

import SketchConstraintManager from './SketchConstraintManager'
import type {
  SketchState,
  SketchConstraint,
  SketchPoint,
  SketchLine,
  ConstraintSolveEvent,
  ConstraintEventListener,
} from './SketchConstraintManager'

/**
 * Global sketch constraint system
 * Manages multiple sketches and their constraints
 */
export class SketchConstraintSystem {
  private sketches: Map<string, SketchConstraintManager> = new Map()
  private globalListeners: ConstraintEventListener[] = []

  /**
   * Create or get a sketch constraint manager
   */
  getOrCreateSketch(sketchId: string): SketchConstraintManager {
    if (!this.sketches.has(sketchId)) {
      const manager = new SketchConstraintManager(sketchId)
      this.sketches.set(sketchId, manager)

      // Add global listeners to new sketches
      for (const listener of this.globalListeners) {
        manager.addEventListener(listener)
      }
    }
    return this.sketches.get(sketchId)!
  }

  /**
   * Get an existing sketch constraint manager
   */
  getSketch(sketchId: string): SketchConstraintManager | undefined {
    return this.sketches.get(sketchId)
  }

  /**
   * Initialize a sketch
   */
  async initializeSketch(sketchId: string): Promise<void> {
    const sketch = this.getOrCreateSketch(sketchId)
    await sketch.initialize()
  }

  /**
   * Remove a sketch
   */
  removeSketch(sketchId: string): void {
    const sketch = this.sketches.get(sketchId)
    if (sketch) {
      sketch.destroy()
      this.sketches.delete(sketchId)
    }
  }

  /**
   * Add a global event listener
   */
  addGlobalListener(listener: ConstraintEventListener): void {
    this.globalListeners.push(listener)
    // Add to all existing sketches
    for (const sketch of this.sketches.values()) {
      sketch.addEventListener(listener)
    }
  }

  /**
   * Remove a global event listener
   */
  removeGlobalListener(listener: ConstraintEventListener): void {
    const index = this.globalListeners.indexOf(listener)
    if (index > -1) {
      this.globalListeners.splice(index, 1)
    }
    // Remove from all sketches
    for (const sketch of this.sketches.values()) {
      sketch.removeEventListener(listener)
    }
  }

  /**
   * Get all sketches
   */
  getAllSketches(): SketchConstraintManager[] {
    return Array.from(this.sketches.values())
  }

  /**
   * Clear all sketches
   */
  clearAll(): void {
    for (const sketch of this.sketches.values()) {
      sketch.destroy()
    }
    this.sketches.clear()
    this.globalListeners = []
  }
}

// Singleton instance
let instance: SketchConstraintSystem | null = null

/**
 * Get the global sketch constraint system instance
 */
export function getSketchConstraintSystem(): SketchConstraintSystem {
  if (!instance) {
    instance = new SketchConstraintSystem()
  }
  return instance
}

/**
 * Reset the constraint system (for testing)
 */
export function resetConstraintSystem(): void {
  if (instance) {
    instance.clearAll()
  }
  instance = null
}

export default SketchConstraintSystem
