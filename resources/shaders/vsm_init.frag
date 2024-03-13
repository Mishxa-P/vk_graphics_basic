#version 450

layout(location = 0) out vec4 fragColor;

void main (void)
{
    float z = gl_FragCoord.z;

    fragColor = vec4 ( z, z*z, 0.0, 1.0 );
}
