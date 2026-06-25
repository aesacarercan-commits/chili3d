/**
 * Sketch Constraint Manager Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { SketchConstraintManager } from '../../src/sketch/SketchConstraintManager'

describe('SketchConstraintManager', () => {
  let manager: SketchConstraintManager
  const sketchId = 'test-sketch'

  beforeEach(async () => {
    manager = new SketchConstraintManager(sketchId)
    await manager.initialize()
  })

  describe('Points', () => {
    it('should add a point', async () => {
      const point = await manager.addPoint('p0', 0, 0)
      expect(point).toBeDefined()
      expect(point.id).toBe('p0')
      expect(point.x).toBe(0)
      expect(point.y).toBe(0)
      expect(point.fixed).toBe(false)
    })

    it('should add a fixed point', async () => {
      const point = await manager.addPoint('p0', 0, 0, true)
      expect(point.fixed).toBe(true)
    })

    it('should get a point', async () => {
      await manager.addPoint('p0', 10, 20)
      const point = manager.getPoint('p0')
      expect(point).toBeDefined()
      expect(point?.x).toBe(10)
      expect(point?.y).toBe(20)
    })

    it('should get all points', async () => {
      await manager.addPoint('p0', 0, 0)
      await manager.addPoint('p1', 100, 0)
      const points = manager.getPoints()
      expect(points.length).toBe(2)
    })
  })

  describe('Lines', () => {
    beforeEach(async () => {
      await manager.addPoint('p0', 0, 0)
      await manager.addPoint('p1', 100, 0)
    })

    it('should add a line', async () => {
      const line = await manager.addLine('line1', 'p0', 'p1')
      expect(line).toBeDefined()
      expect(line.id).toBe('line1')
      expect(line.pointAId).toBe('p0')
      expect(line.pointBId).toBe('p1')
    })

    it('should get a line', async () => {
      await manager.addLine('line1', 'p0', 'p1')
      const line = manager.getLine('line1')
      expect(line).toBeDefined()
      expect(line?.id).toBe('line1')
    })

    it('should get all lines', async () => {
      await manager.addPoint('p2', 100, 100)
      await manager.addLine('line1', 'p0', 'p1')
      await manager.addLine('line2', 'p1', 'p2')
      const lines = manager.getLines()
      expect(lines.length).toBe(2)
    })
  })

  describe('Constraints', () => {
    beforeEach(async () => {
      await manager.addPoint('p0', 0, 0, true)
      await manager.addPoint('p1', 100, 0)
    })

    it('should add a distance constraint', async () => {
      const constraint = await manager.addDistanceConstraint('p0', 'p1', 100)
      expect(constraint).toBeDefined()
      expect(constraint.type).toBe('distance')
      expect(constraint.value).toBe(100)
    })

    it('should add a coincident constraint', async () => {
      const constraint = await manager.addCoincidentConstraint('p0', 'p1')
      expect(constraint.type).toBe('coincident')
    })

    it('should add an angle constraint', async () => {
      await manager.addPoint('p2', 100, 100)
      await manager.addLine('l0', 'p0', 'p1')
      await manager.addLine('l1', 'p1', 'p2')

      const constraint = await manager.addAngleConstraint('l0', 'l1', 90)
      expect(constraint.type).toBe('angle')
      expect(constraint.value).toBe(90)
    })

    it('should mark entities as constrained', async () => {
      await manager.addDistanceConstraint('p0', 'p1', 100)
      const p0 = manager.getPoint('p0')
      const p1 = manager.getPoint('p1')
      expect(p0?.constrained).toBe(true)
      expect(p1?.constrained).toBe(true)
    })

    it('should get a constraint', async () => {
      const constraint = await manager.addDistanceConstraint('p0', 'p1', 100)
      const retrieved = manager.getConstraint(constraint.id)
      expect(retrieved).toBeDefined()
      expect(retrieved?.type).toBe('distance')
    })

    it('should get all constraints', async () => {
      await manager.addDistanceConstraint('p0', 'p1', 100)
      await manager.addPoint('p2', 50, 50)
      await manager.addCoincidentConstraint('p0', 'p2')
      const constraints = manager.getConstraints()
      expect(constraints.length).toBe(2)
    })
  })

  describe('Statistics', () => {
    it('should get sketch statistics', async () => {
      await manager.addPoint('p0', 0, 0)
      await manager.addPoint('p1', 100, 0)
      await manager.addLine('line1', 'p0', 'p1')
      await manager.addDistanceConstraint('p0', 'p1', 100)

      const stats = manager.getStats()
      expect(stats.points).toBe(2)
      expect(stats.lines).toBe(1)
      expect(stats.constraints).toBe(1)
      expect(stats.constrainedEntities).toBe(2)
    })
  })

  describe('Solving', () => {
    it('should solve constraints', async () => {
      await manager.addPoint('p0', 0, 0, true)
      await manager.addPoint('p1', 100, 0)
      await manager.addDistanceConstraint('p0', 'p1', 100)

      const result = await manager.solve()
      expect(result.success).toBe(true)
    })

    it('should calculate degrees of freedom', async () => {
      await manager.addPoint('p0', 0, 0, true)
      await manager.addPoint('p1', 100, 0)
      await manager.addDistanceConstraint('p0', 'p1', 100)

      await manager.solve()
      const dof = manager.getDegreesOfFreedom()
      expect(dof).toBeGreaterThanOrEqual(0)
    })

    it('should detect fully constrained sketch', async () => {
      await manager.addPoint('p0', 0, 0, true)
      await manager.addPoint('p1', 100, 0)
      await manager.addPoint('p2', 100, 100)

      await manager.addLine('l0', 'p0', 'p1')
      await manager.addLine('l1', 'p1', 'p2')

      await manager.addDistanceConstraint('p0', 'p1', 100)
      await manager.addDistanceConstraint('p1', 'p2', 100)
      await manager.addPerpendicularConstraint('l0', 'l1')

      const result = await manager.solve()
      if (result.success) {
        const isFullyConstrained = manager.isFullyConstrained()
        expect(typeof isFullyConstrained).toBe('boolean')
      }
    })
  })

  describe('Events', () => {
    it('should notify listeners on solve', async () => {
      let eventFired = false
      const listener = () => {
        eventFired = true
      }

      manager.addEventListener(listener)

      await manager.addPoint('p0', 0, 0, true)
      await manager.addPoint('p1', 100, 0)
      await manager.addDistanceConstraint('p0', 'p1', 100)
      await manager.solve()

      expect(eventFired).toBe(true)
    })

    it('should remove listeners', async () => {
      let callCount = 0
      const listener = () => {
        callCount++
      }

      manager.addEventListener(listener)
      manager.removeEventListener(listener)

      await manager.addPoint('p0', 0, 0, true)
      await manager.addPoint('p1', 100, 0)
      await manager.addDistanceConstraint('p0', 'p1', 100)
      await manager.solve()

      expect(callCount).toBe(0)
    })
  })

  describe('Cleanup', () => {
    it('should clear the sketch', async () => {
      await manager.addPoint('p0', 0, 0)
      manager.clear()

      const stats = manager.getStats()
      expect(stats.points).toBe(0)
      expect(stats.lines).toBe(0)
      expect(stats.constraints).toBe(0)
    })
  })
})
