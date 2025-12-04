// Water shader - animated rippling water surface
export const waterVertexShader = /* glsl */ `
  uniform float time;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  
  void main() {
    vUv = uv;
    
    vec3 pos = position;
    
    // Wave displacement
    float wave1 = sin(pos.x * 0.5 + time) * 0.05;
    float wave2 = cos(pos.z * 0.3 + time * 1.3) * 0.03;
    pos.y += wave1 + wave2;
    
    vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const waterFragmentShader = /* glsl */ `
  uniform float time;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  
  // Fresnel-like depth fade
  float fresnel(vec3 viewDir, vec3 normal, float power) {
    return pow(1.0 - max(dot(viewDir, normal), 0.0), power);
  }
  
  void main() {
    // Base water colors
    vec3 deepColor = vec3(0.02, 0.1, 0.15);
    vec3 shallowColor = vec3(0.1, 0.3, 0.4);
    vec3 foamColor = vec3(0.8, 0.9, 0.95);
    
    // Animated ripple pattern
    float ripple = sin(vWorldPos.x * 2.0 + time * 2.0) * 
                   cos(vWorldPos.z * 1.5 + time * 1.7);
    ripple = ripple * 0.5 + 0.5;
    
    // Depth gradient based on distance from center
    float depth = length(vWorldPos.xz) / 50.0;
    depth = clamp(depth, 0.0, 1.0);
    
    // Mix colors
    vec3 col = mix(shallowColor, deepColor, depth);
    
    // Add ripple highlights
    col += ripple * 0.1;
    
    // Foam at edges (shallow water)
    float foam = smoothstep(0.8, 1.0, 1.0 - depth) * ripple;
    col = mix(col, foamColor, foam * 0.3);
    
    // Transparency based on depth
    float alpha = mix(0.6, 0.9, depth);
    
    gl_FragColor = vec4(col, alpha);
  }
`;
