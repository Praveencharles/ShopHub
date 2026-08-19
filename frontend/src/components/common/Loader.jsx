import { ClipLoader } from 'react-spinners'

const Loader = ({ size = 40, color = '#3b82f6', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        <ClipLoader size={size} color={color} />
      </div>
    )
  }
  return (
    <div className="flex items-center justify-center py-12">
      <ClipLoader size={size} color={color} />
    </div>
  )
}

export default Loader
