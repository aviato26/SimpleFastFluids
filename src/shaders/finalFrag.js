

exports.finalFrag =
`

// this code was from https://www.shadertoy.com/view/XlsBDf, written by davidar

uniform sampler2D positionTexture;
uniform sampler2D texturePosition;
uniform sampler2D tex;
varying vec2 vUv;

#define PI 3.141592653589793

void main() {
  vec2 uv = vUv;
  vec2 v = vUv;
  //vec3 pos = texture(tex, v).xyz;

  // this is the texture from the fluidFrag, computation is done in the fluidFrag and values are stored in the texture (texturePosition) then passed to this frag shader to be rendered
  //vec3 pos2 = texture(texturePosition, uv).xyz;

  vec4 o = vec4(0.0);

  vec4 c = texture(texturePosition, uv);

  o.rgb = .6 + .6 * cos(6.3 * atan(c.y,c.x)/(2.*PI) + vec3(0,23,21)); // velocity
  o.rgb *= c.w / 5.0; // ink
  o.rgb += clamp(c.z - 1., 0., 1.)/10.; // local fluid density
  o.a = 1.;

  gl_FragColor = o;
  //gl_FragColor = vec4(pos, 1.0);
}

`
