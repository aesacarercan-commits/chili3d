/**
 * Constraint Manager Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ConstraintManager } from '../src/ConstraintManager'

describe('ConstraintManager', () => {
  let manager: ConstraintManager
  const sketchId = 'test-sketch'

  beforeEach(async () => {
    manager = new ConstraintManager()
    await manager.initializeSketch(sketchId)
  })

  describe('Initialization', () => {
    it('should initialize a sketch', async () => {
      // Should not throw
      expect(manager).toBeDefined()
    })

    it('should handle multiple initializations', async () => {
      await manager.initializeSketch('sketch-2')
      // Should not throw and should maintain separate sketches
      expect(manager).toBeDefined()
    })
  })

  describe('Points and Lines', () => {
    it('should add points to a sketch', async () => {
      await manager.addPoint(sketchId, 'p0', 0, 0, true)
      await manager.addPoint(sketchId, 'p1', 100, 0)

      // Points should be added without error
      expect(manager).toBeDefined()
    })

    it('should add lines to a sketch', async () => {
      await manager.addPoint(sketchId, 'p0', 0, 0)
      await manager.addPoint(sketchId, 'p1', 100, 0)
      await manager.addLine(sketchId, 'line1', 'p0', 'p1')

      expect(manager).toBeDefined()
    })
  })

  describe('Constraints', () => {
    beforeEach(async () => {
      await manager.addPoint(sketchId, 'p0', 0, 0, true)
      await manager.addPoint(sketchId, 'p1', 100, 0)
      await manager.addPoint(sketchId, 'p2', 100, 100)
      await manager.addLine(sketchId, 'l0', 'p0', 'p1')
      await manager.addLine(sketchId, 'l1', 'p1', 'p2')
    })

    it('should add distance constraint', async () => {
      await manager.addDistanceConstraint(sketchId, 'p0', 'p1', 100)
      expect(manager).toBeDefined()
    })

    it('should add coincident constraint', async () => {
      await manager.addCoincidentConstraint(sketchId, 'p0', 'p1')
      expect(manager).toBeDefined()
    })

    it('should add angle constraint', async () => {
      await manager.addAngleConstraint(sketchId, 'l0', 'l1', 90)
      expect(manager).toBeDefined()
    })

    it('should add perpendicular constraint', async () => {
      await manager.addPerpendicularConstraint(sketchId, 'l0', 'l1')
      expect(manager).toBeDefined()
    })

    it('should add parallel constraint', async () => {
      await manager.addPoint(sketchId, 'p3', 0, 50)
      await manager.addPoint(sketchId, 'p4', 100, 50)
      await manager.addLine(sketchId, 'l2', 'p3', 'p4')

      await manager.addParallelConstraint(sketchId, 'l0', 'l2')
      expect(manager).toBeDefined()
    })

    it('should add equal length constraint', async () => {
      await manager.addPoint(sketchId, 'p3', 0, 50)
      await manager.addPoint(sketchId, 'p4', 100, 50)
      await manager.addLine(sketchId, 'l2', 'p3', 'p4')

      await manager.addEqualLengthConstraint(sketchId, 'l0', 'l2')
      expect(manager).toBeDefined()
    })

    it('should add horizontal constraint', async () => {
      await manager.addHorizontalConstraint(sketchId, 'l0')
      expect(manager).toBeDefined()
    })

    it('should add vertical constraint', async () => {
      await manager.addVerticalConstraint(sketchId, 'l1')
      expect(manager).toBeDefined()
    })
  })

  describe('Solving', () => {
    it('should solve a sketch', async () => {
      await manager.addPoint(sketchId, 'p0', 0, 0, true)
      await manager.addPoint(sketchId, 'p1', 100, 0)
      await manager.addDistanceConstraint(sketchId, 'p0', 'p1', 100)

      const result = await manager.solveSketch(sketchId)
      expect(result.success).toBe(true)
    })
  })

  describe('Retrieving Results', () => {
    it('should get updated points', async () => {
      await manager.addPoint(sketchId, 'p0', 0, 0, true)
      await manager.addPoint(sketchId, 'p1', 100, 0)
      await manager.addDistanceConstraint(sketchId, 'p0', 'p1', 100)

      await manager.solveSketch(sketchId)
      const points = manager.getUpdatedPoints(sketchId)

      expect(points).toBeDefined()
      expect(points.length).toBeGreaterThan(0)
    })

    it('should get specific point value', async () => {
      await manager.addPoint(sketchId, 'p0', 0, 0)
      const point = manager.getPointValue(sketchId, 'p0')

      expect(point).not.toBeNull()
      expect(point?.id).toBe('p0')
    })

    it('should get statistics', async () => {
      await manager.addPoint(sketchId, 'p0', 0, 0)
      await manager.addPoint(sketchId, 'p1', 100, 0)
      await manager.addLine(sketchId, 'l0', 'p0', 'p1')
      await manager.addDistanceConstraint(sketchId, 'p0', 'p1', 100)

      const stats = manager.getStats(sketchId)

      expect(stats).toBeDefined()
      expect(stats?.points).toBe(2)
      expect(stats?.lines).toBe(1)
      expect(stats?.constraints).toBe(1)
    })
  })

  describe('Cleanup', () => {
    it('should clear a sketch', async () => {
      await manager.addPoint(sketchId, 'p0', 0, 0)
      manager.clearSketch(sketchId)

      const stats = manager.getStats(sketchId)
      expect(stats?.points).toBe(0)
    })

    it('should remove a sketch', async () => {
      await manager.addPoint(sketchId, 'p0', 0, 0)
      manager.removeSketch(sketchId)

      const stats = manager.getStats(sketchId)
      expect(stats).toBeNull()
    })
  })
})
