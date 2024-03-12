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

void main()
{
  const vec4 posLightClipSpace = Params.lightMatrix*vec4(surf.wPos, 1.0f);
  const vec3 posLightSpaceNDC  = posLightClipSpace.xyz/posLightClipSpace.w;   
  const vec2 shadowTexCoord    = posLightSpaceNDC.xy*0.5f + vec2(0.5f, 0.5f);          
  const bool  outOfView = (shadowTexCoord.x < 0.0001f || shadowTexCoord.x > 0.9999f || shadowTexCoord.y < 0.0091f || shadowTexCoord.y > 0.9999f);

  vec4 clr = vec4(Params.baseColor, 1.0f);
  vec2	vsm  = textureLod(shadowMap, shadowTexCoord, 1).xy;
  float mu = vsm.x;
  float s2 = vsm.y - mu * mu;
  float pmax = s2 / (s2 + (posLightSpaceNDC.z - mu) * (posLightSpaceNDC.z - mu));

  out_fragColor = clr;
  if (posLightSpaceNDC.z >= vsm.x)
  {
    out_fragColor   =  vec4(vec3(pmax), 1.0) * clr;
  }
}
