import { Canvas } from "@react-three/fiber"
import { Leva, useControls } from "leva"
import React from "react"
import ReactDOM from "react-dom/client"
import Scene from "./Scene"
import { Perf } from "r3f-perf"
import * as THREE from "three"
import "./App.css"
import { Suspense } from "react"
import { useStore } from "./canvas/store"

import { KeyboardControls, OrbitControls } from "@react-three/drei"
export default function App() {
  const api = useStore((state) => state.api)
  api.loaded()

  return (
    <KeyboardControls
      map={[
        { name: "forward", keys: ["KeyW"] },
        { name: "backward", keys: ["KeyS"] },
        { name: "left", keys: ["KeyA"] },
        { name: "right", keys: ["KeyD"] },
        { name: "jump", keys: ["Space"] },
        { name: "boost", keys: ["ShiftLeft"] },
        { name: "rollLeft", keys: ["KeyQ"] },
        { name: "rollRight", keys: ["KeyE"] },
        { name: "toggleControls", keys: ["c"] },
        { name: "toggleUI", keys: ["Escape"] },
      ]}
    >
      <Leva
        collapsed={false}
        oneLineLabels={false}
        flat={true}
        // hidden
        theme={{
          sizes: {
            titleBarHeight: "28px",
          },
          fontSizes: {
            root: "10px",
          },
        }}
      />
      <Suspense fallback={null}>
        <Canvas
          dpr={[1, 1.5]}
          gl={{}}
          camera={{
            fov: 60,
            near: 0.1,
            far: 200,
            position: [0, 0, 0.55],
          }}
        >
          <Scene />
          {/* <Perf position="top-left" /> */}
          <OrbitControls
            enabled={false}
            makeDefault
            zoomSpeed={0.3}
            dampingFactor={0.3}
            rotateSpeed={0.5}
            enableDamping
          />
          <color attach="background" args={["#000000"]} />
        </Canvas>
      </Suspense>
    </KeyboardControls>
  )
}

const rootElement = document.getElementById("root")

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}
