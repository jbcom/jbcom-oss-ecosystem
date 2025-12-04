import * as THREE from 'three';

/**
 * Calculate slope angle at a given position by sampling terrain height
 * @param position Position to check slope at
 * @param sampleDistance Distance to sample points for slope calculation
 * @returns Slope angle in degrees
 */
export function calculateSlope(position: THREE.Vector3, sampleDistance = 0.5): number {
    // Sample terrain height at 4 points around the position
    const heightCenter = getTerrainHeight(position.x, position.z);
    const heightNorth = getTerrainHeight(position.x, position.z + sampleDistance);
    const heightSouth = getTerrainHeight(position.x, position.z - sampleDistance);
    const heightEast = getTerrainHeight(position.x + sampleDistance, position.z);
    const heightWest = getTerrainHeight(position.x - sampleDistance, position.z);

    // Calculate gradients
    const gradientNS = (heightNorth - heightSouth) / (2 * sampleDistance);
    const gradientEW = (heightEast - heightWest) / (2 * sampleDistance);

    // Calculate slope magnitude
    const slopeMagnitude = Math.sqrt(gradientNS * gradientNS + gradientEW * gradientEW);

    // Convert to degrees
    const slopeAngle = Math.atan(slopeMagnitude) * (180 / Math.PI);

    return slopeAngle;
}

/**
 * Get terrain height at a given x,z position
 * For now, returns flat terrain. Will be enhanced with actual terrain data.
 */
function getTerrainHeight(x: number, z: number): number {
    // Flat terrain for now
    // TODO: Integrate with actual terrain heightmap when available
    return 0;
}

/**
 * Check if a slope is walkable (< 30 degrees)
 */
export function isWalkableSlope(slopeAngle: number): boolean {
    return slopeAngle < 30;
}

/**
 * Get slope-based speed multiplier
 */
export function getSlopeSpeedMultiplier(slopeAngle: number): number {
    if (slopeAngle < 10) return 1.0;
    if (slopeAngle < 20) return 0.9;
    if (slopeAngle < 30) return 0.7;
    return 0.5; // Very steep
}
