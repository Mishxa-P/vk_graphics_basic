#version 450

layout (triangles) in;
layout (triangle_strip, max_vertices = 32) out;

layout(push_constant) uniform params_t
{
    mat4 mProjView;
    mat4 mModel;
    float time;
} params;

layout(location = 0) in GS_IN
{
    vec3 wPos;
    vec3 wNorm;
    vec3 wTangent;
    vec2 texCoord;
} gIn[];

layout(location = 0) out GS_OUT
{
    vec3 wPos;
    vec3 wNorm;
    vec3 wTangent;
    vec2 texCoord;
} gOut;

void main()
{
  vec3 normal = normalize(cross(gIn[0].wPos - gIn[1].wPos, gIn[2].wPos - gIn[1].wPos)) * min(0, sin(params.time));

  for (int i = 0; i < 3; ++i)
  {
    gOut.wPos     = gIn[i].wPos;
    gOut.wNorm    = gIn[i].wNorm;
    gOut.wTangent = gIn[i].wTangent;
    gOut.texCoord = gIn[i].texCoord;
    gl_Position = params.mProjView * vec4(gIn[i].wPos + normal, 1.0);

    EmitVertex();
  }

  EndPrimitive();
}
