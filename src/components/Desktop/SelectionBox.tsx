import React from 'react'

interface SelectionBoxProps {
  startX: number
  startY: number
  currentX: number
  currentY: number
  color?: string
}

export const SelectionBox: React.FC<SelectionBoxProps> = ({
  startX,
  startY,
  currentX,
  currentY,
  color = '#3b82f6',
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
        backgroundColor: `${color}25`,
        borderColor: `${color}88`,
      }}
      className="fixed pointer-events-none z-20 border rounded-md"
    />
  )
}
