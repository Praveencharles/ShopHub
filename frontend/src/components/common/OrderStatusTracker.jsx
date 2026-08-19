import { FiCheck, FiClock, FiXCircle } from 'react-icons/fi'

export const statusFlow = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

const formatLabel = (status) => status.charAt(0).toUpperCase() + status.slice(1)

const OrderStatusTracker = ({ status, compact = false }) => {
  const currentStep = statusFlow.indexOf(status)
  const cancelled = status === 'cancelled'
  const total = statusFlow.length - 1
  const progress = cancelled ? 0 : currentStep >= 0 ? currentStep / total : 0

  if (compact) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-xs font-medium ${cancelled ? 'text-red-600' : 'text-primary-600'}`}>
            {formatLabel(status)}
          </span>
          <span className="text-[10px] text-gray-400 uppercase tracking-wide">Order track</span>
        </div>
        <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${cancelled ? 'bg-red-500' : 'bg-primary-500'}`}
            style={{ width: `${progress * 100}%` }} />
          {statusFlow.map((_, i) => (
            <span key={i} className="absolute top-0 bottom-0 w-px bg-white"
              style={{ left: `${(i / total) * 100}%` }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="relative">
        {/* Step progress bar */}
        <div className="absolute left-[10%] right-[10%] top-4 sm:top-5 -translate-y-1/2 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${cancelled ? 'bg-red-400' : 'bg-gradient-to-r from-primary-500 to-primary-600'}`}
            style={{ width: `${progress * 100}%` }} />
        </div>

        {/* Steps */}
        <div className="flex items-center">
          {statusFlow.map((step, i) => {
            const isCompleted = !cancelled && i < currentStep
            const isCurrent = !cancelled && i === currentStep
            return (
              <div key={step} className="flex-1 flex flex-col items-center min-w-0">
                <div className="relative">
                  <div className={`relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                      : isCurrent
                        ? 'bg-white text-primary-600 border-2 border-primary-600 shadow-md shadow-primary-100'
                        : cancelled
                          ? 'bg-gray-100 text-gray-400'
                          : 'bg-white text-gray-400 border-2 border-gray-200'
                  }`}>
                    {isCompleted ? <FiCheck size={16} className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /> : isCurrent ? <FiClock size={16} className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /> : <span className="text-xs sm:text-sm">{i + 1}</span>}
                  </div>
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-40" />
                  )}
                </div>
                <span className={`relative z-10 text-[10px] sm:text-xs mt-2 text-center leading-tight w-full px-0.5 capitalize ${isCompleted || isCurrent ? 'text-primary-700 font-semibold' : 'text-gray-400'}`}>
                  {step}
                </span>
              </div>
            )
          })}
        </div>
      </div>
      {cancelled && (
        <div className="mt-5 p-3 bg-red-50 rounded-lg flex items-center gap-2">
          <FiXCircle className="text-red-500 flex-shrink-0" size={18} />
          <span className="text-sm text-red-700">This order has been cancelled and is no longer in progress</span>
        </div>
      )}
    </div>
  )
}

export default OrderStatusTracker
