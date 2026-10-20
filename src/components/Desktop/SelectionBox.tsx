import React from 'react'

interface SelectionBoxProps {
  startX: number
  startY: number
  currentX: number
  currentY: number
}

export const SelectionBox: React.FC<SelectionBoxProps> = ({
  startX,
  startY,
  currentX,
  currentY,
}) => {
  const left = Math.min(startX, currentX)
  const top = Math.min(startY, currentY)
  const width = Math.abs(currentX - startX)
  const height = Math.abs(currentY - startY)

  return (
    <div
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
      className="fixed pointer-events-none z-20 bg-blue-500/20 border border-blue-400/60 rounded-md"
    />
  )
}
