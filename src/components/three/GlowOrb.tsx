import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MeshDistortMaterial } from '@react-three/drei'
import type * as THREE from 'three'

export default function GlowOrb() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { pointer } = useThree()
  const target = useRef({ x: 0, y: 0 })

  useFrame(() => {
    if (!meshRef.current) return

    // Smooth follow cursor with heavy damping
    target.current.x += (pointer.x * 3 - target.current.x) * 0.02
    target.current.y += (pointer.y * 3 - target.current.y) * 0.02

    meshRef.current.position.x = target.current.x
    meshRef.current.position.y = target.current.y
  })

  return (
    <mesh ref={meshRef} position={[0, 0, -2]}>
      <sphereGeometry args={[1.5, 64, 64]} />
      <MeshDistortMaterial
        color="#6366F1"
        transparent
        opacity={0.15}
        distort={0.4}
        speed={2}
        roughness={0.2}
      />
    </mesh>
  )
}
