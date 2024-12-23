'use client'

import { useEffect, useRef } from 'react'

export function LightBeam() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasSize()
    window.addEventListener('resize', setCanvasSize)

    const drawBeam = () => {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const gradient = ctx.createLinearGradient(
        canvas.width / 2,
        0,
        canvas.width / 2,
        canvas.height
      )

      gradient.addColorStop(0, 'rgba(52, 211, 153, 0.2)')
      gradient.addColorStop(0.5, 'rgba(52, 211, 153, 0.05)')
      gradient.addColorStop(1, 'transparent')

      ctx.fillStyle = gradient
      ctx.filter = 'blur(50px)'

      ctx.beginPath()
      ctx.moveTo(canvas.width / 2 - 100, 0)
      ctx.lineTo(canvas.width / 2 + 100, 0)
      ctx.lineTo(canvas.width / 2 + 300, canvas.height)
      ctx.lineTo(canvas.width / 2 - 300, canvas.height)
      ctx.closePath()
      ctx.fill()
    }

    drawBeam()
    window.addEventListener('resize', drawBeam)

    return () => {
      window.removeEventListener('resize', setCanvasSize)
      window.removeEventListener('resize', drawBeam)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  )
}

