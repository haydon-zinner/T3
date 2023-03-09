attribute vec4 vPosition;
attribute vec2 vTextureCoordinate;
varying vec2 col;

void main() 
{
	col=vTextureCoordinate;
    gl_Position = vPosition; 
} 
 