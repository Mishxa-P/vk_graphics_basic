#version 450
#extension GL_ARB_separate_shader_objects : enable

layout(location = 0) out vec4 color;

layout (binding = 0) uniform sampler2D colorTex;

layout (location = 0 ) in VS_OUT
{
  vec2 texCoord;
} surf;

void sort(inout vec4 window[9])
{
	for(int i = 0; i < 8; i++)
	{
		for(int j = 0; j < 8 - i; j++)
		{
			vec4 temp1 = window[j];
			vec4 temp2 = window [j + 1];
			window[j] = max(temp1,temp2);
			window[j + 1] = min(temp1,temp2);
		}
	}
}
void main()
{
	vec4 window[9];
    window[0] = textureLodOffset(colorTex, surf.texCoord, 0, ivec2(-1,-1));
    window[1] = textureLodOffset(colorTex, surf.texCoord, 0, ivec2( 0,-1));
    window[2] = textureLodOffset(colorTex, surf.texCoord, 0, ivec2( 1,-1));
    window[3] = textureLodOffset(colorTex, surf.texCoord, 0, ivec2(-1, 0));
	window[4] = textureLod(colorTex, surf.texCoord, 0);
    window[5] = textureLodOffset(colorTex, surf.texCoord, 0, ivec2( 1, 0));
    window[6] = textureLodOffset(colorTex, surf.texCoord, 0, ivec2(-1, 1));
    window[7] = textureLodOffset(colorTex, surf.texCoord, 0, ivec2( 0, 1));
    window[8] = textureLodOffset(colorTex, surf.texCoord, 0, ivec2( 1, 1));
	sort(window);
	color = window[4];
}
