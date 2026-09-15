import React, { useRef, useEffect, useState } from 'react'

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let mounted = true

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: 1280, height: 720 },
          audio: false,
        })
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => setReady(true)
        }
      } catch (e) {
        setError('Could not access camera. Please allow permission or use file upload instead.')
      }
    }

    startCamera()

    return () => {
      mounted = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  const handleCapture = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !ready) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' })
        onCapture(file)
        onClose()
      },
      'image/jpeg',
      0.9
    )
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <div className="relative w-full h-full">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-white p-6 text-center">
            <p className="mb-4">{error}</p>
            <button onClick={onClose} className="px-5 py-2.5 bg-white text-black rounded-lg font-semibold">
              Close
            </button>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
            <canvas ref={canvasRef} className="hidden" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/20 text-white backdrop-blur-sm"
            >
              ✕
            </button>

            <div className="absolute bottom-8 left-0 right-0 flex justify-center">
              <button
                onClick={handleCapture}
                disabled={!ready}
                className="w-20 h-20 rounded-full bg-white border-4 border-gray-300
                           hover:scale-105 active:scale-95 transition-transform disabled:opacity-40"
                aria-label="Capture photo"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CameraCapture