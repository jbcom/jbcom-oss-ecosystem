import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { calculateLODLevel, getGeometryDetail, LODLevel, shouldRenderEntity } from '../lod';

describe('LOD System', () => {
    describe('calculateLODLevel', () => {
        it('should return FULL for distance < 30 units', () => {
            const entityPos = new THREE.Vector3(0, 0, 0);
            const cameraPos = new THREE.Vector3(20, 0, 0);
            
            expect(calculateLODLevel(entityPos, cameraPos)).toBe(LODLevel.FULL);
        });

        it('should return MEDIUM for distance 30-60 units', () => {
            const entityPos = new THREE.Vector3(0, 0, 0);
            const cameraPos = new THREE.Vector3(45, 0, 0);
            
            expect(calculateLODLevel(entityPos, cameraPos)).toBe(LODLevel.MEDIUM);
        });

        it('should return LOW for distance 60-100 units', () => {
            const entityPos = new THREE.Vector3(0, 0, 0);
            const cameraPos = new THREE.Vector3(80, 0, 0);
            
            expect(calculateLODLevel(entityPos, cameraPos)).toBe(LODLevel.LOW);
        });

        it('should return CULLED for distance > 100 units', () => {
            const entityPos = new THREE.Vector3(0, 0, 0);
            const cameraPos = new THREE.Vector3(150, 0, 0);
            
            expect(calculateLODLevel(entityPos, cameraPos)).toBe(LODLevel.CULLED);
        });

        it('should handle 3D distances correctly', () => {
            const entityPos = new THREE.Vector3(0, 0, 0);
            const cameraPos = new THREE.Vector3(20, 20, 20); // ~34.6 units
            
            expect(calculateLODLevel(entityPos, cameraPos)).toBe(LODLevel.MEDIUM);
        });

        it('should handle boundary cases correctly', () => {
            const entityPos = new THREE.Vector3(0, 0, 0);
            
            // Exactly 30 units
            expect(calculateLODLevel(entityPos, new THREE.Vector3(30, 0, 0))).toBe(LODLevel.MEDIUM);
            
            // Exactly 60 units
            expect(calculateLODLevel(entityPos, new THREE.Vector3(60, 0, 0))).toBe(LODLevel.LOW);
            
            // Exactly 100 units
            expect(calculateLODLevel(entityPos, new THREE.Vector3(100, 0, 0))).toBe(LODLevel.CULLED);
        });
    });

    describe('shouldRenderEntity', () => {
        it('should return true for entities within render distance', () => {
            const entityPos = new THREE.Vector3(0, 0, 0);
            const cameraPos = new THREE.Vector3(50, 0, 0);
            
            expect(shouldRenderEntity(entityPos, cameraPos)).toBe(true);
        });

        it('should return false for entities beyond render distance', () => {
            const entityPos = new THREE.Vector3(0, 0, 0);
            const cameraPos = new THREE.Vector3(150, 0, 0);
            
            expect(shouldRenderEntity(entityPos, cameraPos)).toBe(false);
        });

        it('should return true at exactly 100 units (boundary)', () => {
            const entityPos = new THREE.Vector3(0, 0, 0);
            const cameraPos = new THREE.Vector3(99.9, 0, 0);
            
            expect(shouldRenderEntity(entityPos, cameraPos)).toBe(true);
        });
    });

    describe('getGeometryDetail', () => {
        it('should return high detail for FULL LOD', () => {
            const detail = getGeometryDetail(LODLevel.FULL);
            
            expect(detail.segments).toBe(16);
            expect(detail.castShadow).toBe(true);
            expect(detail.receiveShadow).toBe(true);
        });

        it('should return medium detail for MEDIUM LOD', () => {
            const detail = getGeometryDetail(LODLevel.MEDIUM);
            
            expect(detail.segments).toBe(8);
            expect(detail.castShadow).toBe(true);
            expect(detail.receiveShadow).toBe(false);
        });

        it('should return low detail for LOW LOD', () => {
            const detail = getGeometryDetail(LODLevel.LOW);
            
            expect(detail.segments).toBe(4);
            expect(detail.castShadow).toBe(false);
            expect(detail.receiveShadow).toBe(false);
        });

        it('should return low detail for CULLED LOD', () => {
            const detail = getGeometryDetail(LODLevel.CULLED);
            
            expect(detail.segments).toBe(4);
            expect(detail.castShadow).toBe(false);
            expect(detail.receiveShadow).toBe(false);
        });
    });

    describe('Performance characteristics', () => {
        it('should reduce geometry complexity as distance increases', () => {
            const fullDetail = getGeometryDetail(LODLevel.FULL);
            const mediumDetail = getGeometryDetail(LODLevel.MEDIUM);
            const lowDetail = getGeometryDetail(LODLevel.LOW);
            
            expect(fullDetail.segments).toBeGreaterThan(mediumDetail.segments);
            expect(mediumDetail.segments).toBeGreaterThan(lowDetail.segments);
        });

        it('should disable shadows at greater distances', () => {
            const fullDetail = getGeometryDetail(LODLevel.FULL);
            const mediumDetail = getGeometryDetail(LODLevel.MEDIUM);
            const lowDetail = getGeometryDetail(LODLevel.LOW);
            
            expect(fullDetail.castShadow).toBe(true);
            expect(mediumDetail.castShadow).toBe(true);
            expect(lowDetail.castShadow).toBe(false);
        });
    });
});
