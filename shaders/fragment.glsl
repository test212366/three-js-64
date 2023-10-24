uniform float time;
uniform float progress;
uniform sampler2D texture1;
varying float vAlpha;

uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.1415926;
void main() {
 	float d = length(gl_PointCoord - vec2(.5));
	float a = 1. - smoothstep(0., 0.5 ,d);
	gl_FragColor = vec4(1, 0., 0., a);
}