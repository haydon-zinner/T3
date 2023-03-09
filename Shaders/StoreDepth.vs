//a simple vertex shader used for measuring distances for a depth map

attribute highp vec3 vPosition;

uniform highp mat4 mWorldMatrix;
varying highp vec4  depthC;
void main()
{	
	gl_Position = mWorldMatrix*vec4(vPosition,1.0);
	depthC=gl_Position;
}  