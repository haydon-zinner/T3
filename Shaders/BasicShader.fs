precision mediump float;
varying vec2 col;
uniform sampler2D myTexture;


float unpack (vec4 colour)
{
	const vec4 bitShifts = vec4(1.0,
								1.0 / 256.0,
								1.0 / (256.0 * 256.0),
								1.0 / (256.0 * 256.0 * 256.0));
	return dot(colour, bitShifts); //bitshift the unsigned coloured values so they are formatted for the GPU
}

void main() 
{ 
	//Unpack the texture and set the colour
	float colA =unpack(texture2D(myTexture, col));
	
	gl_FragColor = vec4(colA,colA,colA,1);
	
} 