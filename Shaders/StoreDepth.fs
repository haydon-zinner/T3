precision highp float;
varying highp vec4 depthC;
vec4 pack (float depth)
{
	const vec4 bias = vec4(1.0 / 256.0,
							1.0 / 256.0,
							1.0 / 256.0,
							0.0);

	float r = depth;
	float g = fract(r * 256.0);
	float b = fract(g * 256.0);
	float a = fract(b * 256.0);
	vec4 colour = vec4(r, g, b, a);
	
	return colour - (colour.yzww * bias);
}
void main()
{
	float depth = depthC.z / depthC.w;   // distance between the vertex and light source, 32 bit floating point value

	gl_FragColor = pack(depth);   //vec4(depth,depth,depth,1);  
} 
