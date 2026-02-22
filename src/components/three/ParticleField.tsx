import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type * as THREE from 'three'

export default function ParticleField({ count = 2000 }: { count?: number }) {
  const meshRef = useRef<THREE.Points>(null)
  const { pointer } = useThree()

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const speeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
      speeds[i] = Math.random() * 0.5 + 0.1
    }
    return { positions, speeds }
  }, [count])

  useFrame((state) => {
    if (!meshRef.current) return
    const geo = meshRef.current.geometry
    const posAttr = geo.attributes.position
    const arr = posAttr.array as Float32Array
    const time = state.clock.elapsedTime

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const speed = speeds[i]

      // Gentle sine wave drift
      arr[i3] += Math.sin(time * speed + i) * 0.001
      arr[i3 + 1] += Math.cos(time * speed * 0.7 + i) * 0.001
      arr[i3 + 2] += Math.sin(time * speed * 0.5 + i * 0.5) * 0.0005

      // Cursor repulsion (mapped from NDC to world)
      const dx = arr[i3] - pointer.x * 5
      const dy = arr[i3 + 1] - pointer.y * 5
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 2) {
        const force = (2 - dist) * 0.003
        arr[i3] += dx * force
        arr[i3 + 1] += dy * force
      }

      // Wrap around bounds
      if (arr[i3] > 10) arr[i3] = -10
      if (arr[i3] < -10) arr[i3] = 10
      if (arr[i3 + 1] > 10) arr[i3 + 1] = -10
      if (arr[i3 + 1] < -10) arr[i3 + 1] = 10
    }

    posAttr.needsUpdate = true
    meshRef.current.rotation.y = time * 0.02
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
