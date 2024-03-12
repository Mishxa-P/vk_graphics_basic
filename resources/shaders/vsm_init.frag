#version 450

layout(location = 0) out vec4 fragColor;

void main (void)
{
    float z = gl_FragCoord.z;

    fragColor = vec4 ( z, z*z, z, 1.0 );
}
