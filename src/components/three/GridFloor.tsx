import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'

export default function GridFloor() {
  const gridRef = useRef<THREE.GridHelper>(null)

  useFrame((state) => {
    if (!gridRef.current) return
    const material = gridRef.current.material as THREE.Material
    if ('opacity' in material) {
      material.opacity = 0.08 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02
    }
  })

  return (
    <gridHelper
      ref={gridRef}
      args={[40, 40, '#6366F1', '#1A1A1A']}
      position={[0, -4, 0]}
      rotation={[0, 0, 0]}
      material-transparent
      material-opacity={0.08}
    />
  )
}
