import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/* Esfera canelada e torcida da ref 1, no roxo da marca.
   Gomos estufados com vinco fino: r = 1 - a·(1 - √|sen(6·(lon + torção·lat))|). */
function flutedSphere() {
  let g: THREE.BufferGeometry = new THREE.SphereGeometry(1, 320, 200)
  g.deleteAttribute('normal'); g.deleteAttribute('uv')
  g = mergeVertices(g)
  const pos = g.attributes.position as THREE.BufferAttribute
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const lat = Math.asin(THREE.MathUtils.clamp(v.y, -1, 1))
    const lon = Math.atan2(v.z, v.x)
    const lobe = Math.sqrt(Math.abs(Math.sin(6 * (lon + 1.25 * lat))))
    const r = 1 - 0.13 * Math.cos(lat) * (1 - lobe)
    v.multiplyScalar(r)
    pos.setXYZ(i, v.x, v.y * 0.94, v.z)
  }
  g.computeVertexNormals()
  return g
}

export default function Orb() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05

    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env

    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50)
    camera.position.set(0, 1.1, 6.4)
    camera.lookAt(0, -0.15, 0)

    const geo = flutedSphere()
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x5326f0, roughness: 0.32, metalness: 0.05,
      clearcoat: 1, clearcoatRoughness: 0.18,
      sheen: 0.8, sheenColor: new THREE.Color(0xb49cff), sheenRoughness: 0.45,
      envMapIntensity: 0.55,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.y = -0.7
    mesh.scale.setScalar(1.5)
    mesh.rotation.z = 0.12
    scene.add(mesh)

    scene.add(new THREE.AmbientLight(0x241a55, 0.8))
    const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(-2.5, 4, 3); scene.add(key)
    const rim = new THREE.PointLight(0xa98fff, 40, 12); rim.position.set(2.2, 1.6, -1.5); scene.add(rim)
    const fill = new THREE.PointLight(0x4d6bff, 14, 10); fill.position.set(-2.5, -0.5, 2); scene.add(fill)

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas.parentElement!
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.render(scene, camera)
    }
    const ro = new ResizeObserver(resize); ro.observe(canvas.parentElement!)
    resize()

    /* Só gira quando está na tela: fora dela, zero custo de GPU. */
    let raf = 0, visible = false, last = performance.now()
    const tick = (t: number) => {
      mesh.rotation.y += (t - last) * 0.00018
      last = t
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      cancelAnimationFrame(raf)
      if (visible && !reduced) { last = performance.now(); raf = requestAnimationFrame(tick) }
    })
    io.observe(canvas)

    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect()
      geo.dispose(); mat.dispose(); env.dispose(); pmrem.dispose(); renderer.dispose()
    }
  }, [])

  return <canvas ref={ref} aria-hidden className="absolute inset-0 h-full w-full" />
}
