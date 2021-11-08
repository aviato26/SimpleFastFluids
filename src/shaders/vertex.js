

exports.vertex =
`
  uniform sampler2D positionTexture;
  varying vec2 vUv;

  void main()
  {
      vUv = uv;

      vec3 pos = texture(positionTexture, vUv).xyz;

      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

      //gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      gl_PointSize = 4.0;
  }

`
