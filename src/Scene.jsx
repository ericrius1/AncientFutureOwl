import React from "react"
import Birds from "./canvas/Effects/Birds.jsx"

import { EpicEnvironment } from "./canvas/EpicEnvironment.jsx"
import { Owl } from "./canvas/Owl/Owl.jsx"
export default function Scene(props) {
  return (
    <>
      <EpicEnvironment />
      <Owl />
      <Birds />
    </>
  )
}
