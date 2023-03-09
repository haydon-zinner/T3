attribute vec3 vPosition;
attribute vec2 vTextureCoordinate;
varying vec2 varyTextureCoordinate;


void main()
{
	varyTextureCoordinate =  vTextureCoordinate;
	gl_Position = vec4(vPosition,1.0);
		
}  