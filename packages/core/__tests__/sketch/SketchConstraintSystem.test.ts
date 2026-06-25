/**
 * Sketch Constraint System Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  SketchConstraintSystem,
  getSketchConstraintSystem,
  resetConstraintSystem,
} from '../../src/sketch/SketchConstraintSystem'

describe('SketchConstraintSystem', () => {
  beforeEach(() => {
    resetConstraintSystem()
  })

  afterEach(() => {
    resetConstraintSystem()
  })

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const system1 = getSketchConstraintSystem()
      const system2 = getSketchConstraintSystem()
      expect(system1).toBe(system2)
    })

    it('should create new instance after reset', () => {
      const system1 = getSketchConstraintSystem()
      resetConstraintSystem()
      const system2 = getSketchConstraintSystem()
      expect(system1).not.toBe(system2)
    })
  })

  describe('Sketch Management', () => {
    it('should create or get a sketch', async () => {
      const system = getSketchConstraintSystem()
      const sketch = system.getOrCreateSketch('sketch-1')
      expect(sketch).toBeDefined()
    })

    it('should return the same sketch on multiple calls', () => {
      const system = getSketchConstraintSystem()
      const sketch1 = system.getOrCreateSketch('sketch-1')
      const sketch2 = system.getOrCreateSketch('sketch-1')
      expect(sketch1).toBe(sketch2)
    })

    it('should initialize a sketch', async () => {
      const system = getSketchConstraintSystem()
      await system.initializeSketch('sketch-1')
      const sketch = system.getSketch('sketch-1')
      expect(sketch).toBeDefined()
    })

    it('should remove a sketch', async () => {
      const system = getSketchConstraintSystem()
      const sketch1 = system.getOrCreateSketch('sketch-1')
      system.removeSketch('sketch-1')
      const sketch2 = system.getSketch('sketch-1')
      expect(sketch2).toBeUndefined()
    })

    it('should get all sketches', () => {
      const system = getSketchConstraintSystem()
      system.getOrCreateSketch('sketch-1')
      system.getOrCreateSketch('sketch-2')
      const sketches = system.getAllSketches()
      expect(sketches.length).toBe(2)
    })
  })

  describe('Global Listeners', () => {
    it('should add a global listener', async () => {
      const system = getSketchConstraintSystem()
      let eventFired = false

      const listener = () => {
        eventFired = true
      }

      system.addGlobalListener(listener)
      const sketch = system.getOrCreateSketch('sketch-1')
      await sketch.initialize()
      await sketch.addPoint('p0', 0, 0, true)
      await sketch.addPoint('p1', 100, 0)
      await sketch.addDistanceConstraint('p0', 'p1', 100)
      await sketch.solve()

      expect(eventFired).toBe(true)
    })

    it('should remove a global listener', async () => {
      const system = getSketchConstraintSystem()
      let callCount = 0

      const listener = () => {
        callCount++
      }

      system.addGlobalListener(listener)
      system.removeGlobalListener(listener)

      const sketch = system.getOrCreateSketch('sketch-1')
      await sketch.initialize()
      await sketch.addPoint('p0', 0, 0, true)
      await sketch.addPoint('p1', 100, 0)
      await sketch.addDistanceConstraint('p0', 'p1', 100)
      await sketch.solve()

      expect(callCount).toBe(0)
    })

    it('should add listener to new sketches', async () => {
      const system = getSketchConstraintSystem()
      let eventCount = 0

      const listener = () => {
        eventCount++
      }

      system.addGlobalListener(listener)

      // Create sketch after adding listener
      const sketch = system.getOrCreateSketch('sketch-1')
      await sketch.initialize()
      await sketch.addPoint('p0', 0, 0, true)
      await sketch.addPoint('p1', 100, 0)
      await sketch.addDistanceConstraint('p0', 'p1', 100)
      await sketch.solve()

      expect(eventCount).toBe(1)
    })
  })

  describe('Cleanup', () => {
    it('should clear all sketches', async () => {
      const system = getSketchConstraintSystem()
      system.getOrCreateSketch('sketch-1')
      system.getOrCreateSketch('sketch-2')

      system.clearAll()

      const sketches = system.getAllSketches()
      expect(sketches.length).toBe(0)
    })
  })
})
