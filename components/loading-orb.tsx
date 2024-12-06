'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const LoadingOrb = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Configuración básica
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(200, 200)
    containerRef.current.appendChild(renderer.domElement)

    // Crear geometría compleja
    const geometry = new THREE.IcosahedronGeometry(1, 4)
    
    // Shader personalizado para el efecto de distorsión
    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform float time;
      
      void main() {
        vNormal = normal;
        vPosition = position;
        
        // Efecto de ondulación
        float displacement = sin(position.x * 5.0 + time) * 
                           sin(position.y * 5.0 + time) * 
                           sin(position.z * 5.0 + time) * 0.1;
        
        vec3 newPosition = position + normal * displacement;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `

    const fragmentShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform float time;
      
      void main() {
        // Efecto de gradiente basado en la normal
        vec3 baseColor = vec3(0.31, 0.27, 0.90); // #4f46e5 en RGB normalizado
        vec3 highlightColor = vec3(0.6, 0.5, 1.0);
        
        float fresnel = pow(1.0 - dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 2.0);
        vec3 finalColor = mix(baseColor, highlightColor, fresnel);
        
        // Efecto de pulso
        float pulse = sin(time) * 0.5 + 0.5;
        finalColor = mix(finalColor, highlightColor, pulse * 0.3);
        
        gl_FragColor = vec4(finalColor, 0.8);
      }
    `

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
    })

    const sphere = new THREE.Mesh(geometry, material)
    scene.add(sphere)

    // Luces
    const light1 = new THREE.PointLight(0xffffff, 1, 100)
    light1.position.set(2, 2, 2)
    scene.add(light1)

    const light2 = new THREE.PointLight(0x4f46e5, 1, 100)
    light2.position.set(-2, -2, -2)
    scene.add(light2)

    scene.add(new THREE.AmbientLight(0xffffff, 0.5))

    camera.position.z = 3

    // Animación
    let time = 0
    const animate = () => {
      requestAnimationFrame(animate)
      time += 0.03

      // Actualizar uniforms del shader
      material.uniforms.time.value = time

      // Rotación suave
      sphere.rotation.x = Math.sin(time * 0.5) * 0.5
      sphere.rotation.y += 0.005

      renderer.render(scene, camera)
    }

    animate()

    // Cleanup
    return () => {
      containerRef.current?.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={containerRef} className="flex items-center justify-center h-[500px]" />
}

export default LoadingOrb 