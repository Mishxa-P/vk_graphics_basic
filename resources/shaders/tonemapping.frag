#version 450
#extension GL_ARB_separate_shader_objects : enable
#extension GL_GOOGLE_include_directive : require

#include "common.h"

layout (binding = 0, set = 0) uniform AppData
{
    UniformParams Params;
};

layout (binding = 1) uniform sampler2D ColorMap;

layout (location = 0) in vec2 TexCoord;

layout (location = 0) out vec4 Color;

void main()
{
	const vec3 color = textureLod(ColorMap, TexCoord, 0).rgb;

	if (Params.useToneMapping)
	{
	  Color = vec4(pow(vec3(1.0f) - exp(-color * 1.3f), vec3(1.0f / 0.8f)), 1.0f);
	}
	else
	{
	  Color = vec4(color, 1.0f);
	}
}