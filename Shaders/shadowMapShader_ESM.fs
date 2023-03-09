precision mediump float;
varying vec4 ShadowCoord;
uniform sampler2D  ShadowMap;
uniform mat4 mLightView;
uniform mat4 mLightProj;
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

float saturate(float x)
{
	return clamp(x,0.0,1.0);
}
vec2 saturate(vec2 x)
{
	return clamp(x,0.0,1.0);
}
void main()
{	
  vec4 temp = ShadowCoord/ShadowCoord.w;
  float bias = 0.2;
	
  temp= (temp+1.0)*0.5;
  float realDistance = (temp.z-bias);
	
  float diffuse = 0.0;
  for (float i =0.0;i<3.0;i+=1.0)
  {
    vec2 ProjectedTexCoords= temp.xy +(i-2.0)/512.0; // (i-2.0)/512.0 is roughly distance of 1 pixel
    if ((saturate(ProjectedTexCoords).x == ProjectedTexCoords.x) && (saturate(ProjectedTexCoords).y == ProjectedTexCoords.y))
    {
        // calculate the depth
        float depthScale= 1.0;
        //float depth = texture2D(ShadowMap, ProjectedTexCoords).r;
        float depth = unpack(texture2D(ShadowMap, ProjectedTexCoords));
        
       	float  tdiffuse = exp(3.0* (depth*depthScale - realDistance));
        diffuse += saturate(tdiffuse)*0.33;
    }	
   }
	gl_FragColor = vec4(diffuse,diffuse,diffuse,1.0);
  
} 
