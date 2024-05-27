import { create } from "zustand"
import * as THREE from "three"
import { addEffect } from "@react-three/fiber"

const mockData = () => ({ signal: false, avg: 0, gain: 1, data: [] })

export const useStore = create((set, get) => {
  const initialize = createAudio("/audio/initialize.mp3", {
    threshold: 10,
    expire: 500,
  })
  const activate = createAudio("/audio/activate.mp3", {
    threshold: 10,
    expire: 500,
  })
  const magnetized = createAudio("/audio/magnetized.mp3", {
    threshold: 10,
    expire: 500,
    loop: true,
  })

  return {
    timeDilation: 1,
    started: false,
    uiEnabled: true,
    cubeCam: null,
    setCubeCam: (cam) => set({ cubeCam: cam }),
    setUiEnabled: (enabled) => set({ uiEnabled: enabled }),
    audio: {
      initialize: mockData(),
    },
    api: {
      async loaded() {
        set({
          loaded: true,
          audio: {
            initialize: await initialize,
            activate: await activate,
            magnetized: await magnetized,
          },
        })
      },
      start() {
        const audio = get().audio
        const files = Object.values(audio)
        files[0].source.start(0)
        files[2].source.start(0)
        files[2].gainNode.gain.value = 0.0
        set({ started: true })
        addEffect(() => {
          //   files.forEach(({ update }) => update());  // NOTE: uncomment for audio analysis
        })
      },
      playActivate() {
        const audio = get().audio
        const files = Object.values(audio)
        files[1].source.start(0)
      },
      playMagnetized() {
        const audio = get().audio
        const files = Object.values(audio)
        files[2].gainNode.gain.linearRampToValueAtTime(
          1,
          files[2].context.currentTime + 1
        )
      },
      stopMagnetized() {
        const audio = get().audio
        const files = Object.values(audio)
        files[2].gainNode.gain.linearRampToValueAtTime(
          0.01,
          files[2].context.currentTime + 1
        )
      },
    },
  }
})

async function createAudio(url, { threshold, expire, loop = false } = {}) {
  const res = await fetch(url)
  const buffer = await res.arrayBuffer()
  const context = THREE.AudioContext.getContext()
  const analyser = context.createAnalyser()
  analyser.fftSize = 1024
  const data = new Uint8Array(analyser.frequencyBinCount)
  const source = context.createBufferSource()
  source.buffer = await new Promise((res) =>
    context.decodeAudioData(buffer, res)
  )
  source.loop = loop
  const gainNode = context.createGain()
  gainNode.gain.value = 0.7
  // gainNode.gain.value = 0.0;

  gainNode.connect(context.destination)
  source.connect(analyser)
  analyser.connect(gainNode)

  let time = Date.now()
  let state = {
    source,
    data,
    gainNode,
    gain: 1,
    context,
    signal: false,
    avg: 0,
    update: () => {
      let now = Date.now()
      let value = 0
      analyser.getByteFrequencyData(data)
      for (let i = 0; i < data.length; i++) value += data[i]
      const avg = (state.avg = value / data.length)
      if (threshold && avg > threshold && now - time > expire) {
        time = Date.now()
        state.signal = true
      } else state.signal = false
    },
    setGain(level) {
      gainNode.gain.setValueAtTime((state.gain = level), context.currentTime)
    },
  }

  return state
}
