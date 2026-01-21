import * as THREE from 'three'

// Canvas
const canvas = document.querySelector('#webgl')

// Scene
const scene = new THREE.Scene()

// Object
// Cube with Edges
const geometryCube = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2)
const materialCube = new THREE.MeshStandardMaterial({ color: 0x4488ff, wireframe: false })
const cube = new THREE.Mesh(geometryCube, materialCube)
scene.add(cube)
const edges = new THREE.EdgesGeometry(geometryCube)
const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 }))
cube.add(line)

// Grid Stage
const gridHelper = new THREE.GridHelper(20, 20, 0xff8844, 0xdd6633)
gridHelper.position.y = - 2
scene.add(gridHelper)

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
directionalLight.position.set(5, 10, 7.5)
scene.add(directionalLight)

const pointLight = new THREE.PointLight(0xff69b4, 5.0)
pointLight.position.set(-1, -1, -1)
scene.add(pointLight)


// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 2
scene.add(camera)

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Animate
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    cube.rotation.y = 0.5 * elapsedTime
    cube.rotation.x = 0.2 * elapsedTime

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

setTimeout(() => {
    toggleLoadingScreen(false);
}, 500);