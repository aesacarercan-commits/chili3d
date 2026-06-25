/**
 * Sketch Editor Service Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { SketchEditorService } from '../../src/services/SketchEditorService'

describe('SketchEditorService', () => {
  let service: SketchEditorService

  beforeEach(async () => {
    service = new SketchEditorService()
  })

  describe('Sketch Creation', () => {
    it('should create a sketch', async () => {
      const sketch = await service.createSketch('sketch-1')
      expect(sketch).toBeDefined()
    })

    it('should set the current sketch', async () => {
      const sketch = await service.createSketch('sketch-1')
      const current = service.getCurrentSketch()
      expect(current).toBe(sketch)
    })
  })

  describe('Point Management', () => {
    beforeEach(async () => {
      await service.createSketch('sketch-1')
    })

    it('should add a point', async () => {
      const point = await service.addPoint(0, 0)
      expect(point).toBeDefined()
      expect(point?.x).toBe(0)
      expect(point?.y).toBe(0)
    })

    it('should add a fixed point', async () => {
      const point = await service.addPoint(0, 0, true)
      expect(point?.fixed).toBe(true)
    })

    it('should return null if no sketch', async () => {
      service.destroy()
      const point = await service.addPoint(0, 0)
      expect(point).toBeNull()
    })
  })

  describe('Line Management', () => {
    beforeEach(async () => {
      await service.createSketch('sketch-1')
    })

    it('should add a line', async () => {
      const p0 = await service.addPoint(0, 0)
      const p1 = await service.addPoint(100, 0)
      const line = await service.addLine(p0!.id, p1!.id)
      expect(line).toBeDefined()
    })

    it('should return null if no sketch', async () => {
      service.destroy()
      const line = await service.addLine('p0', 'p1')
      expect(line).toBeNull()
    })
  })

  describe('Selection Management', () => {
    beforeEach(async () => {
      await service.createSketch('sketch-1')
    })

    it('should select a point', () => {
      service.selectPoint('p0')
      const selected = service.getSelectedPoints()
      expect(selected).toContain('p0')
    })

    it('should select multiple points', () => {
      service.selectPoint('p0')
      service.selectPoint('p1', true)
      const selected = service.getSelectedPoints()
      expect(selected).toContain('p0')
      expect(selected).toContain('p1')
    })

    it('should clear selection by default', () => {
      service.selectPoint('p0')
      service.selectPoint('p1')
      const selected = service.getSelectedPoints()
      expect(selected).not.toContain('p0')
      expect(selected).toContain('p1')
    })

    it('should select a line', () => {
      service.selectLine('l0')
      const selected = service.getSelectedLines()
      expect(selected).toContain('l0')
    })

    it('should deselect a point', () => {
      service.selectPoint('p0', true)
      service.deselectPoint('p0')
      const selected = service.getSelectedPoints()
      expect(selected).not.toContain('p0')
    })

    it('should deselect a line', () => {
      service.selectLine('l0')
      service.deselectLine('l0')
      const selected = service.getSelectedLines()
      expect(selected).not.toContain('l0')
    })

    it('should clear all selections', () => {
      service.selectPoint('p0')
      service.selectLine('l0')
      service.clearSelection()
      expect(service.getSelectedPoints()).toHaveLength(0)
      expect(service.getSelectedLines()).toHaveLength(0)
    })
  })

  describe('Constraint Operations', () => {
    beforeEach(async () => {
      await service.createSketch('sketch-1')
    })

    it('should get sketch statistics', async () => {
      await service.addPoint(0, 0)
      await service.addPoint(100, 0)
      const stats = service.getSketchStats()
      expect(stats?.points).toBe(2)
    })

    it('should check if sketch is constrained', async () => {
      const isConstrained = service.isSketchConstrained()
      expect(typeof isConstrained).toBe('boolean')
    })

    it('should solve sketch', async () => {
      await service.addPoint(0, 0, true)
      await service.addPoint(100, 0)
      const sketch = service.getCurrentSketch()
      await sketch?.addDistanceConstraint('point-0', 'point-1', 100)
      const result = await service.solveSketch()
      expect(result).toBeDefined()
    })
  })

  describe('Cleanup', () => {
    it('should clear the sketch', async () => {
      await service.createSketch('sketch-1')
      await service.addPoint(0, 0)
      service.clear()
      const stats = service.getSketchStats()
      expect(stats?.points).toBe(0)
    })

    it('should destroy the service', async () => {
      await service.createSketch('sketch-1')
      service.destroy()
      const current = service.getCurrentSketch()
      expect(current).toBeNull()
    })
  })
})
