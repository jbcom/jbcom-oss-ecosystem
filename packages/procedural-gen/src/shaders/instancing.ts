/**
 * GPU-Driven Instancing Shaders
 * 
 * Handles wind animation and LOD calculations entirely on the GPU
 * for maximum performance with large instance counts.
 */

export const instancingVertexShader = `
attribute vec3 position;
attribute vec3 normal;
attribute mat4 instanceMatrix;

// Instance-specific attributes
attribute vec3 instancePosition;
attribute vec4 instanceRotation; // quaternion (x, y, z, w)
attribute vec3 instanceScale;
attribute float instanceRandom; // random value for wind variation

uniform float uTime;
uniform vec3 uCameraPosition;
uniform float uWindStrength;
uniform float uLodDistance;
uniform bool uEnableWind;

// Noise function for wind variation
float hash(float n) {
    return fract(sin(n) * 43758.5453);
}

float hash3(vec3 p) {
    return hash(p.x + p.y * 157.0 + p.z * 113.0);
}

float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float n000 = hash3(i);
    float n100 = hash3(i + vec3(1.0, 0.0, 0.0));
    float n010 = hash3(i + vec3(0.0, 1.0, 0.0));
    float n110 = hash3(i + vec3(1.0, 1.0, 0.0));
    float n001 = hash3(i + vec3(0.0, 0.0, 1.0));
    float n101 = hash3(i + vec3(1.0, 0.0, 1.0));
    float n011 = hash3(i + vec3(0.0, 1.0, 1.0));
    float n111 = hash3(i + vec3(1.0, 1.0, 1.0));
    
    float nx00 = mix(n000, n100, f.x);
    float nx10 = mix(n010, n110, f.x);
    float nx01 = mix(n001, n101, f.x);
    float nx11 = mix(n011, n111, f.x);
    
    float nxy0 = mix(nx00, nx10, f.y);
    float nxy1 = mix(nx01, nx11, f.y);
    
    return mix(nxy0, nxy1, f.z);
}

// Quaternion multiplication
vec4 quatMul(vec4 q1, vec4 q2) {
    return vec4(
        q1.w * q2.x + q1.x * q2.w + q1.y * q2.z - q1.z * q2.y,
        q1.w * q2.y - q1.x * q2.z + q1.y * q2.w + q1.z * q2.x,
        q1.w * q2.z + q1.x * q2.y - q1.y * q2.x + q1.z * q2.w,
        q1.w * q2.w - q1.x * q2.x - q1.y * q2.y - q1.z * q2.z
    );
}

// Rotate vector by quaternion
vec3 quatRotate(vec4 q, vec3 v) {
    vec3 t = 2.0 * cross(q.xyz, v);
    return v + q.w * t + cross(q.xyz, t);
}

// Build rotation matrix from quaternion
mat3 quatToMat3(vec4 q) {
    float x = q.x, y = q.y, z = q.z, w = q.w;
    float x2 = x + x, y2 = y + y, z2 = z + z;
    float xx = x * x2, xy = x * y2, xz = x * z2;
    float yy = y * y2, yz = y * z2, zz = z * z2;
    float wx = w * x2, wy = w * y2, wz = w * z2;
    
    return mat3(
        1.0 - (yy + zz), xy - wz, xz + wy,
        xy + wz, 1.0 - (xx + zz), yz - wx,
        xz - wy, yz + wx, 1.0 - (xx + yy)
    );
}

void main() {
    // Get base position
    vec3 localPos = position;
    
    // Calculate LOD scale based on distance to camera (do this first to potentially early-out)
    float distToCamera = length(instancePosition - uCameraPosition);
    float lodScale = 1.0 - clamp((distToCamera - uLodDistance * 0.5) / (uLodDistance * 0.5), 0.0, 1.0);
    
    // Hide completely if too far (early discard)
    if (lodScale < 0.01) {
        gl_Position = vec4(0.0, 0.0, -1.0, 1.0); // Place off-screen
        return;
    }
    
    // Apply instance scale
    localPos *= instanceScale * lodScale;
    
    // Calculate wind effect on GPU
    vec4 finalRotation = instanceRotation;
    
    if (uEnableWind && uWindStrength > 0.0) {
        // Wind phase with instance-specific variation
        float windPhase = uTime * 2.0 + instancePosition.x * 0.1 + instancePosition.z * 0.1 + instanceRandom * 6.28;
        
        // Wind noise for variation
        float windNoise = noise3D(instancePosition * 0.05 + vec3(uTime * 0.5));
        
        // Calculate bend angle
        float bendAngle = sin(windPhase) * uWindStrength * 0.3 * (0.5 + 0.5 * windNoise);
        
        // Bend axis (perpendicular to wind direction)
        vec3 bendAxis = normalize(vec3(-cos(windPhase), 0.0, sin(windPhase)));
        
        // Create wind rotation quaternion
        float halfAngle = bendAngle * 0.5;
        vec4 windQuat = vec4(bendAxis * sin(halfAngle), cos(halfAngle));
        
        // Combine with original rotation
        finalRotation = quatMul(windQuat, instanceRotation);
    }
    
    // Build transformation matrix from quaternion
    mat3 rotMat = quatToMat3(finalRotation);
    
    // Transform local position to world space
    vec3 worldPos = rotMat * localPos + instancePosition;
    
    // Transform to clip space
    gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
}
`;

export const instancingFragmentShader = `
void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`;
