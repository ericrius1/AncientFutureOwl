import { Text } from "@react-three/drei"
import { useMemo, useState, useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { damp } from "maath/easing"
import { useStore } from "./store"

import * as THREE from "three"

export function Intro() {
  const textRef = useRef()
  const started = useStore((state) => state.started)
  const targetScaleY = useRef(1)
  useEffect(() => {
    if (started) {
      targetScaleY.current = 0.0
    }
  }, [started])

  useFrame((state, delta) => {
    damp(textRef.current.scale, "y", targetScaleY.current, 0.4, delta)
  })

  return (
    <>
      <Text
        ref={textRef}
        // visible={!started}
        fontSize={0.09}
        position={[0.0, 0, -0.1]}
        characters={"abcdefghijklmnopqrstuvwxyz"}
        // ref={textRef}
        // material={mettaMaterial}
      >
        Initialize
      </Text>
    </>
  )
}
