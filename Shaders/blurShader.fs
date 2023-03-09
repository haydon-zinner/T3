precision highp float;
varying vec2 varyTextureCoordinate;

uniform vec2 ScaleU;
uniform sampler2D textureSource;
float unpack (vec4 colour)
{
	const vec4 bitShifts = vec4(1.0,
								1.0 / 256.0,
								1.0 / (256.0 * 256.0),
								1.0 / (256.0 * 256.0 * 256.0));
	return dot(colour, bitShifts);
} 
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
	
	float color= 0.0;
	color += unpack(texture2D( textureSource, varyTextureCoordinate + vec2( -3.0*ScaleU.x, -3.0*ScaleU.y ) )) * 0.015625;
	color += unpack(texture2D( textureSource, varyTextureCoordinate + vec2( -2.0*ScaleU.x, -2.0*ScaleU.y ) ))*0.09375;
	color += unpack(texture2D( textureSource, varyTextureCoordinate + vec2( -1.0*ScaleU.x, -1.0*ScaleU.y ) ))*0.234375;
	color += unpack(texture2D( textureSource, varyTextureCoordinate + vec2( 0.0 , 0.0) ))*0.3125;
	color += unpack(texture2D( textureSource, varyTextureCoordinate + vec2( 1.0*ScaleU.x,  1.0*ScaleU.y ) ))*0.234375;
	color += unpack(texture2D( textureSource, varyTextureCoordinate + vec2( 2.0*ScaleU.x,  2.0*ScaleU.y ) ))*0.09375;
	color += unpack(texture2D( textureSource, varyTextureCoordinate + vec2( 3.0*ScaleU.x, 3.0*ScaleU.y ) )) * 0.015625;
	
	gl_FragColor =  pack(color);
} 