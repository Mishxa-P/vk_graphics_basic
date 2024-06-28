#version 450
#extension GL_ARB_separate_shader_objects : enable
#extension GL_GOOGLE_include_directive : require

#include "common.h"

layout(location = 0) out vec4 out_fragColor;

layout (location = 0 ) in VS_OUT
{
  vec3 wPos;
  vec3 wNorm;
  vec3 wTangent;
  vec2 texCoord;
} surf;

layout(binding = 0, set = 0) uniform AppData
{
  UniformParams Params;
};

layout (binding = 1) uniform sampler2D shadowMap;

vec3 T(float s)
{
  const vec3 coeff1 = vec3(0.233f, 0.455f, 0.649f);
  const vec3 coeff2 = vec3(0.1f, 0.336f, 0.344f);
  const vec3 coeff3 = vec3(0.118f, 0.198f, 0.0f);
  const vec3 coeff4 = vec3(0.113f, 0.007f, 0.007f);
  const vec3 coeff5 = vec3(0.358f, 0.004f, 0.0f);
  const vec3 coeff6 = vec3(0.078f, 0.0f, 0.0f);

  const float div1 = 0.0064f;
  const float div2 = 0.0484f;
  const float div3 = 0.187f;
  const float div4 = 0.567f;
  const float div5 = 1.99f;
  const float div6 = 7.41f;

  float s2 = s * s;

  return coeff1 * exp(-s2 / div1) +
         coeff2 * exp(-s2 / div2) +
         coeff3 * exp(-s2 / div3) +
         coeff4 * exp(-s2 / div4) +
         coeff5 * exp(-s2 / div5) +
         coeff6 * exp(-s2 / div6);
}

float getLinearDepth(vec2 texCoord)
{
  float depth = texture(shadowMap, texCoord).x;
  vec4 shrinkedPos = Params.lightMatrix * vec4(texCoord, depth, 1.0f);
  vec3 shwpos = shrinkedPos.xyz / shrinkedPos.w;
  float d1 = texture(shadowMap, shwpos.xy * 0.5f).x;
  float d2 = shwpos.z;
  return abs(d1 - d2);
}

vec4 transmittance(vec2 texCoord, vec3 lightDir, vec4 color)
{
  float depth = getLinearDepth(texCoord);
  float s = depth * 1.5;
  float E = max(0.3f + dot(-surf.wNorm, lightDir), 0.0f);
  return vec4(T(s), 1.0f) * color * E;
}

void main()
{
  const vec4 posLightClipSpace = Params.lightMatrix*vec4(surf.wPos, 1.0f); // 
  const vec3 posLightSpaceNDC  = posLightClipSpace.xyz/posLightClipSpace.w;    // for orto matrix, we don't need perspective division, you can remove it if you want; this is general case;
  const vec2 shadowTexCoord    = posLightSpaceNDC.xy*0.5f + vec2(0.5f, 0.5f);  // just shift coords from [-1,1] to [0,1]               
    
  const bool  outOfView = (shadowTexCoord.x < 0.0001f || shadowTexCoord.x > 0.9999f || shadowTexCoord.y < 0.0091f || shadowTexCoord.y > 0.9999f);
  const float shadow    = ((posLightSpaceNDC.z < textureLod(shadowMap, shadowTexCoord, 0).x + 0.001f) || outOfView) ? 1.0f : 0.0f;

  const vec4 dark_violet = vec4(0.59f, 0.0f, 0.82f, 1.0f);
  const vec4 chartreuse  = vec4(0.5f, 1.0f, 0.0f, 1.0f);

  vec4 lightColor1 = mix(dark_violet, chartreuse, abs(sin(Params.time)));
  vec4 lightColor2 = vec4(1.0f, 1.0f, 1.0f, 1.0f);
   
  vec3 lightDir   = normalize(Params.lightPos - surf.wPos);
  vec4 lightColor = max(dot(surf.wNorm, lightDir), 0.0f) * lightColor1;
  out_fragColor   = (lightColor*shadow + vec4(0.1f)) * vec4(Params.baseColor, 1.0f);

  if (Params.useSubsurfaceScattering)
  {
    out_fragColor += transmittance(shadowTexCoord, lightDir, lightColor1);
  }
}
