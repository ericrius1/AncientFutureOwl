import { useTexture, Environment } from "@react-three/drei"
import { useControls } from "leva"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useEffect } from "react"
import { useStore } from "./store"
import { damp } from "maath/easing"
import { useState } from "react"

export function EpicEnvironment() {
  const started = useStore((state) => state.started)
  const envMap = useTexture("/environmentmaps/night.jpg")
  envMap.mapping = THREE.EquirectangularReflectionMapping

  const targetEnvIntensity = useRef(0)

  const currentEnvIntensity = useRef(0)

  const [environmentIntensity, setEnvironmentIntensity] = useState(0)

  const [{ environmentRotation, backgroundIntensity, envHeight }, setControls] =
    useControls("Environment", () => ({
      envHeight: {
        value: 13.11,
        min: 0,
        max: 100,
        step: 0.01,
      },
      environmentRotation: {
        value: 0.36,
        min: 0,
        max: Math.PI * 2,
        step: 0.01,
      },
      backgroundIntensity: {
        value: 0.07,
        min: 0,
        max: 1,
        step: 0.01,
      },
    }))

  useEffect(() => {
    if (started) {
      setTimeout(() => {
        targetEnvIntensity.current = 0.9
      }, 1500)
    }
  }, [started])
  useFrame((state, delta) => {
    damp(currentEnvIntensity, "current", targetEnvIntensity.current, 1, delta)

    if (started && currentEnvIntensity.current < 0.7) {
      setEnvironmentIntensity(currentEnvIntensity.current)
    }
  })

  return (
    <>
      <Environment
        background
        backgroundIntensity={backgroundIntensity}
        frames={1}
        resolution={2048}
        environmentIntensity={environmentIntensity}
      >
        <mesh rotation={[0, environmentRotation, 0]} position-y={envHeight}>
          <sphereGeometry args={[100, 64, 64]} />
          <meshBasicMaterial map={envMap} side={1} />
        </mesh>
      </Environment>
    </>
  )
}
