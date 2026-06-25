/**
 * Constraint Dialog Component
 * Modal dialog for entering constraint values
 */

export interface ConstraintDialogOptions {
  title: string
  message: string
  inputLabel: string
  inputType?: 'number' | 'text'
  defaultValue?: string | number
  min?: number
  max?: number
  step?: number
}

export class ConstraintDialog {
  private dialog: HTMLDialogElement | null = null
  private resolve: ((value: string | number | null) => void) | null = null

  /**
   * Show a dialog and wait for user input
   */
  async show(options: ConstraintDialogOptions): Promise<string | number | null> {
    return new Promise((resolve) => {
      this.resolve = resolve
      this.createDialog(options)
      this.dialog?.showModal()
    })
  }

  /**
   * Create the dialog element
   */
  private createDialog(options: ConstraintDialogOptions): void {
    // Remove existing dialog if any
    this.dialog?.remove()

    this.dialog = document.createElement('dialog')
    this.dialog.className = 'constraint-dialog'

    const inputType = options.inputType || 'number'
    const inputAttrs: Record<string, string> = {
      type: inputType,
      id: 'constraint-input',
      required: 'required',
    }

    if (inputType === 'number') {
      if (options.min !== undefined) inputAttrs.min = String(options.min)
      if (options.max !== undefined) inputAttrs.max = String(options.max)
      if (options.step !== undefined) inputAttrs.step = String(options.step)
    }

    if (options.defaultValue !== undefined) {
      inputAttrs.value = String(options.defaultValue)
    }

    const inputAttrsString = Object.entries(inputAttrs)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ')

    this.dialog.innerHTML = `
      <div class="constraint-dialog-content">
        <h2 class="dialog-title">${options.title}</h2>
        <p class="dialog-message">${options.message}</p>
        
        <form class="dialog-form">
          <div class="form-group">
            <label for="constraint-input" class="form-label">${options.inputLabel}:</label>
            <input ${inputAttrsString} class="form-input" />
          </div>

          <div class="form-actions">
            <button type="button" class="dialog-btn dialog-btn-cancel">Cancel</button>
            <button type="submit" class="dialog-btn dialog-btn-ok">OK</button>
          </div>
        </form>
      </div>
    `

    // Attach event listeners
    const form = this.dialog.querySelector('form') as HTMLFormElement
    form?.addEventListener('submit', (e) => {
      e.preventDefault()
      this.onOk()
    })

    const cancelBtn = this.dialog.querySelector(
      '.dialog-btn-cancel'
    ) as HTMLButtonElement
    cancelBtn?.addEventListener('click', () => this.onCancel())

    this.dialog.addEventListener('cancel', () => this.onCancel())

    document.body.appendChild(this.dialog)

    // Focus input after dialog is shown
    setTimeout(() => {
      (this.dialog?.querySelector('input') as HTMLInputElement)?.focus()
    }, 100)
  }

  /**
   * Handle OK button click
   */
  private onOk(): void {
    const input = (this.dialog?.querySelector('input') as HTMLInputElement)
      ?.value
    if (this.resolve && input) {
      this.resolve(input)
    }
    this.close()
  }

  /**
   * Handle Cancel button click
   */
  private onCancel(): void {
    if (this.resolve) {
      this.resolve(null)
    }
    this.close()
  }

  /**
   * Close the dialog
   */
  private close(): void {
    this.dialog?.close()
    this.dialog?.remove()
    this.dialog = null
    this.resolve = null
  }
}

export default ConstraintDialog
