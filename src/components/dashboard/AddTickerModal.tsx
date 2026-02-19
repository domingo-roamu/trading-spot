'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { X, Plus } from 'lucide-react'
import { addToWatchlistAction, WatchlistState } from '@/lib/watchlist/actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? 'Agregando...' : 'Agregar'}
    </button>
  )
}

export function AddTickerModal() {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useFormState<WatchlistState, FormData>(
    addToWatchlistAction,
    null
  )
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close on success
  useEffect(() => {
    if (state?.success) {
      setOpen(false)
      formRef.current?.reset()
    }
  }, [state])

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const handleClose = useCallback(() => {
    setOpen(false)
    formRef.current?.reset()
  }, [])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, handleClose])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
      >
        <Plus size={16} />
        Agregar
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-ticker-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 id="add-ticker-title" className="text-base font-semibold text-gray-900">
                Agregar instrumento
              </h2>
              <button
                onClick={handleClose}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="Cerrar"
              >
                <X size={16} />
              </button>
            </div>

            <form ref={formRef} action={formAction} className="space-y-4">
              <div>
                <label
                  htmlFor="ticker"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Ticker <span className="text-danger-500">*</span>
                </label>
                <input
                  ref={inputRef}
                  id="ticker"
                  name="ticker"
                  type="text"
                  placeholder="Ej: AAPL, BTC-USD, ^GSPC"
                  maxLength={10}
                  autoComplete="off"
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase()
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Nombre{' '}
                  <span className="text-xs text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Ej: Apple Inc."
                  maxLength={100}
                  autoComplete="off"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
                />
              </div>

              {state?.error && (
                <p className="text-sm text-danger-600 bg-danger-50 border border-danger-200 rounded-lg px-3 py-2">
                  {state.error}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <SubmitButton />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
