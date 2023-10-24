import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader' 
import GUI from 'lil-gui'
import gsap from 'gsap'
import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertexParticles.glsl'
 
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass'
import {GlitchPass} from 'three/examples/jsm/postprocessing/GlitchPass'
export default class Sketch {
	constructor(options) {
		
		this.scene = new THREE.Scene()
		
		this.container = options.dom
		
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		
		
		// // for renderer { antialias: true }
		this.renderer = new THREE.WebGLRenderer({ antialias: true,
		preserveDrawingBuffer: true,
			alpha: true,
		})
		this.renderer.autoClear = false
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height)
		this.renderer.setSize(this.width ,this.height )
		this.renderer.setClearColor(0xeeeeee, 1)
		this.renderer.useLegacyLights = true
		this.renderer.outputEncoding = THREE.sRGBEncoding
 

		 
		this.renderer.setSize( window.innerWidth, window.innerHeight )

		this.container.appendChild(this.renderer.domElement)
 


		this.camera = new THREE.PerspectiveCamera( 70,
			 this.width / this.height,
			 0.01,
			 1000
		)
 
		this.camera.position.set(0, 0, 2) 
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		this.time = 0

		this.raycaster = new THREE.Raycaster()
		this.mouse = new THREE.Vector2()


		this.dracoLoader = new DRACOLoader()
		this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
		this.gltf = new GLTFLoader()
		this.gltf.setDRACOLoader(this.dracoLoader)

		this.isPlaying = true

		this.addObjects()		 
		this.resize()
		this.render()
		this.setupResize()

		this.mouseMove()
	}
	mouseMove() {
		let self = this

		function onMouseMove(e) {
			self.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
			self.mouse.y = - (e.clientY / window.innerHeight) * 2 + 1


			self.raycaster.setFromCamera(self.mouse, self.camera)

			const intersects = self.raycaster.intersectObjects([self.clearPlane])
			if(intersects[0]) {
				let p = intersects[0].point
				self.material.uniforms.uMouse.value = new THREE.Vector2(p.x, p.y)
			}

		}
		window.addEventListener('mousemove', onMouseMove)
	}

	settings() {
		let that = this
		this.settings = {
			progress: 0
		}
		this.gui = new GUI()
		this.gui.add(this.settings, 'progress', 0, 1, 0.01)
	}

	setupResize() {
		window.addEventListener('resize', this.resize.bind(this))
	}

	resize() {
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		this.renderer.setSize(this.width, this.height)
		this.camera.aspect = this.width / this.height


		this.imageAspect = 853/1280
		let a1, a2
		if(this.height / this.width > this.imageAspect) {
			a1 = (this.width / this.height) * this.imageAspect
			a2 = 1
		} else {
			a1 = 1
			a2 = (this.height / this.width) / this.imageAspect
		} 


		this.material.uniforms.resolution.value.x = this.width
		this.material.uniforms.resolution.value.y = this.height
		this.material.uniforms.resolution.value.z = a1
		this.material.uniforms.resolution.value.w = a2

		this.camera.updateProjectionMatrix()



	}


	addObjects() {
		let that = this
		this.material = new THREE.ShaderMaterial({
			extensions: {
				derivatives: '#extension GL_OES_standard_derivatives : enable'
			},
			side: THREE.DoubleSide,
			uniforms: {
				time: {value: 0},
				uMouse: {value: new THREE.Vector2(0,0)},
				resolution: {value: new THREE.Vector4()}
			},
			vertexShader,
			fragmentShader,
			transparent: true,
			depthTest: false,
			depthWrite:false
		})
		
		this.geometry = new THREE.BufferGeometry()
	 
		let num = 20000

		let positions = new Float32Array(num * 3)
		let angle = new Float32Array(num)
		let life = new Float32Array(num)
		let offset = new Float32Array(num)



		for (let i = 0; i < num; i++) {
			positions.set([Math.random() * 0.1,
				Math.random() * 0.1,
				Math.random() * 0.1
			], 3 * i)
						
			life.set([4 + Math.random() * 10], i)
			offset.set([1000 * Math.random()], i)
			angle.set([Math.random() * Math.PI * 2], i
 

			)
		}
  
		this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
		this.geometry.setAttribute('angle', new THREE.BufferAttribute(angle, 1))
		this.geometry.setAttribute('life', new THREE.BufferAttribute(life, 1))
		this.geometry.setAttribute('offset', new THREE.BufferAttribute(offset, 1))

		this.dots = new THREE.Points(this.geometry, this.material)
 
		this.scene.add(this.dots)


		this.clearPlane = new THREE.Mesh(
			new THREE.PlaneGeometry(7,7),
			new THREE.MeshBasicMaterial({
				transparent: true,
				color:0x0000ff,
				opacity:0.1
			})
		)
		this.scene.add(this.clearPlane)
 
	}



	addLights() {
		const light1 = new THREE.AmbientLight(0xeeeeee, 0.5)
		this.scene.add(light1)
	
	
		const light2 = new THREE.DirectionalLight(0xeeeeee, 0.5)
		light2.position.set(0.5,0,0.866)
		this.scene.add(light2)
	}

	stop() {
		this.isPlaying = false
	}

	play() {
		if(!this.isPlaying) {
			this.isPlaying = true
			this.render()
		}
	}

	render() {
		if(!this.isPlaying) return
		this.time += 0.05
		this.material.uniforms.time.value = this.time
		 
		//this.renderer.setRenderTarget(this.renderTarget)
		this.renderer.render(this.scene, this.camera)
		//this.renderer.setRenderTarget(null)
 
		requestAnimationFrame(this.render.bind(this))
	}
 
}
new Sketch({
	dom: document.getElementById('container')
})
 