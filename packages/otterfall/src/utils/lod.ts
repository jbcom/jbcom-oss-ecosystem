import * as THREE from 'three';

export enum LODLevel {
    FULL = 'full',      // < 30 units
    MEDIUM = 'medium',  // 30-60 units
    LOW = 'low',        // 60-100 units
    CULLED = 'culled',  // > 100 units
}

export function calculateLODLevel(
    entityPosition: THREE.Vector3,
    cameraPosition: THREE.Vector3
): LODLevel {
    const distance = entityPosition.distanceTo(cameraPosition);

    if (distance < 30) return LODLevel.FULL;
    if (distance < 60) return LODLevel.MEDIUM;
    if (distance < 100) return LODLevel.LOW;
    return LODLevel.CULLED;
}

export function shouldRenderEntity(
    entityPosition: THREE.Vector3,
    cameraPosition: THREE.Vector3
): boolean {
    return calculateLODLevel(entityPosition, cameraPosition) !== LODLevel.CULLED;
}

export function getGeometryDetail(lodLevel: LODLevel): {
    segments: number;
    castShadow: boolean;
    receiveShadow: boolean;
} {
    switch (lodLevel) {
        case LODLevel.FULL:
            return { segments: 16, castShadow: true, receiveShadow: true };
        case LODLevel.MEDIUM:
            return { segments: 8, castShadow: true, receiveShadow: false };
        case LODLevel.LOW:
            return { segments: 4, castShadow: false, receiveShadow: false };
        default:
            return { segments: 4, castShadow: false, receiveShadow: false };
    }
}
