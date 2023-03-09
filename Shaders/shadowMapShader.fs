//a shadowmapped shader taken from examples and modified to work with the phong lighting

//defines for colours and coefficients of the single torch light
//could probably be attributes but its cleaner to code it here
#define uAmbientCoeff vec4(0.2,0.2,0.2,1)
#define uDiffuseCoeff vec4(0.3,0.3,0.3,1)
#define uSpecularCoeff vec4(0.8,0.8,0.8,1)
#define uShininess 100.0 
//rock is less shiny than other things

#define uLightAmbient vec4(0.8,0.8,0.8,1)
#define uLightDiffuse vec4(1.0,0.67,0,1.0)
#define uLightSpecular vec4(1,1,1,1)


precision mediump float; 

varying vec4 ShadowCoord;
uniform sampler2D  ShadowMap;
varying vec2 vTextureCoordinate;

//for lighting
varying vec3 vNormal;
varying vec3 vEyeVec;
varying vec3 vLightDirection;

uniform sampler2D myTexture;

float unpack (vec4 colour)
{
	//this bit shifts the unsigned colour values to a format the GPU can use
	const vec4 bitShifts = vec4(1.0,
								1.0 / 256.0,
								1.0 / (256.0 * 256.0),
								1.0 / (256.0 * 256.0 * 256.0));
	return dot(colour, bitShifts);
}
 
void main()
{	

	vec4 temp = ShadowCoord/ShadowCoord.w;
	temp= (temp+1.0)*0.5;
	float bias = 0.2;
	float visibility = 1.0;
	if (unpack(texture2D( ShadowMap, temp.xy )) < (temp.z-bias))
	{
		visibility=0.5;
	}
		
	//Do the lighting calculations from where the camera is
	vec3 L = normalize(vLightDirection);
	vec3 N = normalize(vNormal);
     
    //Lambert's cosine law
    float lambertTerm = dot(N,-L);
     
    //Ambient Term
    vec4 Ia = uAmbientCoeff * uLightAmbient ;
     
    //Diffuse Term
    vec4 Id = vec4(0.0,0.0,0.0,1.0);
     
    //Specular Term
    vec4 Is = vec4(0.0,0.0,0.0,1.0);
     
    if(lambertTerm > 0.0) //only if lambertTerm is positive
    {
        Id = uDiffuseCoeff * uLightDiffuse * lambertTerm; //add diffuse term
        vec3 E = normalize(vEyeVec);
        vec3 R = reflect(L, N);
        float specular = pow(max(dot(R, E), 0.0), uShininess);
        Is = uSpecularCoeff * uLightSpecular * specular; //add specular term 
    }
	 
	vec4 finalColor = Ia + Id + Is; //lighting is the sum of the ambient, diffuse and specular and mixes with the shadows and texture here
    finalColor.a = 1.0;

    gl_FragColor = vec4(texture2D(myTexture, vTextureCoordinate).xyz,1.0) * vec4(visibility,visibility,visibility,1) * finalColor;
} 
