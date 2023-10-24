uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
varying float vAlpha;

uniform sampler2D texture1;
float PI = 3.1415926;

attribute float offset;
attribute float life;

uniform vec2 uMouse;

attribute float angle;

void main () {
	vUv = uv;

	float current = mod(offset + time / 1., life);
	float percent = current / life;


	vec3 newpos = position;


	vAlpha = smoothstep(0., 0.05, percent);
	vAlpha -= smoothstep(0.85, 1., percent);

	float dir = angle + sin(time / 10.) * 0.2;

	newpos.x += cos(dir) * current * .15;
	newpos.y += sin(dir) * current * .15;

	vec3 curpos = newpos;
	float mouseRadius = 0.35;
	float dist = distance(curpos.xy, uMouse);
	float strength = dist/mouseRadius;
	strength =  1. - smoothstep(0., 1., strength);
	float dx = uMouse.x - curpos.x;
	float dy = uMouse.y - curpos.y;
	float angleangle = atan(dy, dx);

	newpos.x += cos(angleangle) * strength * 0.5;
	newpos.y += sin(angleangle) * strength * 0.5;



	vec4 mvPosition = modelViewMatrix * vec4(newpos, 1.);
	gl_PointSize = 30. * ( 1. / -mvPosition.z);
	gl_Position = projectionMatrix * mvPosition;
}