/**
 * SolveSpace Wrapper Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { SolveSpaceWrapper } from '../src/index'

describe('SolveSpaceWrapper', () => {
  let wrapper: SolveSpaceWrapper

  beforeEach(() => {
    wrapper = new SolveSpaceWrapper()
  })

  it('should initialize successfully', async () => {
    expect(wrapper.isInitialized()).toBe(false)
    await wrapper.initialize()
    expect(wrapper.isInitialized()).toBe(true)
  })

  it('should not reinitialize if already initialized', async () => {
    await wrapper.initialize()
    const module1 = wrapper.getModule()
    await wrapper.initialize()
    const module2 = wrapper.getModule()
    expect(module1).toBe(module2)
  })

  it('should throw error if getModule called before initialize', () => {
    expect(() => wrapper.getModule()).toThrow(
      'SolveSpace not initialized'
    )
  })

  it('should get the module after initialization', async () => {
    await wrapper.initialize()
    const module = wrapper.getModule()
    expect(module).toBeDefined()
    expect(module).toHaveProperty('clearSketch')
    expect(module).toHaveProperty('addPoint2D')
    expect(module).toHaveProperty('solveSketch')
  })

  it('should clear sketch', async () => {
    await wrapper.initialize()
    wrapper.clearSketch()
    // Should not throw
    expect(wrapper.isInitialized()).toBe(true)
  })
})
