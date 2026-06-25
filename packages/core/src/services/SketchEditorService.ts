/**
 * Sketch Editor Service
 * Integrates constraint system with sketch editing workflow
 */

import SketchConstraintManager from '../sketch/SketchConstraintManager'
import type { SketchPoint, SketchLine } from '../sketch/SketchConstraintManager'

/**
 * Sketch editor service for managing sketch editing operations
 */
export class SketchEditorService {
  private currentSketch: SketchConstraintManager | null = null
  private selectedPoints: Set<string> = new Set()
  private selectedLines: Set<string> = new Set()

  /**
   * Create a new sketch
   */
  async createSketch(sketchId: string): Promise<SketchConstraintManager> {
    const sketch = new SketchConstraintManager(sketchId)
    await sketch.initialize()
    this.currentSketch = sketch
    this.clearSelection()
    return sketch
  }

  /**
   * Get the current sketch
   */
  getCurrentSketch(): SketchConstraintManager | null {
    return this.currentSketch
  }

  /**
   * Set the current sketch
   */
  setCurrentSketch(sketch: SketchConstraintManager): void {
    this.currentSketch = sketch
    this.clearSelection()
  }

  /**
   * Add a point to the current sketch
   */
  async addPoint(x: number, y: number, fixed = false): Promise<SketchPoint | null> {
    if (!this.currentSketch) return null
    const id = `point-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    return await this.currentSketch.addPoint(id, x, y, fixed)
  }

  /**
   * Add a line to the current sketch
   */
  async addLine(pointAId: string, pointBId: string): Promise<SketchLine | null> {
    if (!this.currentSketch) return null
    const id = `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    return await this.currentSketch.addLine(id, pointAId, pointBId)
  }

  /**
   * Select a point
   */
  selectPoint(pointId: string, multi = false): void {
    if (!multi) {
      this.selectedPoints.clear()
      this.selectedLines.clear()
    }
    this.selectedPoints.add(pointId)
  }

  /**
   * Select a line
   */
  selectLine(lineId: string, multi = false): void {
    if (!multi) {
      this.selectedPoints.clear()
      this.selectedLines.clear()
    }
    this.selectedLines.add(lineId)
  }

  /**
   * Deselect a point
   */
  deselectPoint(pointId: string): void {
    this.selectedPoints.delete(pointId)
  }

  /**
   * Deselect a line
   */
  deselectLine(lineId: string): void {
    this.selectedLines.delete(lineId)
  }

  /**
   * Clear all selections
   */
  clearSelection(): void {
    this.selectedPoints.clear()
    this.selectedLines.clear()
  }

  /**
   * Get selected points
   */
  getSelectedPoints(): string[] {
    return Array.from(this.selectedPoints)
  }

  /**
   * Get selected lines
   */
  getSelectedLines(): string[] {
    return Array.from(this.selectedLines)
  }

  /**
   * Solve the current sketch
   */
  async solveSketch() {
    if (!this.currentSketch) return null
    return await this.currentSketch.solve()
  }

  /**
   * Get sketch statistics
   */
  getSketchStats() {
    if (!this.currentSketch) return null
    return this.currentSketch.getStats()
  }

  /**
   * Check if sketch is fully constrained
   */
  isSketchConstrained(): boolean {
    if (!this.currentSketch) return false
    return this.currentSketch.isFullyConstrained()
  }

  /**
   * Add a constraint listener
   */
  addEventListener(listener: (event: any) => void): void {
    if (this.currentSketch) {
      this.currentSketch.addEventListener(listener)
    }
  }

  /**
   * Clear the current sketch
   */
  clear(): void {
    if (this.currentSketch) {
      this.currentSketch.clear()
      this.clearSelection()
    }
  }

  /**
   * Destroy the sketch editor
   */
  destroy(): void {
    if (this.currentSketch) {
      this.currentSketch.destroy()
      this.currentSketch = null
    }
    this.clearSelection()
  }
}

export default SketchEditorService
