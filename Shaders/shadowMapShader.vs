attribute vec4 vPosition;
attribute vec2 aTextureCoordinate;
attribute vec3 aNormal;

// Used for shadow lookup
varying vec4 ShadowCoord;
varying vec2 vTextureCoordinate;

//for light calculations on the fragment shader
uniform vec3 lightPos;
varying vec3 vNormal;
varying vec3 vEyeVec;
varying vec3 vLightDirection;

//world, model and projection relative warping matrixes
uniform mat4 mWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 mLightWorldMatrix;
uniform mat4 uTransposeInverseWorldMatrix; //and the normal map for lighting reflections

void main()
{
	gl_Position = mWorldMatrix*vPosition;
	ShadowCoord =mLightWorldMatrix*vPosition;
	vTextureCoordinate	= aTextureCoordinate;
	vec4 vertex = mWorldMatrix * vec4(vPosition.xyz, 1.0);
    vNormal = vec3(uTransposeInverseWorldMatrix * vec4(aNormal,1));
    vec3 light = (uViewMatrix*vec4(lightPos,1.0)).xyz;
	vLightDirection = vertex.xyz - light ;

    vEyeVec = vec3((mWorldMatrix*vec4(lightPos,1.0)).xyz - vertex.xyz);
} 
 