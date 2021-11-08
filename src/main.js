
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
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    this.scene.background = new THREE.Color(0xffffff);

    // resolution for the gpgpu renderer
    this.size = 330;
    this.segments = this.size - 1;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( this.renderer.domElement );

    // counter that is placed for the iTime variable for fluid simulation
    this.counter = 0.0;

    // size of the plane geometry
    this.width = 10;
    this.height = 8;

    // will be used and updated for mouse positions
    this.mouse = new THREE.Vector2();

    this.geometry = new THREE.PlaneGeometry(this.width, this.height, this.segments, this.segments);

    this.material = new THREE.ShaderMaterial(
      {
        uniforms:
        {
          positionTexture: { value: null }
        },
        vertexShader: vertex.vertex,
        fragmentShader: finalFrag.finalFrag
      }
    );
    this.cube = new THREE.Mesh( this.geometry, this.material );
    this.scene.add( this.cube );

    this.camera.position.z = 5;

    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX / 4;
      this.mouse.y = e.clientY / 2;

      //this.mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
      //this.mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
    })

    this.animate = this.animate.bind(this);

    this.initGPGPU();

    this.animate();
  }


  initGPGPU()
  {
    this.gpgpu = new GPUComputationRenderer(this.size, this.size, this.renderer);

    this.dtPosition = this.gpgpu.createTexture();

    //this.dtPosition.flipY = true;

    this.fillPositions(this.dtPosition);

    this.material.uniforms.positionTexture.value = this.dtPosition.texture
    this.positionVariable = this.gpgpu.addVariable('texturePosition', fluidFrag.fluidFrag, this.dtPosition);

    this.positionUniforms = this.positionVariable.material.uniforms;

    this.positionUniforms['iTime'] = { value: 0.0 };
    this.positionUniforms['mouse'] = { value: this.mouse };

    // setting resolution to the size of the gpgpu renderer
    this.positionUniforms['res'] = { value: new THREE.Vector2(this.size, this.size) };

    this.gpgpu.setVariableDependencies(this.positionVariable, [this.positionVariable]);

    this.positionVariable.wrapS = THREE.RepeatWrapping;
    this.positionVariable.wrapT = THREE.RepeatWrapping;

    this.gpgpu.init();
  }

  fillPositions(texture)
  {

    // this function is taking the boxGeometry positions and copying them over to the newly created datatextures for the gpgpu renderer class
    let data = texture.image.data;

    let geometryPosition = this.geometry.attributes.position.array;

    let x,y,z;

    for(let i = 0, index = 0; i < data.length; i += 4, index += 3)
    {

      // switching the coordinates of the vertices of the y and z position, i cant seem to import different positions from the blender models so this is the work around for now
      x = geometryPosition[index];
      z = geometryPosition[index + 1];
      y = geometryPosition[index + 2];

      // assigning position values, the texture uses 4 numbers for every particle
      data[i] = x;
      data[i + 1] = y;
      data[i + 2] = z;
      data[i + 3] = 0;
    }

  }


  animate(){
    requestAnimationFrame( this.animate );

    this.gpgpu.compute();

    // adding the render targets to our material uniforms to kick things off
    this.material.uniforms.positionTexture.value = this.gpgpu.getCurrentRenderTarget(this.positionVariable).texture;

    // time step for fluid sim
    this.counter += 1.1;
    
    this.positionUniforms['iTime'] = { value: this.counter };
    this.positionUniforms['mouse'] = { value: this.mouse };

    this.material.needsUpdate = true;

    this.renderer.render( this.scene, this.camera );
  };

}

new Main();
