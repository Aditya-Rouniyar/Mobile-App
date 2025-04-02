import React from 'react'
import { useGLTF } from '@react-three/drei/native'

const Model = () => {
  const { scene } = useGLTF(require('../assets/3d/planets/planet_1.glb'))
  return <primitive object={scene} scale={0.5} />
}

export default Model
