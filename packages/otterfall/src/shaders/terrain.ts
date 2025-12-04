// Terrain shader - procedural ground with biome-specific colors and elevation
export const terrainVertexShader = /* glsl */ `
  uniform vec2 biomeCenters[7];
  uniform float biomeRadii[7];
  uniform int biomeTypes[7]; // 0=marsh, 1=forest, 2=desert, 3=tundra, 4=savanna, 5=mountain, 6=scrubland
  
  varying vec2 vUv;
  varying vec3 vPos;
  varying vec3 vWorldPos;
  varying float vElevation;
  varying float vSlope;
  
  // Simple hash noise
  float hash(vec2 p) { 
    return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); 
  }
  
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  
  int getBiomeType(vec2 pos) {
    int closestIdx = 0;
    float closestDist = distance(pos, biomeCenters[0]);
    
    for (int i = 1; i < 7; i++) {
      float dist = distance(pos, biomeCenters[i]);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    }
    
    return biomeTypes[closestIdx];
  }
  
  void main() {
    vUv = uv;
    vPos = position;
    
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vec2 worldXZ = worldPos.xz;
    
    // Calculate elevation based on biome
    int biomeType = getBiomeType(worldXZ);
    float elevation = 0.0;
    
    // Mountain biome: elevated terrain with slopes up to 45 degrees
    if (biomeType == 5) {
      float n1 = noise(worldXZ * 0.05);
      float n2 = noise(worldXZ * 0.1);
      float n3 = noise(worldXZ * 0.2);
      elevation = n1 * 15.0 + n2 * 8.0 + n3 * 3.0;
    }
    // Tundra: gentle rolling hills
    else if (biomeType == 3) {
      elevation = noise(worldXZ * 0.03) * 2.0;
    }
    // Other biomes: mostly flat with subtle variation
    else {
      elevation = noise(worldXZ * 0.1) * 0.5;
    }
    
    vec3 newPosition = position;
    newPosition.y += elevation;
    
    vElevation = elevation;
    vWorldPos = (modelMatrix * vec4(newPosition, 1.0)).xyz;
    
    // Calculate slope for walkability (approximate)
    float dx = noise(worldXZ + vec2(0.1, 0.0)) - noise(worldXZ - vec2(0.1, 0.0));
    float dz = noise(worldXZ + vec2(0.0, 0.1)) - noise(worldXZ - vec2(0.0, 0.1));
    vSlope = length(vec2(dx, dz)) * 10.0;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

export const terrainFragmentShader = /* glsl */ `
  uniform vec3 biomeColors[7];
  uniform vec2 biomeCenters[7];
  uniform float biomeRadii[7];
  uniform int biomeTypes[7]; // 0=marsh, 1=forest, 2=desert, 3=tundra, 4=savanna, 5=mountain, 6=scrubland
  
  varying vec2 vUv;
  varying vec3 vPos;
  varying vec3 vWorldPos;
  varying float vElevation;
  varying float vSlope;
  
  // Simple hash noise
  float hash(vec2 p) { 
    return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); 
  }
  
  // Triplanar detail mapping (procedural)
  float triplanarDetail(vec3 pos) {
    // Sample detail from three planes
    float detailX = hash(pos.yz * 8.0);
    float detailY = hash(pos.xz * 8.0);
    float detailZ = hash(pos.xy * 8.0);
    
    // Calculate blend weights based on surface normal approximation
    vec3 blendWeights = vec3(
      abs(normalize(vec3(1.0, 0.0, 0.0)).x),
      abs(normalize(vec3(0.0, 1.0, 0.0)).y),
      abs(normalize(vec3(0.0, 0.0, 1.0)).z)
    );
    
    // For terrain, Y (up) dominates
    blendWeights = vec3(0.1, 0.8, 0.1);
    blendWeights = blendWeights / (blendWeights.x + blendWeights.y + blendWeights.z);
    
    return detailX * blendWeights.x + detailY * blendWeights.y + detailZ * blendWeights.z;
  }
  
  int getBiomeType(vec2 pos) {
    int closestIdx = 0;
    float closestDist = distance(pos, biomeCenters[0]);
    
    for (int i = 1; i < 7; i++) {
      float dist = distance(pos, biomeCenters[i]);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    }
    
    return biomeTypes[closestIdx];
  }
  
  vec3 getBiomeColor(vec2 pos) {
    // Find closest biome
    int closestIdx = 0;
    float closestDist = distance(pos, biomeCenters[0]);
    
    for (int i = 1; i < 7; i++) {
      float dist = distance(pos, biomeCenters[i]);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    }
    
    vec3 baseColor = biomeColors[closestIdx];
    
    // Blend with adjacent biomes at boundaries
    vec3 blendedColor = baseColor;
    float totalWeight = 1.0;
    
    for (int i = 0; i < 7; i++) {
      if (i != closestIdx) {
        float dist = distance(pos, biomeCenters[i]);
        float blendRadius = biomeRadii[i] * 0.3; // 30% blend zone
        float weight = smoothstep(blendRadius, 0.0, dist - biomeRadii[i]);
        blendedColor += biomeColors[i] * weight;
        totalWeight += weight;
      }
    }
    
    return blendedColor / totalWeight;
  }
  
  void main() {
    vec2 worldXZ = vWorldPos.xz;
    vec3 baseColor = getBiomeColor(worldXZ);
    
    // Get biome type for special effects
    int biomeType = getBiomeType(worldXZ);
    
    // Apply triplanar detail mapping
    float detail = triplanarDetail(vWorldPos);
    
    // Tundra: Add snow shader effect
    if (biomeType == 3) {
      // Snow sparkle effect
      float sparkle = hash(vPos.xz * 10.0);
      baseColor = mix(baseColor, vec3(1.0, 1.0, 1.0), sparkle * 0.3);
      
      // Snow on elevated areas
      if (vElevation > 0.5) {
        baseColor = mix(baseColor, vec3(0.95, 0.95, 1.0), 0.6);
      }
      
      // Add sparkly detail to snow
      baseColor += vec3(detail * 0.2);
    }
    
    // Mountain: Rocky appearance with elevation-based coloring
    if (biomeType == 5) {
      // Darker at higher elevations (rock)
      float rockFactor = smoothstep(5.0, 15.0, vElevation);
      vec3 rockColor = vec3(0.3, 0.3, 0.35);
      baseColor = mix(baseColor, rockColor, rockFactor);
      
      // Snow caps on peaks
      if (vElevation > 18.0) {
        baseColor = mix(baseColor, vec3(0.9, 0.9, 0.95), 0.8);
      }
      
      // Add rocky detail
      baseColor = mix(baseColor, baseColor * detail, 0.3);
    }
    
    // Add base noise variation with triplanar detail
    float n = hash(vPos.xz * 0.5);
    vec3 col = mix(baseColor * 0.8, baseColor * 1.2, n);
    
    // Apply detail normal map effect (subtle lighting variation)
    col = mix(col, col * (0.8 + detail * 0.4), 0.5);
    
    // Distance-based darkening (vignette on floor)
    float dist = length(vPos.xz);
    col *= smoothstep(100.0, 30.0, dist);
    
    gl_FragColor = vec4(col, 1.0);
  }
`;
