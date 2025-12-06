/**
 * Combat System Patterns - Rivermarsh/Otterfall
 *
 * Combat involves:
 * - Attack execution with stamina/cooldown checks
 * - Damage calculation with armor/dodge
 * - Status effects (stun, knockback)
 * - Combat archetypes (tank, agile, balanced)
 */

import { Vector3 } from 'three';
import { Entity, AttackType, CombatArchetype } from './components';

// ============================================================================
// ATTACK DATA DEFINITIONS
// ============================================================================

/**
 * Attack statistics for each attack type
 */
export interface AttackData {
    baseDamage: number;
    range: number;
    staminaCost: number;
    cooldown: number; // seconds
    knockback: number; // force in units
    stunDuration: number; // seconds
    special?: string;
}

/**
 * Attack type definitions from requirements
 */
export const ATTACK_DATA: Record<AttackType, AttackData> = {
    bite: {
        baseDamage: 30, // 28-40 varies by species
        range: 1.5,
        staminaCost: 22,
        cooldown: 1.75,
        knockback: 1,
        stunDuration: 0,
        special: 'High damage, short range',
    },
    claw: {
        baseDamage: 21, // 20-22
        range: 1.8,
        staminaCost: 16,
        cooldown: 1.1,
        knockback: 0.5,
        stunDuration: 0,
        special: 'Fast, low stamina',
    },
    tail_whip: {
        baseDamage: 25,
        range: 2.5,
        staminaCost: 25,
        cooldown: 2.5,
        knockback: 3,
        stunDuration: 0,
        special: 'Long range, knockback',
    },
    headbutt: {
        baseDamage: 30,
        range: 1.2,
        staminaCost: 30,
        cooldown: 3.0,
        knockback: 4,
        stunDuration: 1.5,
        special: 'Tank attack, stun',
    },
    pounce: {
        baseDamage: 35,
        range: 4.0,
        staminaCost: 40,
        cooldown: 4.0,
        knockback: 3,
        stunDuration: 0.5,
        special: 'Agile attack, gap closer',
    },
    roll_crush: {
        baseDamage: 32,
        range: 1.0,
        staminaCost: 35,
        cooldown: 3.5,
        knockback: 2,
        stunDuration: 1.0,
        special: 'Pangolin special, armor penetration',
    },
};

// ============================================================================
// ARCHETYPE STAT MODIFIERS
// ============================================================================

/**
 * Combat archetype base stats
 */
export interface ArchetypeStats {
    maxHealth: number;
    maxStamina: number;
    armor: number; // percentage (0-100)
    dodge: number; // percentage (0-100)
    staminaRegenRate: number; // per second
}

export const ARCHETYPE_STATS: Record<CombatArchetype, ArchetypeStats> = {
    tank: {
        maxHealth: 150,
        maxStamina: 80,
        armor: 30,
        dodge: 10,
        staminaRegenRate: 8,
    },
    agile: {
        maxHealth: 80,
        maxStamina: 120,
        armor: 5,
        dodge: 35,
        staminaRegenRate: 15,
    },
    balanced: {
        maxHealth: 100,
        maxStamina: 100,
        armor: 15,
        dodge: 20,
        staminaRegenRate: 10,
    },
};

// ============================================================================
// ATTACK EXECUTION
// ============================================================================

/**
 * Result of attempting an attack
 */
export interface AttackResult {
    success: boolean;
    reason?: 'insufficient_stamina' | 'on_cooldown' | 'out_of_range' | 'stunned';
    damage?: number;
    dodged?: boolean;
    knockbackDirection?: Vector3;
}

/**
 * Check if an attack can be executed
 */
export function canExecuteAttack(
    attacker: Entity,
    attackType: AttackType,
    currentTime: number
): { canAttack: boolean; reason?: string } {
    const combat = attacker.combat;
    if (!combat) {
        return { canAttack: false, reason: 'No combat component' };
    }

    // Check if stunned
    if (combat.isStunned) {
        return { canAttack: false, reason: 'stunned' };
    }

    // Check if attack is available to this species
    if (!combat.attacks?.includes(attackType)) {
        return { canAttack: false, reason: 'Attack not available' };
    }

    const attackData = ATTACK_DATA[attackType];

    // Check stamina
    if (combat.stamina < attackData.staminaCost) {
        return { canAttack: false, reason: 'insufficient_stamina' };
    }

    // Check cooldown
    const cooldownEnd = attacker.attackCooldowns?.[attackType] || 0;
    if (currentTime < cooldownEnd) {
        return { canAttack: false, reason: 'on_cooldown' };
    }

    return { canAttack: true };
}

/**
 * Execute an attack against a target
 */
export function executeAttack(
    attacker: Entity,
    target: Entity,
    attackType: AttackType,
    currentTime: number
): AttackResult {
    // Validate attack can be performed
    const canAttack = canExecuteAttack(attacker, attackType, currentTime);
    if (!canAttack.canAttack) {
        return { success: false, reason: canAttack.reason as any };
    }

    const attackData = ATTACK_DATA[attackType];
    const attackerCombat = attacker.combat!;
    const targetCombat = target.combat;

    // Check range
    if (attacker.transform && target.transform) {
        const distance = attacker.transform.position.distanceTo(target.transform.position);
        if (distance > attackData.range) {
            return { success: false, reason: 'out_of_range' };
        }
    }

    // Consume stamina
    attackerCombat.stamina -= attackData.staminaCost;

    // Set cooldown
    if (!attacker.attackCooldowns) {
        attacker.attackCooldowns = {};
    }
    attacker.attackCooldowns[attackType] = currentTime + attackData.cooldown * 1000;

    // Calculate if attack is dodged
    if (targetCombat) {
        const dodgeRoll = Math.random() * 100;
        if (dodgeRoll < targetCombat.dodge) {
            return { success: true, damage: 0, dodged: true };
        }
    }

    // Calculate damage
    let damage = calculateDamage(attacker, target, attackType);

    // Apply damage to target
    if (targetCombat) {
        targetCombat.health = Math.max(0, targetCombat.health - damage);
        targetCombat.lastDamageTime = currentTime;

        // Apply stun
        if (attackData.stunDuration > 0) {
            targetCombat.isStunned = true;
            targetCombat.stunEndTime = currentTime + attackData.stunDuration * 1000;
        }
    }

    // Calculate knockback direction
    let knockbackDirection: Vector3 | undefined;
    if (attackData.knockback > 0 && attacker.transform && target.transform) {
        knockbackDirection = new Vector3()
            .subVectors(target.transform.position, attacker.transform.position)
            .normalize()
            .multiplyScalar(attackData.knockback);
    }

    return {
        success: true,
        damage,
        dodged: false,
        knockbackDirection,
    };
}

// ============================================================================
// DAMAGE CALCULATION
// ============================================================================

/**
 * Calculate final damage after armor and variance
 *
 * Formula: finalDamage = baseDamage * (1 ± 0.1) * (1 - armorPercent)
 */
export function calculateDamage(
    attacker: Entity,
    target: Entity,
    attackType: AttackType
): number {
    const attackData = ATTACK_DATA[attackType];
    let baseDamage = attackData.baseDamage;

    // Species-specific damage modifiers
    if (attackType === 'bite' && attacker.species) {
        switch (attacker.species.speciesId) {
            case 'wolf':
                baseDamage = 40;
                break;
            case 'otter':
                baseDamage = 30;
                break;
            case 'meerkat':
                baseDamage = 28;
                break;
        }
    }

    // Apply damage variance (±10%)
    const variance = 0.9 + Math.random() * 0.2;
    let damage = baseDamage * variance;

    // Apply target armor reduction
    if (target.combat) {
        let armorPercent = target.combat.armor / 100;

        // Roll crush ignores 50% of armor
        if (attackType === 'roll_crush') {
            armorPercent *= 0.5;
        }

        damage *= 1 - armorPercent;
    }

    return Math.round(damage);
}

// ============================================================================
// COMBAT SYSTEM
// ============================================================================

/**
 * Combat System - Process attack requests and damage
 *
 * Run at priority 35 (after collision, before health)
 */
export interface PendingAttack {
    attacker: Entity;
    target: Entity;
    attackType: AttackType;
}

export function createCombatSystem() {
    const pendingAttacks: PendingAttack[] = [];

    return {
        name: 'CombatSystem',
        priority: 35,

        /**
         * Queue an attack for processing
         */
        queueAttack(attacker: Entity, target: Entity, attackType: AttackType): void {
            pendingAttacks.push({ attacker, target, attackType });
        },

        /**
         * Process all pending attacks
         */
        update(deltaTime: number): AttackResult[] {
            const results: AttackResult[] = [];
            const currentTime = Date.now();

            for (const attack of pendingAttacks) {
                const result = executeAttack(
                    attack.attacker,
                    attack.target,
                    attack.attackType,
                    currentTime
                );
                results.push(result);

                // Apply knockback to movement
                if (result.knockbackDirection && attack.target.movement) {
                    attack.target.movement.velocity.add(result.knockbackDirection);
                }
            }

            // Clear pending attacks
            pendingAttacks.length = 0;

            return results;
        },

        /**
         * Get remaining cooldown for an attack (0 if ready)
         */
        getCooldownRemaining(entity: Entity, attackType: AttackType): number {
            const cooldownEnd = entity.attackCooldowns?.[attackType] || 0;
            const remaining = cooldownEnd - Date.now();
            return Math.max(0, remaining);
        },
    };
}

// ============================================================================
// DAMAGE FEEDBACK
// ============================================================================

/**
 * Create damage number display data
 */
export interface DamageNumber {
    value: number;
    position: Vector3;
    isCritical: boolean;
    isDodge: boolean;
    isArmored: boolean;
    timestamp: number;
}

/**
 * Create damage feedback from attack result
 */
export function createDamageFeedback(
    result: AttackResult,
    targetPosition: Vector3
): DamageNumber | null {
    if (!result.success) return null;

    // 5% critical hit chance
    const isCritical = !result.dodged && Math.random() < 0.05;
    const finalDamage = isCritical && result.damage ? result.damage * 1.5 : result.damage || 0;

    return {
        value: Math.round(finalDamage),
        position: targetPosition.clone().add(new Vector3(0, 2, 0)),
        isCritical,
        isDodge: result.dodged || false,
        isArmored: (result.damage || 0) < ATTACK_DATA.bite.baseDamage * 0.8,
        timestamp: Date.now(),
    };
}

// ============================================================================
// NPC ATTACK AI
// ============================================================================

/**
 * Determine best attack for NPC based on range and archetype
 */
export function selectBestAttack(
    npc: Entity,
    targetDistance: number
): AttackType | null {
    const combat = npc.combat;
    if (!combat?.attacks) return null;

    // Filter attacks by range and cooldown
    const availableAttacks = combat.attacks.filter((attack) => {
        const data = ATTACK_DATA[attack];
        const cooldown = npc.attackCooldowns?.[attack] || 0;
        return (
            targetDistance <= data.range &&
            combat.stamina >= data.staminaCost &&
            Date.now() >= cooldown
        );
    });

    if (availableAttacks.length === 0) return null;

    // Select best attack based on situation
    // Prefer gap closers when far, high damage when close
    if (targetDistance > 2 && availableAttacks.includes('pounce')) {
        return 'pounce';
    }

    // Prefer stun attacks
    if (availableAttacks.includes('headbutt')) {
        return 'headbutt';
    }

    // Default to highest damage available
    return availableAttacks.sort((a, b) =>
        ATTACK_DATA[b].baseDamage - ATTACK_DATA[a].baseDamage
    )[0];
}
