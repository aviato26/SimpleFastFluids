

exports.finalFrag =
`

// this code was from https://www.shadertoy.com/view/XlsBDf, written by davidar

uniform sampler2D bufferTexture;
uniform sampler2D tex;
varying vec2 vUv;

#define PI 3.141592653589793

void main() {
  vec2 uv = vUv;


  // this is the texture from the fluidFrag, computation is done in the fluidFrag and values are stored in the texture (texturePosition) then passed to this frag shader to be rendered
  //vec3 pos2 = texture(texturePosition, uv).xyz;

  vec4 o = vec4(0.0);
  //vec4 o = texture(tex, uv);

  vec4 c = texture(bufferTexture, uv);

  o.rgb = .6 + .6 * cos(6.3 * atan(c.y,c.x)/(2.*PI) + vec3(0,23,21)); // velocity
  o.rgb *= c.w * 1.6; // ink
  o.rgb += clamp(c.z - 1., 0., 1.) / 20.0; // local fluid density
  o.a = 1.;

  gl_FragColor = o;
  //gl_FragColor = vec4(pos, 1.0);
}

`
