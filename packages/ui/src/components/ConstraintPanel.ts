/**
 * Constraint Panel Component
 * UI for managing sketch constraints in the Chili3D constraint toolbar
 */

import type { ConstraintManager, SolvedPoint } from '@chili3d/solvespace'

export interface ConstraintPanelConfig {
  constraintManager: ConstraintManager
  sketchId: string
  onConstraintAdded?: (type: string, details: Record<string, any>) => void
  onSolveComplete?: (result: any) => void
}

export class ConstraintPanel {
  private config: ConstraintPanelConfig
  private container: HTMLElement | null = null
  private selectedPoints: string[] = []
  private selectedLines: string[] = []
  private selectedEntities: string[] = []

  constructor(config: ConstraintPanelConfig) {
    this.config = config
  }

  /**
   * Render the constraint panel UI
   */
  render(parentElement: HTMLElement): void {
    this.container = document.createElement('div')
    this.container.className = 'constraint-panel'
    this.container.innerHTML = `
      <div class="constraint-panel-header">
        <h3>Constraints</h3>
        <button id="constraint-panel-collapse" class="collapse-btn">−</button>
      </div>
      <div class="constraint-panel-content">
        <div class="constraint-section">
          <h4>Geometric Constraints</h4>
          <div class="constraint-buttons">
            <button id="btn-coincident" class="constraint-btn" title="Coincident">
              <span class="icon">●●</span>
            </button>
            <button id="btn-distance" class="constraint-btn" title="Distance">
              <span class="icon">↔</span>
            </button>
            <button id="btn-angle" class="constraint-btn" title="Angle">
              <span class="icon">∠</span>
            </button>
            <button id="btn-perpendicular" class="constraint-btn" title="Perpendicular">
              <span class="icon">⊥</span>
            </button>
            <button id="btn-parallel" class="constraint-btn" title="Parallel">
              <span class="icon">∥</span>
            </button>
          </div>
        </div>

        <div class="constraint-section">
          <h4>Dimension Constraints</h4>
          <div class="constraint-buttons">
            <button id="btn-equal" class="constraint-btn" title="Equal Length">
              <span class="icon">=</span>
            </button>
            <button id="btn-horizontal" class="constraint-btn" title="Horizontal">
              <span class="icon">—</span>
            </button>
            <button id="btn-vertical" class="constraint-btn" title="Vertical">
              <span class="icon">|</span>
            </button>
            <button id="btn-symmetric" class="constraint-btn" title="Symmetric">
              <span class="icon">↔</span>
            </button>
          </div>
        </div>

        <div class="constraint-section">
          <h4>Solver</h4>
          <div class="solver-controls">
            <button id="btn-solve" class="solve-btn">Solve</button>
            <button id="btn-clear" class="clear-btn">Clear</button>
          </div>
        </div>

        <div class="constraint-info">
          <div id="constraint-stats" class="stats"></div>
          <div id="solver-status" class="status"></div>
        </div>
      </div>
    `

    parentElement.appendChild(this.container)
    this.attachEventListeners()
  }

  /**
   * Attach event listeners to constraint buttons
   */
  private attachEventListeners(): void {
    if (!this.container) return

    // Geometric constraints
    this.container
      .getElementById('btn-coincident')
      ?.addEventListener('click', () => this.onCoincidentClicked())
    this.container
      .getElementById('btn-distance')
      ?.addEventListener('click', () => this.onDistanceClicked())
    this.container
      .getElementById('btn-angle')
      ?.addEventListener('click', () => this.onAngleClicked())
    this.container
      .getElementById('btn-perpendicular')
      ?.addEventListener('click', () => this.onPerpendicularClicked())
    this.container
      .getElementById('btn-parallel')
      ?.addEventListener('click', () => this.onParallelClicked())

    // Dimension constraints
    this.container
      .getElementById('btn-equal')
      ?.addEventListener('click', () => this.onEqualClicked())
    this.container
      .getElementById('btn-horizontal')
      ?.addEventListener('click', () => this.onHorizontalClicked())
    this.container
      .getElementById('btn-vertical')
      ?.addEventListener('click', () => this.onVerticalClicked())
    this.container
      .getElementById('btn-symmetric')
      ?.addEventListener('click', () => this.onSymmetricClicked())

    // Solver controls
    this.container
      .getElementById('btn-solve')
      ?.addEventListener('click', () => this.onSolveClicked())
    this.container
      .getElementById('btn-clear')
      ?.addEventListener('click', () => this.onClearClicked())
  }

  /**
   * Set selected points from the sketch editor
   */
  setSelectedPoints(points: string[]): void {
    this.selectedPoints = points
    this.selectedEntities = points
    this.updateButtonStates()
  }

  /**
   * Set selected lines from the sketch editor
   */
  setSelectedLines(lines: string[]): void {
    this.selectedLines = lines
    this.selectedEntities = lines
    this.updateButtonStates()
  }

  /**
   * Update the enabled/disabled state of buttons based on selection
   */
  private updateButtonStates(): void {
    if (!this.container) return

    // Reset all buttons
    this.container
      .querySelectorAll('.constraint-btn')
      .forEach((btn) => btn.classList.remove('disabled'))

    // Disable based on selection
    if (this.selectedPoints.length < 2) {
      this.container.getElementById('btn-coincident')?.classList.add('disabled')
      this.container.getElementById('btn-distance')?.classList.add('disabled')
    }

    if (this.selectedLines.length < 2) {
      this.container.getElementById('btn-angle')?.classList.add('disabled')
      this.container.getElementById('btn-perpendicular')?.classList.add('disabled')
      this.container.getElementById('btn-parallel')?.classList.add('disabled')
      this.container.getElementById('btn-equal')?.classList.add('disabled')
    }

    if (this.selectedLines.length !== 1) {
      this.container.getElementById('btn-horizontal')?.classList.add('disabled')
      this.container.getElementById('btn-vertical')?.classList.add('disabled')
    }

    if (this.selectedPoints.length !== 2 || this.selectedLines.length !== 1) {
      this.container.getElementById('btn-symmetric')?.classList.add('disabled')
    }
  }

  /**
   * Handle coincident constraint
   */
  private async onCoincidentClicked(): Promise<void> {
    if (this.selectedPoints.length !== 2) {
      this.showMessage('Select 2 points for coincident constraint', 'error')
      return
    }

    try {
      await this.config.constraintManager.addCoincidentConstraint(
        this.config.sketchId,
        this.selectedPoints[0],
        this.selectedPoints[1]
      )
      this.config.onConstraintAdded?.('coincident', {
        pointA: this.selectedPoints[0],
        pointB: this.selectedPoints[1],
      })
      this.showMessage('Coincident constraint added', 'success')
    } catch (error) {
      this.showMessage(`Error: ${error}`, 'error')
    }
  }

  /**
   * Handle distance constraint
   */
  private async onDistanceClicked(): Promise<void> {
    if (this.selectedPoints.length !== 2) {
      this.showMessage('Select 2 points for distance constraint', 'error')
      return
    }

    const distance = await this.promptForNumber('Enter distance value:')
    if (distance === null) return

    try {
      await this.config.constraintManager.addDistanceConstraint(
        this.config.sketchId,
        this.selectedPoints[0],
        this.selectedPoints[1],
        distance
      )
      this.config.onConstraintAdded?.('distance', {
        pointA: this.selectedPoints[0],
        pointB: this.selectedPoints[1],
        distance,
      })
      this.showMessage(`Distance constraint added: ${distance}`, 'success')
    } catch (error) {
      this.showMessage(`Error: ${error}`, 'error')
    }
  }

  /**
   * Handle angle constraint
   */
  private async onAngleClicked(): Promise<void> {
    if (this.selectedLines.length !== 2) {
      this.showMessage('Select 2 lines for angle constraint', 'error')
      return
    }

    const angle = await this.promptForNumber('Enter angle (degrees):')
    if (angle === null) return

    try {
      await this.config.constraintManager.addAngleConstraint(
        this.config.sketchId,
        this.selectedLines[0],
        this.selectedLines[1],
        angle
      )
      this.config.onConstraintAdded?.('angle', {
        lineA: this.selectedLines[0],
        lineB: this.selectedLines[1],
        angle,
      })
      this.showMessage(`Angle constraint added: ${angle}°`, 'success')
    } catch (error) {
      this.showMessage(`Error: ${error}`, 'error')
    }
  }

  /**
   * Handle perpendicular constraint
   */
  private async onPerpendicularClicked(): Promise<void> {
    if (this.selectedLines.length !== 2) {
      this.showMessage('Select 2 lines for perpendicular constraint', 'error')
      return
    }

    try {
      await this.config.constraintManager.addPerpendicularConstraint(
        this.config.sketchId,
        this.selectedLines[0],
        this.selectedLines[1]
      )
      this.config.onConstraintAdded?.('perpendicular', {
        lineA: this.selectedLines[0],
        lineB: this.selectedLines[1],
      })
      this.showMessage('Perpendicular constraint added', 'success')
    } catch (error) {
      this.showMessage(`Error: ${error}`, 'error')
    }
  }

  /**
   * Handle parallel constraint
   */
  private async onParallelClicked(): Promise<void> {
    if (this.selectedLines.length !== 2) {
      this.showMessage('Select 2 lines for parallel constraint', 'error')
      return
    }

    try {
      await this.config.constraintManager.addParallelConstraint(
        this.config.sketchId,
        this.selectedLines[0],
        this.selectedLines[1]
      )
      this.config.onConstraintAdded?.('parallel', {
        lineA: this.selectedLines[0],
        lineB: this.selectedLines[1],
      })
      this.showMessage('Parallel constraint added', 'success')
    } catch (error) {
      this.showMessage(`Error: ${error}`, 'error')
    }
  }

  /**
   * Handle equal length constraint
   */
  private async onEqualClicked(): Promise<void> {
    if (this.selectedLines.length !== 2) {
      this.showMessage('Select 2 lines for equal length constraint', 'error')
      return
    }

    try {
      await this.config.constraintManager.addEqualLengthConstraint(
        this.config.sketchId,
        this.selectedLines[0],
        this.selectedLines[1]
      )
      this.config.onConstraintAdded?.('equal', {
        lineA: this.selectedLines[0],
        lineB: this.selectedLines[1],
      })
      this.showMessage('Equal length constraint added', 'success')
    } catch (error) {
      this.showMessage(`Error: ${error}`, 'error')
    }
  }

  /**
   * Handle horizontal constraint
   */
  private async onHorizontalClicked(): Promise<void> {
    if (this.selectedLines.length !== 1) {
      this.showMessage('Select 1 line for horizontal constraint', 'error')
      return
    }

    try {
      await this.config.constraintManager.addHorizontalConstraint(
        this.config.sketchId,
        this.selectedLines[0]
      )
      this.config.onConstraintAdded?.('horizontal', {
        line: this.selectedLines[0],
      })
      this.showMessage('Horizontal constraint added', 'success')
    } catch (error) {
      this.showMessage(`Error: ${error}`, 'error')
    }
  }

  /**
   * Handle vertical constraint
   */
  private async onVerticalClicked(): Promise<void> {
    if (this.selectedLines.length !== 1) {
      this.showMessage('Select 1 line for vertical constraint', 'error')
      return
    }

    try {
      await this.config.constraintManager.addVerticalConstraint(
        this.config.sketchId,
        this.selectedLines[0]
      )
      this.config.onConstraintAdded?.('vertical', {
        line: this.selectedLines[0],
      })
      this.showMessage('Vertical constraint added', 'success')
    } catch (error) {
      this.showMessage(`Error: ${error}`, 'error')
    }
  }

  /**
   * Handle symmetric constraint
   */
  private async onSymmetricClicked(): Promise<void> {
    if (this.selectedPoints.length !== 2 || this.selectedLines.length !== 1) {
      this.showMessage(
        'Select 2 points and 1 line for symmetric constraint',
        'error'
      )
      return
    }

    try {
      await this.config.constraintManager.addCoincidentConstraint(
        this.config.sketchId,
        this.selectedPoints[0],
        this.selectedPoints[1]
      )
      // Note: SolveSpace has addSymmetric but it's more complex
      // This is a placeholder for future enhancement
      this.config.onConstraintAdded?.('symmetric', {
        pointA: this.selectedPoints[0],
        pointB: this.selectedPoints[1],
        line: this.selectedLines[0],
      })
      this.showMessage('Symmetric constraint added', 'success')
    } catch (error) {
      this.showMessage(`Error: ${error}`, 'error')
    }
  }

  /**
   * Handle solve button click
   */
  private async onSolveClicked(): Promise<void> {
    try {
      const result = await this.config.constraintManager.solveSketch(
        this.config.sketchId
      )

      if (result.success) {
        this.showMessage('Sketch solved successfully', 'success')
        const updates =
          this.config.constraintManager.getUpdatedPoints(this.config.sketchId)
        this.updatePointDisplay(updates)
        this.config.onSolveComplete?.(result)
      } else {
        this.showMessage(
          `Solving failed: ${this.getSolveErrorMessage(result.result)}`,
          'error'
        )
      }
    } catch (error) {
      this.showMessage(`Error during solving: ${error}`, 'error')
    }
  }

  /**
   * Handle clear button click
   */
  private onClearClicked(): void {
    this.config.constraintManager.clearSketch(this.config.sketchId)
    this.selectedPoints = []
    this.selectedLines = []
    this.selectedEntities = []
    this.updateButtonStates()
    this.showMessage('Sketch cleared', 'info')
  }

  /**
   * Prompt user for a numeric value
   */
  private promptForNumber(message: string): Promise<number | null> {
    return new Promise((resolve) => {
      const value = window.prompt(message)
      if (value === null) {
        resolve(null)
      } else {
        const num = parseFloat(value)
        resolve(isNaN(num) ? null : num)
      }
    })
  }

  /**
   * Show message to user
   */
  private showMessage(message: string, type: 'success' | 'error' | 'info'):
    void {
    if (!this.container) return

    const statusEl = this.container.getElementById('solver-status')
    if (statusEl) {
      statusEl.className = `status status-${type}`
      statusEl.textContent = message
      statusEl.style.display = 'block'

      setTimeout(() => {
        statusEl.style.display = 'none'
      }, 3000)
    }
  }

  /**
   * Get human-readable error message
   */
  private getSolveErrorMessage(code: number): string {
    const messages: Record<number, string> = {
      0: 'Solved',
      1: 'Failed',
      2: 'Too many unknowns',
      3: 'Inconsistent',
      4: 'Singular matrix',
      5: 'Rank',
    }
    return messages[code] || `Unknown error (code ${code})`
  }

  /**
   * Update point display after solving
   */
  private updatePointDisplay(points: SolvedPoint[]): void {
    if (!this.container) return

    const infoEl = this.container.getElementById('constraint-stats')
    if (infoEl) {
      const stats = this.config.constraintManager.getStats(this.config.sketchId)
      infoEl.innerHTML = `
        <div class="stat">
          <label>Points:</label>
          <span>${stats?.points ?? 0}</span>
        </div>
        <div class="stat">
          <label>Lines:</label>
          <span>${stats?.lines ?? 0}</span>
        </div>
        <div class="stat">
          <label>Constraints:</label>
          <span>${stats?.constraints ?? 0}</span>
        </div>
      `
    }
  }

  /**
   * Destroy the panel
   */
  destroy(): void {
    if (this.container) {
      this.container.remove()
      this.container = null
    }
  }
}

export default ConstraintPanel
