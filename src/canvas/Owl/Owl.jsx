import {
  useFBO,
  useGLTF,
  useCursor,
  Preload,
  useTexture,
  QuadraticBezierLine,
} from "@react-three/drei"
import { useMemo, useState, useRef, useEffect } from "react"
import { MettaMaterialImpl } from "../Materials/MettaMaterial"
import { useFrame, useThree } from "@react-three/fiber"

import { damp3, damp } from "maath/easing"

import { useControls } from "leva"
import { useStore } from "../store"

import * as THREE from "three"
import { Intro } from "../Intro"
import { mapLinear } from "three/src/math/MathUtils"

const sphereGeo = new THREE.SphereGeometry(1.55, 32, 32)
const v1 = new THREE.Vector3()
const v2 = new THREE.Vector3()
const mid = new THREE.Vector3()

const vec = new THREE.Vector3()
export function Owl() {
  const [chargeStarted, setChargeStarted] = useState(false)
  const lights = useRef([])
  const lineRefs = useRef([...Array(30)].map(() => useRef()))
  const owl = useGLTF("/glb/owl-transformed.glb")
  const fbo = useFBO(1024, 1024)
  const fbo2 = useFBO(2048, 2048)
  const mettaMaterial = useMemo(() => new MettaMaterialImpl({ fbo }), [fbo])
  const rightLensMaterial = useMemo(
    () => new MettaMaterialImpl({ fbo: fbo2 }),
    [fbo2]
  )

  const pointLight = useRef()
  const pointLight2 = useRef()
  const eyeLight = useRef()
  const normal = useTexture("/textures/kingfisher/normal.jpg")
  mettaMaterial.normalMap = normal
  rightLensMaterial.normalMap = normal

  const orbs = useRef([])
  const orbRiseSpeed = useRef(0)
  const orbOrbitSpeed = useRef(0)
  const orbitRadius = useRef(2)

  const startingMidRange = useRef(0)
  const midRange = useRef(0)
  const maxMidRange = useRef(10)

  const initialGearRotationSpeed = 0.2
  const gearRotationSpeed = useRef(initialGearRotationSpeed)

  const centerGear = useRef()

  const lightIntensityTarget = useRef(0)
  const maxLightIntensity = 0
  // const maxLightIntensity = 1000

  const targetPosition = useRef(owl.scene.position.clone())
  const targetRotationY = useRef(owl.scene.rotation.y)

  const started = useStore((state) => state.started)
  const [alreadyStarted, setAlreadyStarted] = useState(false)

  const charging = useRef(false)

  const controls = useThree((state) => state.controls)
  useEffect(() => {
    if (started && !alreadyStarted) {
      setAlreadyStarted(true)
      setTimeout(() => {
        lightIntensityTarget.current = maxLightIntensity
      }, 1000)

      setTimeout(() => {
        targetPosition.current.sub(new THREE.Vector3(2, 0, 30))
        targetRotationY.current = -0.1
      }, 1500)
    }
  }, [started])

  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  const api = useStore((state) => state.api)

  const lineOpacity = useRef(0)

  const { lightDecay } = useControls(
    "leftlens",
    {
      lightDecay: {
        value: 0.72,
        min: 0.1,
        max: 4,
        step: 0.01,
      },
      chromaticAberration: {
        value: 0.1,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => {
          mettaMaterial.chromaticAberration = v
        },
      },
      transmission: {
        value: 1,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => {
          mettaMaterial._transmission = v
        },
      },

      color: {
        value: "#009dc2",
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => {
          mettaMaterial.color.setStyle(v)
          lineRefs.current.forEach((lineRef) =>
            lineRef.current.material.color.setStyle(v)
          )
        },
      },
      thickness: {
        value: 0.8,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => {
          mettaMaterial.thickness = v
        },
      },
      distortion: {
        value: 0.4,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => {
          mettaMaterial.distortion = v
        },
      },
      distortionScale: {
        value: 3.7,
        min: 0,
        max: 10,
        step: 0.01,
        onChange: (v) => {
          mettaMaterial.distortionScale = v
        },
      },
      temporalDistortion: {
        value: 0.1,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => {
          mettaMaterial.temporalDistortion = v
        },
      },
      metalness: {
        value: 0.0,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => {
          mettaMaterial.metalness = v
        },
      },
      normalScale: {
        value: 0.16,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => {
          mettaMaterial.normalScale.set(v, v)
        },
      },
      lightIntensity: {
        value: 0,
        min: 0,
        max: 10000,
        step: 0.01,
        onChange: (v) => {
          lights.current.forEach((light) => {
            light.intensity = v
          })
        },
      },
    },
    [mettaMaterial]
  )

  useControls(
    "rightlens",
    {
      eyelightAngle: {
        value: 0.07,
        min: 0,
        max: Math.PI / 8,
        step: 0.01,
        onChange: (v) => {
          eyeLight.current.angle = v
        },
      },
      eyeLightIntensity: {
        value: 100,
        min: 0,
        max: 10000,
        step: 0.01,
        onChange: (v) => {
          eyeLight.current.intensity = v
        },
      },
      chromaticAberration: {
        value: 0.1,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => {
          rightLensMaterial.chromaticAberration = v
        },
      },
      transmission: {
        value: 1,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => {
          rightLensMaterial._transmission = v
        },
      },

      color: {
        value: "#009dc2",
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => {
          rightLensMaterial.color.setStyle(v)
        },
      },
      thickness: {
        value: 0.8,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => {
          rightLensMaterial.thickness = v
        },
      },
      distortion: {
        value: 0.16,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => {
          rightLensMaterial.distortion = v
        },
      },
      distortionScale: {
        value: 3.7,
        min: 0,
        max: 10,
        step: 0.01,
        onChange: (v) => {
          rightLensMaterial.distortionScale = v
        },
      },
      temporalDistortion: {
        value: 0.1,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => {
          rightLensMaterial.temporalDistortion = v
        },
      },
      metalness: {
        value: 0.0,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => {
          rightLensMaterial.metalness = v
        },
      },
      normalScale: {
        value: 0.08,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => {
          rightLensMaterial.normalScale.set(v, v)
        },
      },
    },
    [rightLensMaterial]
  )

  useEffect(() => {
    owl.scene.traverse((obj) => {
      if (obj.name === "LensLeft") {
        obj.material = mettaMaterial
        mettaMaterial.addObjectToIgnore(obj)
      }
      if (obj.name === "LensRight") {
        obj.material = rightLensMaterial
        rightLensMaterial.addObjectToIgnore(obj)
        eyeLight.current.position.copy(obj.getWorldPosition(v1))
        eyeLight.current.position.z += 1
        v1.x -= 0.055
        eyeLight.current.target.position.copy(v1)
        const spotLightHelper = new THREE.SpotLightHelper(eyeLight.current)
        // owl.scene.add(spotLightHelper)

        // obj.material = mettaMaterial
        // mettaMaterial.addObjectToIgnore(obj)
      }
      if (obj.name === "WingSpots") {
        obj.material = rightLensMaterial
        rightLensMaterial.addObjectToIgnore(obj)
      }
      if (obj.name.includes("FootOrb")) {
        obj.angle = 0
        if (obj.name === "FootOrb1") {
          obj.angleDirection = -1
          obj.angleOffset = -Math.PI
        } else {
          obj.angleDirection = 1
          obj.angleOffset = 0
        }
        obj.offset = obj.position.clone()

        if (obj.offset.x > 0) {
          obj.offset.x *= 0.7
        } else {
          obj.offset.x *= -2
        }
        orbs.current.push(obj)
        obj.material = mettaMaterial
        obj.geometry = sphereGeo
        mettaMaterial.addObjectToIgnore(obj)
      }
      if (obj.type === "PointLight") {
        lights.current.push(obj)
      }

      if (obj.name === "CenterGear") {
        centerGear.current = obj
        gearHitbox.current.position.copy(obj.position)
        gearHitbox.current.rotation.copy(obj.rotation)
      }
    })
  }, [])

  useFrame((state, delta) => {
    rightLensMaterial.update(state)
    mettaMaterial.update(state)

    lights.current.forEach((light) => {
      damp(light, "intensity", lightIntensityTarget.current, 1, delta)
    })

    damp3(owl.scene.position, targetPosition.current, 2, delta)

    if (
      centerGear.current &&
      charging.current &&
      gearRotationSpeed.current < 10
    ) {
      gearRotationSpeed.current -= delta * 10
    }

    if (orbs.current.length === 2) {
      mid.copy(orbs.current[0].getWorldPosition(v1))
      mid.add(orbs.current[1].getWorldPosition(v2))
      mid.divideScalar(2)
      const centerMid = mid.clone()

      const lineWidth = mapLinear(
        Math.sin(state.clock.elapsedTime * 20),
        -1,
        1,
        2,
        3
      )
      lineRefs.current.forEach((lineRef, index) => {
        const midOffset = mapLinear(
          index,
          0,
          lineRefs.current.length - 1,
          -midRange.current,
          midRange.current
        )
        mid.y = centerMid.y + midOffset
        lineRef.current.setPoints(v1, v2, mid)
        lineRef.current.material.linewidth = lineWidth
      })

      if (charging.current) {
        lineOpacity.current += delta
        if (midRange.current < maxMidRange.current) {
          midRange.current += delta * 3
        }
      }
      if (midRange.current > startingMidRange.current) {
        midRange.current *= 0.992
      }
    }
    if (lineOpacity.current > 0) {
      lineOpacity.current *= 0.98
    }
    lineRefs.current.forEach(
      (lineRef) => (lineRef.current.material.opacity = lineOpacity.current)
    )

    orbs.current.forEach((orb, index) => {
      if (charging.current) {
        if (orb.position.y < 4.5) {
          orbRiseSpeed.current += delta * 0.05
        }
        orbOrbitSpeed.current += delta * 0.02
        if (orbitRadius.current < 7) {
          orbitRadius.current += delta * 0.4
        }
      }
      if (charging.current && pointLight.current.intensity < 20) {
        pointLight.current.intensity += delta * 10
        pointLight2.current.intensity += delta * 10
      }
      if (pointLight.current.intensity > 0) {
        pointLight.current.intensity *= 0.99
        pointLight2.current.intensity *= 0.99
      }
      orbRiseSpeed.current *= 0.99
      orbOrbitSpeed.current *= 0.98

      orb.position.y += orbRiseSpeed.current

      orb.angle += orbOrbitSpeed.current * orb.angleDirection // Calculate the angle based on the speed
      orb.position.x =
        orbitRadius.current * Math.cos(orb.angle + orb.angleOffset) +
        orb.offset.x
      orb.position.z =
        orbitRadius.current * Math.sin(orb.angle + orb.angleOffset) +
        orb.offset.z

      if (index === 0) {
        pointLight.current.position.copy(orb.position)
      }
      if (index === 1) {
        pointLight2.current.position.copy(orb.position)
      }
    })
    if (Math.abs(gearRotationSpeed.current) > initialGearRotationSpeed) {
      gearRotationSpeed.current *= 0.99
    }

    if (centerGear.current) {
      centerGear.current.rotation.z += gearRotationSpeed.current * delta
    }

    if (controls) {
      // controls.target.copy(owl.scene.position)
    }
    damp(owl.scene.rotation, "y", targetRotationY.current, 5, delta, 1)

    if (!chargeStarted) {
      const intensity = mapLinear(
        Math.sin(state.clock.elapsedTime * 2),
        -1,
        1,
        1000,
        10000
      )
      eyeLight.current.intensity = intensity
    } else {
      if (charging.current) {
        eyeLight.current.intensity += delta * 10000
      }
      eyeLight.current.intensity *= 0.99
    }
  })

  const hitbox = useRef()
  const gearHitbox = useRef()

  function startCharge() {
    charging.current = true
    if (!chargeStarted) {
      setChargeStarted(true)
      api.playActivate()
    }
    api.playMagnetized()
  }

  function release() {
    charging.current = false
    // gearRotationSpeed.current *= -1
    api.stopMagnetized()
  }

  return (
    <>
      <primitive object={owl.scene}>
        <mesh
          position-z={0.05}
          ref={hitbox}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onPointerDown={() => {
            if (started) return
            api.start()
          }}
          visible={false}
        >
          <circleGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial color="red" />
        </mesh>
        <mesh
          ref={gearHitbox}
          onPointerEnter={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onPointerDown={() => {
            startCharge()
          }}
          onPointerUp={() => {
            release()
          }}
        >
          <circleGeometry args={[1.3, 16, 16]} />
          <meshBasicMaterial color="red" visible={false} />
        </mesh>
        <Intro />
      </primitive>
      {lineRefs.current.map((lineRef, index) => (
        <QuadraticBezierLine
          key={index}
          // lineWidth={100}
          ref={lineRef}
          transparent
          opacity={0}
        />
      ))}
      <pointLight ref={pointLight} color={"#009dc2"} decay={lightDecay} />
      <pointLight ref={pointLight2} decay={lightDecay} color={"#00c280"} />
      <spotLight ref={eyeLight} color={"#ffffff"} penumbra={1} />
    </>
  )
}

useGLTF.preload("/glb/owl-transformed.glb")
