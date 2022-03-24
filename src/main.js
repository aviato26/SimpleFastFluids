
import * as THREE from 'three';
import css from './css/style.css';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';
import fluidFrag from './shaders/fluidFrag.js';
import finalFrag from './shaders/finalFrag.js';
import vertex from './shaders/vertex.js';

export default class Main
{
  constructor()
  {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.mouse = {x: this.width / 2, y: this.height / 2};

    // if screen is larger than tablet we will index 1 to select larger img
    this.screenSize = (this.width < 768) ? 0 : 1;

    this.time = 0.0;

    this.animate = this.animate.bind(this);
    this.scene_setup();
    this.buffer_texture_setup();

    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = this.height - e.clientY;
    })

    document.addEventListener('mousedown', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = this.height - e.clientY;
      this.mouse.z = 1.0
    })

    document.addEventListener('mouseup', (e) => {
      this.mouse.z = 0.0
    })

    // mobile events
    document.addEventListener('touchmove', (e) => {
      //this.mouse.x = e.clientX;
      this.mouse.x = e.changedTouches[0].clientX;
      this.mouse.y = this.height - e.changedTouches[0].clientY;
    })

    document.addEventListener('touchstart', (e) => {
      this.mouse.x = e.changedTouches[0].clientX;
      this.mouse.y = this.height - e.changedTouches[0].clientY;
      this.mouse.z = 1.0;
    })

    document.addEventListener('touchend', (e) => {
      this.mouse.z = 0.0;
    })

    this.animate();
  }

  scene_setup(){
		//This is the basic scene setup
		this.scene = new THREE.Scene();

		//Note that we're using an orthographic camera here rather than a prespective
		this.camera = new THREE.OrthographicCamera( this.width / - 2, this.width / 2, this.height / 2, this.height / - 2, 1, 1000 );
		this.camera.position.z = 2;

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize( this.width, this.height );
    //this.renderer.setPixelRatio(document.devicePixelRatio)
		document.body.appendChild( this.renderer.domElement );
  }


  buffer_texture_setup(){
		//Create buffer scene
		this.buffer1Scene = new THREE.Scene();
		this.buffer2Scene = new THREE.Scene();


    this.pass1 = new THREE.WebGLRenderTarget( this.width, this.height,
      // each pass needs these setting or simulation will not work, im guessing the pixel to pixel length is off and all the passes become unstable
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        stencilBuffer: false
      });

    this.pass2 = new THREE.WebGLRenderTarget( this.width, this.height,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        stencilBuffer: false
      });


    this.material1 = new THREE.ShaderMaterial( {
			uniforms: {
			 bufferTexture: { type: "t", value: null },
			 res : {type: 'v2',value:new THREE.Vector2(this.width,this.height)},//Keeps the resolution
       mouse: { type: 'v2', value: new THREE.Vector4(this.mouse.x, this.mouse.y, 0, 0)},
       iTime: { type: 'f', value: 0.0},
			},
      vertexShader: vertex.vertex,
			fragmentShader: fluidFrag.fluidFrag
		} );

    this.material2 = new THREE.ShaderMaterial( {
			uniforms: {
			 bufferTexture: { type: "t", value: null },
			 res : {type: 'v2',value:new THREE.Vector2(this.width,this.height)},//Keeps the resolution
       mouse: { type: 'v2', value: new THREE.Vector4(this.mouse.x, this.mouse.y, 0, 0)},
       iTime: { type: 'f', value: 0.0},
			},
      vertexShader: vertex.vertex,
			fragmentShader: fluidFrag.fluidFrag
		} );

    this.renderedMaterial = new THREE.ShaderMaterial( {
      uniforms: {
       bufferTexture: { type: "t", value: null},
       //imgTexture: { type: "t", value: this.img[this.screenSize]},
       res : {type: 'v2',value:new THREE.Vector2(this.width,this.height)},//Keeps the resolution
      },
      vertexShader: vertex.vertex,
      fragmentShader: finalFrag.finalFrag
    } );

		this.plane = new THREE.PlaneBufferGeometry( this.width, this.height );

		this.bufferP1 = new THREE.Mesh( this.plane, this.material1 );
		this.bufferP2 = new THREE.Mesh( this.plane, this.material2 );

    this.buffer1Scene.add(this.bufferP1);
    this.buffer2Scene.add(this.bufferP2);

    this.finalMesh = new THREE.Mesh(this.plane, this.renderedMaterial);

    this.scene.add(this.finalMesh)

  }


  		//Render everything!
  		animate() {
  		  requestAnimationFrame( this.animate );

  		  this.material1.uniforms.mouse.value.x = this.mouse.x;
  		  this.material1.uniforms.mouse.value.y = this.mouse.y;
  		  this.material1.uniforms.mouse.value.z = this.mouse.z;

  		  //this.advectionMaterial.uniforms.mouse.value.w = 1.0;

        this.time += 0.1;

        this.material1.uniforms.iTime.value = this.time;

        // rendering the render targets to the scenes
        this.renderer.setRenderTarget(this.pass1);
        this.renderer.render(this.buffer1Scene, this.camera);
        this.renderer.setRenderTarget(null);
        this.renderer.clear();

        this.renderer.setRenderTarget(this.pass2);
        this.renderer.render(this.buffer2Scene, this.camera);
        this.renderer.setRenderTarget(null);
        this.renderer.clear();

        // as we enter the rendered pass to the shaders the will execute and now we can switch the texture and chain them together to preserve state
        this.material1.uniforms.bufferTexture.value = this.pass2.texture;
        this.material2.uniforms.bufferTexture.value = this.pass1.texture;

        // now we use this material as the final texture to render to the screen
        this.renderedMaterial.uniforms.bufferTexture.value = this.pass2.texture;

  		  this.renderer.render( this.scene, this.camera );
  		}

}

new Main();
