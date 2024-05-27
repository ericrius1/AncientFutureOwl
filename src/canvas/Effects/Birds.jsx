import * as THREE from "three"
import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { dampQ } from "maath/easing"
import { mapLinear, randFloat } from "three/src/math/MathUtils"
import { useEffect } from "react"

const targetObject = new THREE.Object3D()

const createWingGeometry = (side) => {
  const geometry = new THREE.BufferGeometry()
  let vertices
  let normals
  const gap = 0.01
  if (side === "left") {
    vertices = new Float32Array([
      -0.5,
      0,
      -0.25,
      0 - gap,
      0,
      -0.25,
      0 - gap,
      0,
      0.25,
    ])

    normals = new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0])
  } else if (side === "right") {
    vertices = new Float32Array([
      0.5,
      0,
      -0.25,
      0 + gap,
      0,
      -0.25,
      0 + gap,
      0,
      0.25,
    ])
    normals = new Float32Array([0, -1, 0, 0, -1, 0, 0, -1, 0])
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  )
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3))

  return geometry
}

const Wing = ({ side, position, flapSpeed }) => {
  const geometry = useMemo(() => createWingGeometry(side), [side])
  const indexToMove = 0
  const vertexIndex = indexToMove * 3
  const positionAttribute = geometry.attributes.position

  useFrame((state, delta) => {
    const moveY = Math.sin(state.clock.elapsedTime * flapSpeed) * 0.188

    // we want to access y component, so add offset of 1
    positionAttribute.array[vertexIndex + 1] = moveY
    positionAttribute.needsUpdate = true

    geometry.computeVertexNormals()
  })
  return (
    <mesh geometry={geometry} position={position} castShadow>
      <meshStandardMaterial side={2} metalness={1} roughness={0} />
    </mesh>
  )
}

const Bird = ({
  startingPosition = [0, 0, 0],
  targetPoint,
  speed,
  ...props
}) => {
  const bird = useRef()

  const flapSpeed = mapLinear(speed, 3, 4, 1, 1.5)

  useEffect(() => {
    bird.current.lookAt(targetPoint)
  }, [])

  useFrame((state, delta) => {
    targetObject.lookAt(targetPoint)
    dampQ(bird.current.quaternion, targetObject.quaternion, 0.99, delta)
    bird.current.translateZ(delta * speed)

    if (bird.current.position.x > 100) {
      bird.current.position.copy(startingPosition)
    }
  })

  return (
    <group ref={bird} position={startingPosition} {...props}>
      <Wing side="right" flapSpeed={flapSpeed} />
      <Wing side="left" flapSpeed={flapSpeed} />
    </group>
  )
}

export default function Birds({ position, scale = 1 }) {
  return (
    <group>
      {birds.map((bird) => (
        <Bird
          key={bird.key}
          scale={bird.scale}
          startingPosition={bird.position}
          targetPoint={bird.targetPoint}
          speed={bird.speed}
        />
      ))}
    </group>
  )
}

const birds = Array.from({ length: 100 }).map((_, index) => {
  const depthRange = { min: -100, max: -30 }
  const depth = randFloat(depthRange.min, depthRange.max)

  const height = randFloat(-10, 200)
  const startX = randFloat(-200, -90)

  const speed = mapLinear(depth, depthRange.min, depthRange.max, 5, 10)
  const scale = mapLinear(depth, depthRange.min, depthRange.max, 1, 2)
  return {
    key: "instance_" + index,
    speed: speed,
    scale: scale,

    id: index / 100, //normalized between 0 and 1
    position: new THREE.Vector3(startX, height, depth),
    targetPoint: new THREE.Vector3(10000, height, depth),
    // scale: 1.5,
  }
})
