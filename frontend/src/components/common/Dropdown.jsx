import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { FiCheck, FiChevronDown, FiChevronUp } from 'react-icons/fi'

const Dropdown = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
  disabled = false,
  columns = null,
}) => {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState(null)
  const containerRef = useRef(null)
  const buttonRef = useRef(null)
  const panelRef = useRef(null)
  const showcase = columns && columns > 1
  const selected = options.find(opt => opt.value === value)

  const getCoords = () => {
    if (!buttonRef.current) return null
    const rect = buttonRef.current.getBoundingClientRect()
    const vw = window.innerWidth
    const panelWidth = Math.max(rect.width, 220)
    const left = Math.min(rect.left, Math.max(8, vw - panelWidth - 8))
    return { top: rect.bottom + 6, left, width: rect.width, vw }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      const inContainer = containerRef.current && containerRef.current.contains(e.target)
      const inPanel = panelRef.current && panelRef.current.contains(e.target)
      if (!inContainer && !inPanel) setOpen(false)
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const handleReposition = () => {
      if (open && buttonRef.current) {
        setCoords(getCoords())
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    if (showcase && open) {
      window.addEventListener('scroll', handleReposition, true)
      window.addEventListener('resize', handleReposition)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('scroll', handleReposition, true)
      window.removeEventListener('resize', handleReposition)
    }
  }, [open, showcase])

  const toggleOpen = () => {
    if (open) {
      setOpen(false)
      return
    }
    setCoords(getCoords())
    setOpen(true)
  }

  const handleSelect = (opt) => {
    onChange(opt.value)
    setOpen(false)
  }

  const effectiveColumns = showcase
    ? (coords?.vw && coords.vw < 768 ? Math.min(columns, 3) : columns)
    : columns

  const chunks = []
  if (showcase) {
    for (let i = 0; i < options.length; i += effectiveColumns) {
      chunks.push(options.slice(i, i + effectiveColumns))
    }
  }

  const renderItems = (grid) => (
    <div className={grid ? 'flex' : undefined}>
      {grid
        ? chunks.map((chunk, ci) => (
            <div key={ci} className={`flex flex-col py-1.5 ${ci > 0 ? 'border-l border-gray-200' : ''}`}>
              {chunk.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={`flex items-center justify-between gap-2 px-4 py-2 text-sm whitespace-nowrap text-left
                    transition-colors duration-150 ${opt.value === value
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'}`}
                >
                  <span className="truncate">{opt.label}</span>
                  {opt.value === value && <FiCheck size={16} className="text-primary-600 flex-shrink-0" />}
                </button>
              ))}
            </div>
          ))
        : options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt)}
              className={`w-full flex items-center justify-between gap-2 px-4 py-2 text-sm text-left
                transition-colors duration-150 ${opt.value === value
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <span className="truncate">{opt.label}</span>
              {opt.value === value && <FiCheck size={16} className="text-primary-600 flex-shrink-0" />}
            </button>
          ))}
      {options.length === 0 && (
        <p className="px-4 py-2 text-sm text-gray-400">No options</p>
      )}
    </div>
  )

  const panelClasses = showcase
    ? 'bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 max-h-[min(70vh,30rem)] overflow-y-auto'
    : 'max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg py-1.5'

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        onClick={toggleOpen}
        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 border rounded-lg text-sm
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500
          ${open ? 'border-primary-500 ring-2 ring-primary-500' : 'border-gray-300 hover:border-gray-400'}
          ${selected ? 'text-gray-900' : 'text-gray-500'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'bg-white cursor-pointer'}`}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        {open
          ? <FiChevronUp size={16} className="text-gray-400 flex-shrink-0" />
          : <FiChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
      </button>

      {showcase ? (
        open && createPortal(
          <div
            ref={panelRef}
            style={{ top: coords?.top || 0, left: coords?.left || 0, minWidth: coords?.width || 0 }}
            className="fixed z-50 origin-top max-w-[calc(100vw-1rem)] animate-dropdown-in"
          >
            <div className={panelClasses}>{renderItems(true)}</div>
          </div>,
          document.body
        )
      ) : (
        <div className={`absolute left-0 right-0 z-30 mt-1 origin-top transition-all duration-150
          ${open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
          <div className={panelClasses}>{renderItems(false)}</div>
        </div>
      )}
    </div>
  )
}

export default Dropdown
