/**
 * SketchSolver Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { SketchSolver } from '../src/SketchSolver'

describe('SketchSolver', () => {
  let solver: SketchSolver

  beforeEach(async () => {
    solver = new SketchSolver()
    await solver.initialize()
  })

  describe('Points', () => {
    it('should add a point', async () => {
      const point = await solver.addPoint('p0', 0, 0)
      expect(point).toBeDefined()
      expect(point.h).toBeDefined()
    })

    it('should add multiple points', async () => {
      const p0 = await solver.addPoint('p0', 0, 0)
      const p1 = await solver.addPoint('p1', 100, 0)
      const p2 = await solver.addPoint('p2', 100, 100)

      expect(p0).toBeDefined()
      expect(p1).toBeDefined()
      expect(p2).toBeDefined()
    })

    it('should add a fixed point', async () => {
      const point = await solver.addPoint('p0', 0, 0, true)
      expect(point).toBeDefined()
    })

    it('should get point value', async () => {
      await solver.addPoint('p0', 10, 20)
      const point = solver.getPointValue('p0')
      expect(point).not.toBeNull()
      expect(point?.x).toBeCloseTo(10, 1)
      expect(point?.y).toBeCloseTo(20, 1)
    })

    it('should return null for non-existent point', () => {
      const point = solver.getPointValue('nonexistent')
      expect(point).toBeNull()
    })

    it('should get all point values', async () => {
      await solver.addPoint('p0', 0, 0)
      await solver.addPoint('p1', 100, 0)

      const points = solver.getAllPointValues()
      expect(points.length).toBe(2)
      expect(points.find((p) => p.id === 'p0')).toBeDefined()
      expect(points.find((p) => p.id === 'p1')).toBeDefined()
    })
  })

  describe('Lines', () => {
    it('should add a line', async () => {
      const p0 = await solver.addPoint('p0', 0, 0)
      const p1 = await solver.addPoint('p1', 100, 0)
      const line = await solver.addLine('line1', 'p0', 'p1')

      expect(line).toBeDefined()
      expect(line.h).toBeDefined()
    })

    it('should throw error when adding line with non-existent points', async () => {
      await expect(
        solver.addLine('line1', 'nonexistent1', 'nonexistent2')
      ).rejects.toThrow('Points not found')
    })
  })

  describe('Constraints', () => {
    beforeEach(async () => {
      await solver.addPoint('p0', 0, 0, true)
      await solver.addPoint('p1', 100, 0)
    })

    it('should add a distance constraint', async () => {
      const constraint = await solver.addDistanceConstraint('p0', 'p1', 100)
      expect(constraint).toBeDefined()
      expect(constraint.h).toBeDefined()
    })

    it('should add a coincident constraint', async () => {
      await solver.addPoint('p2', 50, 50)
      const constraint = await solver.addCoincidentConstraint('p1', 'p2')
      expect(constraint).toBeDefined()
    })

    it('should add a horizontal constraint', async () => {
      const line = await solver.addLine('line1', 'p0', 'p1')
      const constraint = await solver.addHorizontalConstraint('line1')
      expect(constraint).toBeDefined()
    })

    it('should add a vertical constraint', async () => {
      await solver.addPoint('p2', 100, 100)
      const line = await solver.addLine('line1', 'p1', 'p2')
      const constraint = await solver.addVerticalConstraint('line1')
      expect(constraint).toBeDefined()
    })

    it('should add an equal length constraint', async () => {
      await solver.addPoint('p2', 100, 100)
      await solver.addPoint('p3', 200, 100)

      const line1 = await solver.addLine('line1', 'p0', 'p1')
      const line2 = await solver.addLine('line2', 'p2', 'p3')

      const constraint = await solver.addEqualLengthConstraint('line1', 'line2')
      expect(constraint).toBeDefined()
    })
  })

  describe('Solving', () => {
    it('should solve a simple distance constraint', async () => {
      await solver.addPoint('p0', 0, 0, true)
      await solver.addPoint('p1', 100, 0)

      await solver.addDistanceConstraint('p0', 'p1', 100)

      const result = await solver.solve()
      expect(result.success).toBe(true)
      expect(result.result).toBe(0) // 0 = solved
    })

    it('should calculate degrees of freedom', async () => {
      await solver.addPoint('p0', 0, 0, true) // Fixed point
      await solver.addPoint('p1', 100, 0) // Free in 1D (y-axis)
      await solver.addPoint('p2', 100, 100) // Free in 2D

      await solver.addDistanceConstraint('p0', 'p1', 100)

      const result = await solver.solve()
      expect(result.dof).toBeGreaterThanOrEqual(0)
    })

    it('should solve a triangle', async () => {
      // Create a triangle with constraints
      await solver.addPoint('p0', 0, 0, true) // Fixed origin
      await solver.addPoint('p1', 100, 0) // Constrained by distance
      await solver.addPoint('p2', 50, 50) // Constrained by two distances

      await solver.addLine('l0', 'p0', 'p1')
      await solver.addLine('l1', 'p1', 'p2')
      await solver.addLine('l2', 'p2', 'p0')

      // Distance constraints
      await solver.addDistanceConstraint('p0', 'p1', 100) // Base = 100
      await solver.addDistanceConstraint('p1', 'p2', 100) // Side = 100
      await solver.addDistanceConstraint('p2', 'p0', 100) // Other side = 100

      const result = await solver.solve()
      expect(result).toBeDefined()
    })
  })

  describe('Statistics', () => {
    it('should count constraints', async () => {
      expect(solver.getConstraintCount()).toBe(0)

      await solver.addPoint('p0', 0, 0)
      await solver.addPoint('p1', 100, 0)
      await solver.addDistanceConstraint('p0', 'p1', 100)

      expect(solver.getConstraintCount()).toBe(1)
    })

    it('should count points', async () => {
      expect(solver.getPointCount()).toBe(0)

      await solver.addPoint('p0', 0, 0)
      await solver.addPoint('p1', 100, 0)

      expect(solver.getPointCount()).toBe(2)
    })

    it('should count lines', async () => {
      expect(solver.getLineCount()).toBe(0)

      await solver.addPoint('p0', 0, 0)
      await solver.addPoint('p1', 100, 0)
      await solver.addLine('line1', 'p0', 'p1')

      expect(solver.getLineCount()).toBe(1)
    })
  })

  describe('Clearing', () => {
    it('should clear the sketch', async () => {
      await solver.addPoint('p0', 0, 0)
      await solver.addPoint('p1', 100, 0)
      await solver.addLine('line1', 'p0', 'p1')

      expect(solver.getPointCount()).toBe(2)

      solver.clear()

      expect(solver.getPointCount()).toBe(0)
      expect(solver.getLineCount()).toBe(0)
      expect(solver.getConstraintCount()).toBe(0)
    })
  })
})
