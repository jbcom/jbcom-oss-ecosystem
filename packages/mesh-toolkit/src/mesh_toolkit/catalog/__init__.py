"""Meshy Animation Catalog.

Auto-generated from https://docs.meshy.ai/en/api/animation-library.

This module provides:
- AnimationCatalog: Query and lookup animations
- AnimationId: Master enum with all 678 animation IDs
- Category-specific enums: WalkAndRunAnimation, FightingAnimation, etc.

Usage:
    from tools.meshy.catalog import AnimationId, AnimationCatalog

    # Use type-safe enum instead of magic numbers
    anim_id = AnimationId.WALKING_WOMAN

    # Query the catalog
    catalog = AnimationCatalog()
    anim = catalog.get_by_id(4)
    print(anim["name"])  # "Attack"
"""

from __future__ import annotations

import json
from enum import IntEnum
from pathlib import Path
from typing import Any


class AnimationId(IntEnum):
    """Master enum with all Meshy animation IDs."""

    IDLE = 0  # Idle (DailyActions - Idle)
    WALKING_WOMAN = 1  # Walking_Woman (WalkAndRun - Walking)
    ALERT = 2  # Alert (DailyActions - LookingAround)
    ARISE = 3  # Arise (DailyActions - LookingAround)
    ATTACK = 4  # Attack (Fighting - AttackingwithWeapon)
    BACKLEFT_RUN = 5  # BackLeft_run (WalkAndRun - Running)
    BACKRIGHT_RUN = 6  # BackRight_Run (WalkAndRun - Running)
    BEHIT_FLYUP = 7  # BeHit_FlyUp (Fighting - GettingHit)
    DEAD = 8  # Dead (Fighting - Dying)
    FORWARDLEFT_RUN_FIGHT = 9  # ForwardLeft_Run_Fight (Fighting - Transitioning)
    FORWARDRIGHT_RUN_FIGHT = 10  # ForwardRight_Run_Fight (Fighting - Transitioning)
    IDLE_02 = 11  # Idle_02 (DailyActions - Idle)
    IDLE_03 = 12  # Idle_03 (DailyActions - Idle)
    JUMP_RUN = 13  # Jump_Run (WalkAndRun - Running)
    RUN_02 = 14  # Run_02 (WalkAndRun - Running)
    RUN_03 = 15  # Run_03 (WalkAndRun - Running)
    RUNFAST = 16  # RunFast (WalkAndRun - Running)
    SKILL_01 = 17  # Skill_01 (BodyMovements - Acting)
    SKILL_02 = 18  # Skill_02 (BodyMovements - Acting)
    SKILL_03 = 19  # Skill_03 (BodyMovements - Acting)
    WALK_FIGHT_BACK = 20  # Walk_Fight_Back (WalkAndRun - Walking)
    WALK_FIGHT_FORWARD = 21  # Walk_Fight_Forward (WalkAndRun - Walking)
    FUNNYDANCING_01 = 22  # FunnyDancing_01 (Dancing - Dancing)
    FUNNYDANCING_02 = 23  # FunnyDancing_02 (Dancing - Dancing)
    FUNNYDANCING_03 = 24  # FunnyDancing_03 (Dancing - Dancing)
    AGREE_GESTURE = 25  # Agree_Gesture (DailyActions - Interacting)
    ANGRY_STOMP = 26  # Angry_Stomp (DailyActions - Interacting)
    BIG_HEART_GESTURE = 27  # Big_Heart_Gesture (BodyMovements - Acting)
    BIG_WAVE_HELLO = 28  # Big_Wave_Hello (DailyActions - Interacting)
    CALL_GESTURE = 29  # Call_Gesture (BodyMovements - Acting)
    CASUAL_WALK = 30  # Casual_Walk (WalkAndRun - Walking)
    CATCHING_BREATH = 31  # Catching_Breath (BodyMovements - Acting)
    CHAIR_SIT_IDLE_F = 32  # Chair_Sit_Idle_F (DailyActions - Idle)
    CHAIR_SIT_IDLE_M = 33  # Chair_Sit_Idle_M (DailyActions - Idle)
    CHECKOUT_GESTURE = 34  # Checkout_Gesture (DailyActions - Interacting)
    CLAPPING_RUN = 35  # Clapping_Run (BodyMovements - Acting)
    CONFUSED_SCRATCH = 36  # Confused_Scratch (DailyActions - Idle)
    DISCUSS_WHILE_MOVING = 37  # Discuss_While_Moving (DailyActions - Interacting)
    DOZING_ELDERLY = 38  # Dozing_Elderly (DailyActions - Idle)
    EXCITED_WALK_F = 39  # Excited_Walk_F (BodyMovements - Acting)
    EXCITED_WALK_M = 40  # Excited_Walk_M (BodyMovements - Acting)
    FORMAL_BOW = 41  # Formal_Bow (DailyActions - Interacting)
    GENTLEMANS_BOW = 42  # Gentlemans_Bow (DailyActions - Interacting)
    HANDBAG_WALK = 43  # Handbag_Walk (BodyMovements - Acting)
    HAPPY_JUMP_F = 44  # Happy_jump_f (BodyMovements - Acting)
    INDOOR_PLAY = 45  # Indoor_Play (BodyMovements - Acting)
    JUMP_ROPE = 46  # Jump_Rope (BodyMovements - Acting)
    LISTENING_GESTURE = 47  # Listening_Gesture (DailyActions - Interacting)
    MIRROR_VIEWING = 48  # Mirror_Viewing (DailyActions - Idle)
    MOTIVATIONAL_CHEER = 49  # Motivational_Cheer (DailyActions - Interacting)
    PHONE_CALL_GESTURE = 50  # Phone_Call_Gesture (DailyActions - Interacting)
    SHOUTING_ANGRILY = 51  # Shouting_Angrily (BodyMovements - Acting)
    SIT_TO_STAND_TRANSITION_F = 52  # Sit_to_Stand_Transition_F (DailyActions - Transitioning)
    SIT_TO_STAND_TRANSITION_M = 53  # Sit_to_Stand_Transition_M (DailyActions - Transitioning)
    SQUAT_STANCE = 54  # Squat_Stance (Dancing - Dancing)
    STAGE_WALK = 55  # Stage_Walk (WalkAndRun - Walking)
    STAND_AND_CHAT = 56  # Stand_and_Chat (DailyActions - Interacting)
    STAND_TO_SIT_TRANSITION_M = 57  # Stand_to_Sit_Transition_M (DailyActions - Transitioning)
    STEP_TO_SIT_TRANSITION = 58  # Step_to_Sit_Transition (DailyActions - Transitioning)
    VICTORY_CHEER = 59  # Victory_Cheer (BodyMovements - Acting)
    WALK_TO_SIT = 60  # Walk_to_Sit (DailyActions - Transitioning)
    HAPPY_JUMP_M = 61  # happy_jump_m (BodyMovements - Acting)
    PENGUIN_WALK = 62  # penguin_walk (BodyMovements - Acting)
    ARM_CIRCLE_SHUFFLE = 63  # Arm_Circle_Shuffle (Dancing - Dancing)
    ALL_NIGHT_DANCE = 64  # All_Night_Dance (Dancing - Dancing)
    BASS_BEATS = 65  # Bass_Beats (Dancing - Dancing)
    BOOM_DANCE = 66  # Boom_Dance (Dancing - Dancing)
    BUBBLE_DANCE = 67  # Bubble_Dance (Dancing - Dancing)
    CHERISH_POP_DANCE = 68  # Cherish_Pop_Dance (Dancing - Dancing)
    CRYSTAL_BEADS = 69  # Crystal_Beads (Dancing - Dancing)
    CARDIO_DANCE = 70  # Cardio_Dance (Dancing - Dancing)
    DENIM_POP_DANCE = 71  # Denim_Pop_Dance (Dancing - Dancing)
    DONT_YOU_DARE = 72  # Dont_You_Dare (Dancing - Dancing)
    FAST_LIGHTNING = 73  # Fast_Lightning (Dancing - Dancing)
    GANGNAM_GROOVE = 74  # Gangnam_Groove (Dancing - Dancing)
    INDOOR_SWING = 75  # Indoor_Swing (Dancing - Dancing)
    LOVE_YOU_POP_DANCE = 76  # Love_You_Pop_Dance (Dancing - Dancing)
    MAGIC_GENIE = 77  # Magic_Genie (Dancing - Dancing)
    NOT_YOUR_MOM = 78  # Not_Your_Mom (Dancing - Dancing)
    OMG_GROOVE = 79  # OMG_Groove (Dancing - Dancing)
    POP_DANCE_LSA2 = 80  # Pop_Dance_LSA2 (Dancing - Dancing)
    POD_BABY_GROOVE = 81  # Pod_Baby_Groove (Dancing - Dancing)
    SHAKE_IT_OFF_DANCE = 82  # Shake_It_Off_Dance (Dancing - Dancing)
    SUPERLOVE_POP_DANCE = 83  # Superlove_Pop_Dance (Dancing - Dancing)
    YOU_GROOVE = 84  # You_Groove (Dancing - Dancing)
    AXE_STANCE = 85  # Axe_Stance (Fighting - Transitioning)
    BASIC_JUMP = 86  # Basic_Jump (Fighting - AttackingwithWeapon)
    BOXING_PRACTICE = 87  # Boxing_Practice (Fighting - Punching)
    CHEST_POUND_TAUNT = 88  # Chest_Pound_Taunt (Fighting - Transitioning)
    COMBAT_STANCE = 89  # Combat_Stance (Fighting - AttackingwithWeapon)
    COUNTERSTRIKE = 90  # Counterstrike (Fighting - Punching)
    DOUBLE_BLADE_SPIN = 91  # Double_Blade_Spin (Fighting - AttackingwithWeapon)
    DOUBLE_COMBO_ATTACK = 92  # Double_Combo_Attack (Fighting - AttackingwithWeapon)
    DODGE_AND_COUNTER = 93  # Dodge_and_Counter (Fighting - Punching)
    FLYING_FIST_KICK = 94  # Flying_Fist_Kick (Fighting - Punching)
    GUN_HOLD_LEFT_TURN = 95  # Gun_Hold_Left_Turn (Fighting - AttackingwithWeapon)
    KUNG_FU_PUNCH = 96  # Kung_Fu_Punch (Fighting - Punching)
    LEFT_SLASH = 97  # Left_Slash (Fighting - AttackingwithWeapon)
    RUN_AND_SHOOT = 98  # Run_and_Shoot (Fighting - AttackingwithWeapon)
    REAPING_SWING = 99  # Reaping_Swing (Fighting - Transitioning)
    RIGHTWARD_SPIN = 100  # Rightward_Spin (Fighting - Transitioning)
    SWORD_SHOUT = 101  # Sword_Shout (BodyMovements - Acting)
    SWORD_JUDGMENT = 102  # Sword_Judgment (Fighting - AttackingwithWeapon)
    SIMPLE_KICK = 103  # Simple_Kick (Fighting - AttackingwithWeapon)
    SIDE_SHOT = 104  # Side_Shot (Fighting - AttackingwithWeapon)
    TRIPLE_COMBO_ATTACK = 105  # Triple_Combo_Attack (Fighting - AttackingwithWeapon)
    CONFIDENT_WALK = 106  # Confident_Walk (WalkAndRun - Walking)
    CONFIDENT_STRUT = 107  # Confident_Strut (WalkAndRun - Walking)
    FLIRTY_STRUT = 108  # Flirty_Strut (WalkAndRun - Walking)
    GROOVY_WALK = 109  # Groovy_Walk (BodyMovements - Acting)
    HELLO_RUN = 110  # Hello_Run (WalkAndRun - Running)
    INJURED_WALK = 111  # Injured_Walk (WalkAndRun - Walking)
    MONSTER_WALK = 112  # Monster_Walk (WalkAndRun - Walking)
    MUMMY_STAGGER = 113  # Mummy_Stagger (BodyMovements - Acting)
    PROUD_STRUT = 114  # Proud_Strut (WalkAndRun - Walking)
    QUICK_WALK = 115  # Quick_Walk (WalkAndRun - Walking)
    RUN_TO_WALK_TRANSITION = 116  # Run_to_Walk_Transition (WalkAndRun - Walking)
    RED_CARPET_WALK = 117  # Red_Carpet_Walk (WalkAndRun - Walking)
    SKIP_FORWARD = 118  # Skip_Forward (WalkAndRun - Walking)
    SLOW_ORC_WALK = 119  # Slow_Orc_Walk (WalkAndRun - Walking)
    TOUCH_AND_RUN = 120  # Touch_and_Run (WalkAndRun - Running)
    THOUGHTFUL_WALK = 121  # Thoughtful_Walk (WalkAndRun - Walking)
    TEXTING_WALK = 122  # Texting_Walk (WalkAndRun - Walking)
    UNSTEADY_WALK = 123  # Unsteady_Walk (WalkAndRun - Walking)
    WALKING_WITH_PHONE = 124  # Walking_with_Phone (WalkAndRun - Walking)
    CHARGED_SPELL_CAST = 125  # Charged_Spell_Cast (Fighting - CastingSpell)
    CHARGED_SPELL_CAST_1 = 126  # Charged_Spell_Cast_1 (Fighting - CastingSpell)
    CHARGED_GROUND_SLAM = 127  # Charged_Ground_Slam (Fighting - CastingSpell)
    HEAVY_HAMMER_SWING = 128  # Heavy_Hammer_Swing (Fighting - AttackingwithWeapon)
    MAGE_SOELL_CAST = 129  # mage_soell_cast (Fighting - CastingSpell)
    MAGE_SOELL_CAST_1 = 130  # mage_soell_cast_1 (Fighting - CastingSpell)
    MAGE_SOELL_CAST_2 = 131  # mage_soell_cast_2 (Fighting - CastingSpell)
    MAGE_SOELL_CAST_3 = 132  # mage_soell_cast_3 (Fighting - CastingSpell)
    MAGE_SOELL_CAST_4 = 133  # mage_soell_cast_4 (Fighting - CastingSpell)
    MAGE_SOELL_CAST_5 = 134  # mage_soell_cast_5 (Fighting - CastingSpell)
    MAGE_SOELL_CAST_6 = 135  # mage_soell_cast_6 (Fighting - CastingSpell)
    MAGE_SOELL_CAST_7 = 136  # mage_soell_cast_7 (Fighting - CastingSpell)
    MAGE_SOELL_CAST_8 = 137  # mage_soell_cast_8 (Fighting - CastingSpell)
    BLOCK1 = 138  # Block1 (Fighting - Blocking)
    BLOCK2 = 139  # Block2 (Fighting - Blocking)
    BLOCK3 = 140  # Block3 (Fighting - Blocking)
    BLOCK4 = 141  # Block4 (Fighting - Blocking)
    BLOCK5 = 142  # Block5 (Fighting - Blocking)
    BLOCK6 = 143  # Block6 (Fighting - Blocking)
    BLOCK8 = 144  # Block8 (Fighting - Blocking)
    BLOCK9 = 145  # Block9 (Fighting - Blocking)
    BLOCK10 = 146  # Block10 (Fighting - Blocking)
    SWORD_PARRY = 147  # Sword_Parry (Fighting - Blocking)
    SWORD_PARRY_BACKWARD = 148  # Sword_Parry_Backward (Fighting - Blocking)
    TWO_HANDED_PARRY = 149  # Two_Handed_Parry (Fighting - Blocking)
    HIT_REACTION_WITH_BOW = 150  # Hit_Reaction_with_Bow (Fighting - Blocking)
    SWORD_PARRY_BACKWARD_1 = 151  # Sword_Parry_Backward_1 (Fighting - Blocking)
    SWORD_PARRY_BACKWARD_2 = 152  # Sword_Parry_Backward_2 (Fighting - Blocking)
    SWORD_PARRY_BACKWARD_3 = 153  # Sword_Parry_Backward_3 (Fighting - Blocking)
    SWORD_PARRY_BACKWARD_4 = 154  # Sword_Parry_Backward_4 (Fighting - Blocking)
    SWORD_PARRY_BACKWARD_5 = 155  # Sword_Parry_Backward_5 (Fighting - Blocking)
    STAND_DODGE = 156  # Stand_Dodge (Fighting - Transitioning)
    STAND_DODGE_1 = 157  # Stand_Dodge_1 (Fighting - Transitioning)
    ROLL_DODGE = 158  # Roll_Dodge (Fighting - Transitioning)
    ROLL_DODGE_1 = 159  # Roll_Dodge_1 (Fighting - Transitioning)
    ROLL_DODGE_2 = 160  # Roll_Dodge_2 (Fighting - Transitioning)
    ROLL_DODGE_3 = 161  # Roll_Dodge_3 (Fighting - Transitioning)
    STAND_DODGE_2 = 162  # Stand_Dodge_2 (Fighting - Transitioning)
    ROLL_DODGE_4 = 163  # Roll_Dodge_4 (Fighting - Transitioning)
    STAND_DODGE_3 = 164  # Stand_Dodge_3 (Fighting - Transitioning)
    KNEELING_RELOAD = 165  # Kneeling_Reload (Fighting - Transitioning)
    RUNNING_RELOAD = 166  # Running_Reload (Fighting - Transitioning)
    SLOW_WALK_RELOAD = 167  # Slow_Walk_Reload (Fighting - Transitioning)
    PRONE_RELOAD = 168  # Prone_Reload (Fighting - Transitioning)
    FORWARD_RELOAD_SUBTLE = 169  # Forward_Reload_Subtle (Fighting - Transitioning)
    STANDING_RELOAD = 170  # Standing_Reload (Fighting - Transitioning)
    HIT_REACTION_TO_WAIST = 171  # Hit_Reaction_to_Waist (Fighting - Transitioning)
    ELECTROCUTION_REACTION = 172  # Electrocution_Reaction (Fighting - GettingHit)
    SLAP_REACTION = 173  # Slap_Reaction (Fighting - GettingHit)
    FACE_PUNCH_REACTION = 174  # Face_Punch_Reaction (Fighting - GettingHit)
    FACE_PUNCH_REACTION_1 = 175  # Face_Punch_Reaction_1 (Fighting - GettingHit)
    FACE_PUNCH_REACTION_2 = 176  # Face_Punch_Reaction_2 (Fighting - GettingHit)
    GUNSHOT_REACTION = 177  # Gunshot_Reaction (Fighting - GettingHit)
    HIT_REACTION = 178  # Hit_Reaction (Fighting - GettingHit)
    HIT_REACTION_1 = 179  # Hit_Reaction_1 (Fighting - GettingHit)
    SHOT_IN_THE_BACK_AND_FALL = 180  # Shot_in_the_Back_and_Fall (Fighting - GettingHit)
    ELECTROCUTED_FALL = 181  # Electrocuted_Fall (Fighting - Dying)
    SHOT_AND_BLOWN_BACK = 182  # Shot_and_Blown_Back (Fighting - Dying)
    SHOT_AND_FALL_BACKWARD = 183  # Shot_and_Fall_Backward (Fighting - Dying)
    SHOT_AND_FALL_FORWARD = 184  # Shot_and_Fall_Forward (Fighting - Dying)
    SHOT_AND_SLOW_FALL_BACKWARD = 185  # Shot_and_Slow_Fall_Backward (Fighting - Dying)
    STRANGLED_AND_FALL_FORWARD = 186  # Strangled_and_Fall_Forward (Fighting - Dying)
    KNOCK_DOWN = 187  # Knock_Down (Fighting - Dying)
    FALL_DEAD_FROM_ABDOMINAL_INJURY = 188  # Fall_Dead_from_Abdominal_Injury (Fighting - Dying)
    DYING_BACKWARDS = 189  # dying_backwards (Fighting - Dying)
    KNOCK_DOWN_1 = 190  # Knock_Down_1 (Fighting - Dying)
    LEFT_JAB_FROM_GUARD = 191  # Left_Jab_from_Guard (Fighting - Punching)
    RIGHT_JAB_FROM_GUARD = 192  # Right_Jab_from_Guard (Fighting - Punching)
    LEFT_HOOK_FROM_GUARD = 193  # Left_Hook_from_Guard (Fighting - Punching)
    RIGHT_UPPERCUT_FROM_GUARD = 194  # Right_Uppercut_from_Guard (Fighting - Punching)
    RIGHT_UPPER_HOOK_FROM_GUARD = 195  # Right_Upper_Hook_from_Guard (Fighting - Punching)
    LEFT_UPPERCUT_FROM_GUARD = 196  # Left_Uppercut_from_Guard (Fighting - Punching)
    LEFT_SHORT_HOOK_FROM_GUARD = 197  # Left_Short_Hook_from_Guard (Fighting - Punching)
    PUNCH_COMBO = 198  # Punch_Combo (Fighting - Punching)
    WEAPON_COMBO = 199  # Weapon_Combo (Fighting - Punching)
    PUNCH_COMBO_1 = 200  # Punch_Combo_1 (Fighting - Punching)
    PUNCH_COMBO_2 = 201  # Punch_Combo_2 (Fighting - Punching)
    WEAPON_COMBO_1 = 202  # Weapon_Combo_1 (Fighting - Punching)
    PUNCH_COMBO_3 = 203  # Punch_Combo_3 (Fighting - Punching)
    PUNCH_COMBO_4 = 204  # Punch_Combo_4 (Fighting - Punching)
    PUNCH_COMBO_5 = 205  # Punch_Combo_5 (Fighting - Punching)
    SPARTAN_KICK = 206  # Spartan_Kick (Fighting - Punching)
    ROUNDHOUSE_KICK = 207  # Roundhouse_Kick (Fighting - Punching)
    LUNGE_ROUNDHOUSE_KICK = 208  # Lunge_Roundhouse_Kick (Fighting - Punching)
    BOXING_GUARD_RIGHT_STRAIGHT_KICK = 209  # Boxing_Guard_Right_Straight_Kick (Fighting - Punching)
    BOXING_GUARD_PREP_STRAIGHT_PUNCH = 210  # Boxing_Guard_Prep_Straight_Punch (Fighting - Punching)
    BOXING_GUARD_STEP_KNEE_STRIKE = 211  # Boxing_Guard_Step_Knee_Strike (Fighting - Punching)
    ELBOW_STRIKE = 212  # Elbow_Strike (Fighting - Punching)
    LEG_SWEEP = 213  # Leg_Sweep (Fighting - Punching)
    PUNCH_FORWARD_WITH_BOTH_FISTS = 214  # Punch_Forward_with_Both_Fists (Fighting - Punching)
    HIGH_KICK = 215  # High_Kick (Fighting - Punching)
    LUNGE_SPIN_KICK = 216  # Lunge_Spin_Kick (Fighting - Punching)
    SWEEPING_KICK = 217  # Sweeping_Kick (Fighting - Punching)
    STEP_IN_HIGH_KICK = 218  # Step_in_High_Kick (Fighting - Punching)
    RIGHT_HAND_SWORD_SLASH = 219  # Right_Hand_Sword_Slash (Fighting - Punching)
    SHIELD_PUSH_LEFT = 220  # Shield_Push_Left (Fighting - Punching)
    CHARGED_UPWARD_SLASH = 221  # Charged_Upward_Slash (Fighting - Punching)
    DRAW_AND_SHOOT_FROM_BACK = 222  # Draw_and_Shoot_from_Back (Fighting - AttackingwithWeapon)
    DRAW_AND_SHOOT_FROM_BACK_1 = 223  # Draw_and_Shoot_from_Back_1 (Fighting - AttackingwithWeapon)
    ARCHERY_SHOT = 224  # Archery_Shot (Fighting - AttackingwithWeapon)
    ARCHERY_SHOT_1 = 225  # Archery_Shot_1 (Fighting - AttackingwithWeapon)
    ARCHERY_SHOT_2 = 226  # Archery_Shot_2 (Fighting - AttackingwithWeapon)
    ARCHERY_SHOT_3 = 227  # Archery_Shot_3 (Fighting - AttackingwithWeapon)
    WALK_FORWARD_WITH_BOW_AIMED = (
        228  # Walk_Forward_with_Bow_Aimed (Fighting - AttackingwithWeapon)
    )
    DRAW_AND_SHOOT_FROM_BACK_2 = 229  # Draw_and_Shoot_from_Back_2 (Fighting - AttackingwithWeapon)
    WALK_BACKWARD_WITH_BOW_AIMED = (
        230  # Walk_Backward_with_Bow_Aimed (Fighting - AttackingwithWeapon)
    )
    ARCHERY_AIM_WITH_LATERAL_SCAN = (
        231  # Archery_Aim_with_Lateral_Scan (Fighting - AttackingwithWeapon)
    )
    COWBOY_QUICK_DRAW_SHOOTING = 232  # Cowboy_Quick_Draw_Shooting (Fighting - AttackingwithWeapon)
    WALK_BACKWARD_WHILE_SHOOTING = (
        233  # Walk_Backward_While_Shooting (Fighting - AttackingwithWeapon)
    )
    WALK_FORWARD_WHILE_SHOOTING = (
        234  # Walk_Forward_While_Shooting (Fighting - AttackingwithWeapon)
    )
    FORWARD_ROLL_AND_FIRE = 235  # Forward_Roll_and_Fire (Fighting - AttackingwithWeapon)
    DRAW_AND_SHOOT_LEFT = 236  # Draw_and_Shoot_Left (Fighting - AttackingwithWeapon)
    CHARGED_AXE_CHOP = 237  # Charged_Axe_Chop (Fighting - AttackingwithWeapon)
    AXE_SPIN_ATTACK = 238  # Axe_Spin_Attack (Fighting - AttackingwithWeapon)
    CROUCH_PULL_AND_THROW = 239  # Crouch_Pull_and_Throw (Fighting - AttackingwithWeapon)
    THRUST_SLASH = 240  # Thrust_Slash (Fighting - AttackingwithWeapon)
    WEAPON_COMBO_2 = 241  # Weapon_Combo_2 (Fighting - AttackingwithWeapon)
    CHARGED_SLASH = 242  # Charged_Slash (Fighting - AttackingwithWeapon)
    IDLE_3 = 243  # Idle_3 (DailyActions - Idle)
    IDLE_4 = 244  # Idle_4 (DailyActions - Idle)
    IDLE_5 = 245  # Idle_5 (DailyActions - Idle)
    IDLE_6 = 246  # Idle_6 (DailyActions - Idle)
    IDLE_7 = 247  # Idle_7 (DailyActions - Idle)
    IDLE_8 = 248  # Idle_8 (DailyActions - Idle)
    IDLE_9 = 249  # Idle_9 (DailyActions - Idle)
    IDLE_10 = 250  # Idle_10 (DailyActions - Idle)
    IDLE_11 = 251  # Idle_11 (DailyActions - Idle)
    IDLE_12 = 252  # Idle_12 (DailyActions - Idle)
    IDLE_13 = 253  # Idle_13 (DailyActions - Idle)
    IDLE_14 = 254  # Idle_14 (DailyActions - Idle)
    ANGRY_GROUND_STOMP = 255  # Angry_Ground_Stomp (DailyActions - Idle)
    ANGRY_GROUND_STOMP_1 = 256  # Angry_Ground_Stomp_1 (DailyActions - Idle)
    ANGRY_GROUND_STOMP_2 = 257  # Angry_Ground_Stomp_2 (DailyActions - Idle)
    CROUCHLOOKAROUNDBOW = 258  # CrouchLookAroundBow (DailyActions - Idle)
    STEP_FORWARD_AND_PUSH = 259  # Step_Forward_and_Push (DailyActions - Pushing)
    PUSH_FORWARD_AND_STOP = 260  # Push_Forward_and_Stop (DailyActions - Pushing)
    PUSH_AND_WALK_FORWARD = 261  # Push_and_Walk_Forward (DailyActions - Pushing)
    CROUCH_AND_PUSH_FORWARD = 262  # Crouch_and_Push_Forward (DailyActions - Pushing)
    SLEEP_ON_DESK = 263  # Sleep_on_Desk (DailyActions - Sleeping)
    COUGH_WHILE_SLEEPING = 264  # Cough_While_Sleeping (DailyActions - Sleeping)
    GROAN_HOLDING_STOMACH_IN_SLEEP = 265  # Groan_Holding_Stomach_in_Sleep (DailyActions - Sleeping)
    LIE_DOWN_HANDS_SPREAD = 266  # Lie_Down_Hands_Spread (DailyActions - Sleeping)
    SLEEP_NORMALLY = 267  # Sleep_Normally (DailyActions - Sleeping)
    SIT_AND_DOZE_OFF = 268  # Sit_and_Doze_Off (DailyActions - Sleeping)
    SLEEP = 269  # sleep (DailyActions - Sleeping)
    TOSS_AND_TURN = 270  # Toss_and_Turn (DailyActions - Sleeping)
    WAKE_UP_AND_LOOK_UP = 271  # Wake_Up_and_Look_Up (DailyActions - Sleeping)
    LIE_ON_CHAIR_SUNBATHE_AND_SLEEP = (
        272  # Lie_on_Chair_Sunbathe_and_Sleep (DailyActions - Sleeping)
    )
    MALE_RUN_FORWARD_PICK_UP_LEFT = (
        273  # Male_Run_Forward_Pick_Up_Left (DailyActions - PickingUpItem)
    )
    FEMALE_CROUCH_PICK_UP_PLACE_SIDE = (
        274  # Female_Crouch_Pick_Up_Place_Side (DailyActions - PickingUpItem)
    )
    FEMALE_RUN_FORWARD_PICK_UP_RIGHT = (
        275  # Female_Run_Forward_Pick_Up_Right (DailyActions - PickingUpItem)
    )
    MALE_BEND_OVER_PICK_UP = 276  # Male_Bend_Over_Pick_Up (DailyActions - PickingUpItem)
    FEMALE_CROUCH_PICK_FRUIT_BASKET_STAND = (
        277  # Female_Crouch_Pick_Fruit_Basket_Stand (DailyActions - PickingUpItem)
    )
    FEMALE_STAND_PICK_FRUIT_BASKET = (
        278  # Female_Stand_Pick_Fruit_Basket (DailyActions - PickingUpItem)
    )
    FEMALE_CROUCH_PICK_GUN_POINT_FORWARD = (
        279  # Female_Crouch_Pick_Gun_Point_Forward (DailyActions - PickingUpItem)
    )
    FEMALE_CROUCH_PICK_THROW_FORWARD = (
        280  # Female_Crouch_Pick_Throw_Forward (DailyActions - PickingUpItem)
    )
    FEMALE_BEND_OVER_PICK_UP_INSPECT = (
        281  # Female_Bend_Over_Pick_Up_Inspect (DailyActions - PickingUpItem)
    )
    FEMALE_WALK_PICK_PUT_IN_POCKET = (
        282  # Female_Walk_Pick_Put_In_Pocket (DailyActions - PickingUpItem)
    )
    PULL_RADISH = 283  # Pull_Radish (DailyActions - PickingUpItem)
    COLLECT_OBJECT = 284  # Collect_Object (DailyActions - PickingUpItem)
    OPEN_DOOR = 285  # open_door (DailyActions - Interacting)
    OPEN_DOOR_1 = 286  # open_door_1 (DailyActions - Interacting)
    OPEN_DOOR_2 = 287  # open_door_2 (DailyActions - Interacting)
    OPEN_DOOR_3 = 288  # open_door_3 (DailyActions - Interacting)
    OPEN_DOOR_4 = 289  # open_door_4 (DailyActions - Interacting)
    WAVE_ONE_HAND = 290  # Wave_One_Hand (DailyActions - Interacting)
    WAVE_FOR_HELP = 291  # Wave_for_Help (DailyActions - Interacting)
    GESTURE_WITH_HAND_ON_GUN = 292  # Gesture_with_Hand_on_Gun (DailyActions - Interacting)
    WAVE_FOR_HELP_1 = 293  # Wave_for_Help_1 (DailyActions - Interacting)
    WAVE_FOR_HELP_2 = 294  # Wave_for_Help_2 (DailyActions - Interacting)
    WAVE_FOR_HELP_3 = 295  # Wave_for_Help_3 (DailyActions - Interacting)
    WAVE_FOR_HELP_4 = 296  # Wave_for_Help_4 (DailyActions - Interacting)
    PERSONALIZED_GESTURE = 297  # Personalized_Gesture (DailyActions - Interacting)
    CHEER_WITH_BOTH_HANDS_UP = 298  # Cheer_with_Both_Hands_Up (DailyActions - Interacting)
    STAND_CLAP_AND_SIT_DOWN = 299  # Stand_Clap_and_Sit_Down (DailyActions - Interacting)
    SIT_CHEER_WITH_LEFT_HAND = 300  # Sit_Cheer_with_Left_Hand (DailyActions - Interacting)
    CHEER_WITH_BOTH_HANDS_1 = 301  # Cheer_with_Both_Hands_1 (DailyActions - Interacting)
    STAND_WAVE_AND_SIT_DOWN = 302  # Stand_Wave_and_Sit_Down (DailyActions - Interacting)
    CHEER_WITH_BOTH_HANDS = 303  # Cheer_with_Both_Hands (DailyActions - Interacting)
    SEATED_FIST_PUMP = 304  # Seated_Fist_Pump (DailyActions - Interacting)
    STAND_CHEER_AND_SIT_DOWN = 305  # Stand_Cheer_and_Sit_Down (DailyActions - Interacting)
    CHEER_WITH_ONE_HAND_UP = 306  # Cheer_with_One_Hand_Up (DailyActions - Interacting)
    SITTING_ANSWERING_QUESTIONS = 307  # Sitting_Answering_Questions (DailyActions - Interacting)
    TALK_PASSIONATELY = 308  # Talk_Passionately (DailyActions - Interacting)
    TALK_WITH_LEFT_HAND_ON_HIP = 309  # Talk_with_Left_Hand_on_Hip (DailyActions - Interacting)
    TALK_WITH_LEFT_HAND_RAISED = 310  # Talk_with_Left_Hand_Raised (DailyActions - Interacting)
    STAND_TALKING_ANGRY = 311  # Stand_Talking_Angry (DailyActions - Interacting)
    PHONE_CONVERSATION = 312  # Phone_Conversation (DailyActions - Interacting)
    TALK_WITH_HANDS_OPEN = 313  # Talk_with_Hands_Open (DailyActions - Interacting)
    TALK_WITH_RIGHT_HAND_OPEN = 314  # Talk_with_Right_Hand_Open (DailyActions - Interacting)
    HAND_ON_HIP_GESTURE = 315  # Hand_on_Hip_Gesture (DailyActions - Interacting)
    HEADACHE_RELIEF = 316  # Headache_Relief (DailyActions - Interacting)
    SHRUG = 317  # Shrug (DailyActions - Interacting)
    SCHEMING_HAND_RUB = 318  # Scheming_Hand_Rub (DailyActions - Interacting)
    AIR_SQUAT = 319  # air_squat (DailyActions - WorkingOut)
    BICEP_CURL = 320  # bicep_curl (DailyActions - WorkingOut)
    BICYCLE_CRUNCH = 321  # bicycle_crunch (DailyActions - WorkingOut)
    CIRCLE_CRUNCH = 322  # circle_crunch (DailyActions - WorkingOut)
    GOLF_DRIVE = 323  # golf_drive (DailyActions - WorkingOut)
    IDLE_TO_PUSH_UP = 324  # idle_to_push_up (DailyActions - WorkingOut)
    JUMP_PUSH_UP = 325  # jump_push_up (DailyActions - WorkingOut)
    JUMPING_JACKS = 326  # jumping_jacks (DailyActions - WorkingOut)
    KETTLEBELL_SWING = 327  # kettlebell_swing (DailyActions - WorkingOut)
    PUSH_UP_TO_IDLE = 328  # push_up_to_idle (DailyActions - WorkingOut)
    PUSH_UP = 329  # push_up (DailyActions - WorkingOut)
    SITUPS = 330  # situps (DailyActions - WorkingOut)
    SUMO_HIGH_PULL = 331  # Sumo_High_Pull (DailyActions - WorkingOut)
    LOOK_AROUND_DUMBFOUNDED = 333  # Look_Around_Dumbfounded (DailyActions - LookingAround)
    LOWER_WEAPON_LOOK_RAISE = 334  # Lower_Weapon_Look_Raise (DailyActions - LookingAround)
    AXE_BREATHE_AND_LOOK_AROUND = 335  # Axe_Breathe_and_Look_Around (DailyActions - LookingAround)
    LONG_BREATHE_AND_LOOK_AROUND = (
        336  # Long_Breathe_and_Look_Around (DailyActions - LookingAround)
    )
    TORCH_LOOK_AROUND = 337  # Torch_Look_Around (DailyActions - LookingAround)
    SHORT_BREATHE_AND_LOOK_AROUND = (
        338  # Short_Breathe_and_Look_Around (DailyActions - LookingAround)
    )
    WALKING_SCAN_WITH_SUDDEN_LOOK_BACK = (
        339  # Walking_Scan_with_Sudden_Look_Back (DailyActions - LookingAround)
    )
    CRAWL_AND_LOOK_BACK = 340  # Crawl_and_Look_Back (DailyActions - LookingAround)
    WALK_SLOWLY_AND_LOOK_AROUND = 341  # Walk_Slowly_and_Look_Around (DailyActions - LookingAround)
    STAND_AND_DRINK = 342  # Stand_and_Drink (DailyActions - Drinking)
    SIT_AND_DRINK = 343  # Sit_and_Drink (DailyActions - Drinking)
    STAND_UP1 = 344  # Stand_Up1 (DailyActions - Transitioning)
    STAND_UP2 = 345  # Stand_Up2 (DailyActions - Transitioning)
    STAND_UP3 = 346  # Stand_Up3 (DailyActions - Transitioning)
    STAND_UP4 = 347  # Stand_Up4 (DailyActions - Transitioning)
    STAND_UP5 = 348  # Stand_Up5 (DailyActions - Transitioning)
    STAND_UP6 = 349  # Stand_Up6 (DailyActions - Transitioning)
    STAND_UP7 = 350  # Stand_Up7 (DailyActions - Transitioning)
    STAND_UP8 = 351  # Stand_Up8 (DailyActions - Transitioning)
    STAND_UP9 = 352  # Stand_Up9 (DailyActions - Transitioning)
    STAND_UP10 = 353  # Stand_Up10 (DailyActions - Transitioning)
    SITTING_CLAP = 354  # Sitting_Clap (DailyActions - Transitioning)
    SIT_FINGER_WAG_NO = 355  # Sit_Finger_Wag_No (DailyActions - Transitioning)
    SIT_HANDS_ON_HEAD_LEAN_BACK = 356  # Sit_Hands_on_Head_Lean_Back (DailyActions - Transitioning)
    SIT_THUMBS_UP_RIGHT = 357  # Sit_Thumbs_Up_Right (DailyActions - Transitioning)
    SIT_SHOUT_HANDS_ON_MOUTH = 358  # Sit_Shout_Hands_on_Mouth (DailyActions - Transitioning)
    LOOK_BACK_AND_SIT = 359  # Look_Back_and_Sit (DailyActions - Transitioning)
    SIT_TO_STANDTRANSITION_FEMALE_2 = (
        360  # Sit_to_standTransition_Female_2 (DailyActions - Transitioning)
    )
    SIT_DODGE = 361  # Sit_Dodge (DailyActions - Transitioning)
    SIT_CROSS_LEGGED = 362  # Sit_Cross_Legged (DailyActions - Transitioning)
    SIT_CROSS_LEGGED_ON_FLOOR = 363  # Sit_Cross_Legged_on_Floor (DailyActions - Transitioning)
    SIT_ON_CHAIR_ARMS_CROSSED = 364  # Sit_on_Chair_Arms_Crossed (DailyActions - Transitioning)
    KNEEL_ON_ONE_KNEE_AND_STAND = 365  # Kneel_on_One_Knee_and_Stand (DailyActions - Transitioning)
    FALLING_DOWN = 366  # falling_down (DailyActions - Transitioning)
    SIDELYING_REACH_HELP = 367  # SideLying_Reach_Help (DailyActions - Transitioning)
    ANGRY_TO_TANTRUM_SIT = 368  # Angry_To_Tantrum_Sit (DailyActions - Transitioning)
    LIE_BACK_LEG_SWING = 369  # Lie_Back_Leg_Swing (DailyActions - Transitioning)
    STAND_TO_SIDE_LYING = 370  # Stand_To_Side_Lying (DailyActions - Transitioning)
    SIT_LIE_BED = 371  # Sit_Lie_Bed (DailyActions - Transitioning)
    PRONE_REACH_HELP = 372  # Prone_Reach_Help (DailyActions - Transitioning)
    HANDSTAND_FLIP = 375  # Handstand_Flip (BodyMovements - Acting)
    PUNCH_POSE = 376  # Punch_Pose (BodyMovements - Acting)
    RELAX_ARMS_THEN_STRIKE_BATTLE_POSE = (
        377  # Relax_arms_then_strike_battle_pose (BodyMovements - Acting)
    )
    LARGE_STEP_THEN_HIGH_KICK = 378  # Large_step_then_high_kick (BodyMovements - Acting)
    SIDE_JUMPS_IN_HORSE_STANCE = 379  # Side_jumps_in_horse_stance (BodyMovements - Acting)
    STEP_RIGHT_FOR_EXERCISE = 381  # Step_Right_for_Exercise (BodyMovements - Acting)
    JUMP_AND_SLAM_BACK_DOWN = 382  # Jump_and_Slam_Back_Down (BodyMovements - Acting)
    QUICK_STEP_AND_SPIN_DODGE = 384  # Quick_Step_and_Spin_Dodge (BodyMovements - Acting)
    BOXING_WARMUP = 385  # Boxing_Warmup (BodyMovements - Acting)
    ZOMBIE_SCREAM = 386  # Zombie_Scream (BodyMovements - Acting)
    HALF_SQUAT_WITH_THUMB_UP = 387  # Half_Squat_with_Thumb_Up (BodyMovements - Acting)
    SHOW_BOTH_ARM_MUSCLES = 388  # Show_Both_Arm_Muscles (BodyMovements - Acting)
    GRIP_AND_THROW_DOWN = 389  # Grip_and_Throw_Down (BodyMovements - Acting)
    STAND_ON_POLE_AND_BALANCE = 390  # Stand_on_Pole_and_Balance (BodyMovements - Acting)
    HEAD_HOLD_IN_PAIN = 391  # Head_Hold_in_Pain (BodyMovements - Acting)
    GROUND_FLIP_AND_SWEEP_UP = 392  # Ground_Flip_and_Sweep_Up (BodyMovements - Acting)
    BASEBALL_PITCHING = 393  # baseball_pitching (BodyMovements - Acting)
    BACKFLIP_AND_HOOKS = 394  # Backflip_and_Hooks (BodyMovements - Acting)
    BREAKDANCE_1990 = 395  # Breakdance_1990 (BodyMovements - Acting)
    BURPEE_EXERCISE = 396  # Burpee_Exercise (BodyMovements - Acting)
    POWER_SPIN_JUMP_360 = 397  # 360_Power_Spin_Jump (BodyMovements - Acting)
    CROUCH_CHARGE_AND_THROW = 398  # Crouch_Charge_and_Throw (BodyMovements - Acting)
    STEP_STEP_TURN_KICK = 399  # Step_Step_Turn_Kick (BodyMovements - Acting)
    SPRINT_ROLL_AND_FLIP = 401  # Sprint_Roll_and_Flip (BodyMovements - Acting)
    RUN_AND_LEAP = 402  # Run_and_Leap (BodyMovements - Acting)
    VICTORY_FIST_PUMP = 403  # Victory_Fist_Pump (BodyMovements - Acting)
    CROUCH_AND_STEP_BACK = 404  # Crouch_and_Step_Back (BodyMovements - Acting)
    JOYFUL_DANCE_WITH_HAND_SWAY = 405  # Joyful_Dance_with_Hand_Sway (BodyMovements - Acting)
    THOMAS_FLAIR_TO_JUMP_UP = 406  # Thomas_Flair_to_Jump_Up (BodyMovements - Acting)
    WALL_PUSH_JUMP_AND_FLIP = 407  # Wall_Push_Jump_and_Flip (BodyMovements - Acting)
    JAZZ_HANDS = 408  # Jazz_Hands (BodyMovements - Acting)
    FINGER_WAG_NO = 409  # Finger_Wag_No (BodyMovements - Acting)
    KICK_A_SOCCER_BALL = 410  # Kick_a_Soccer_Ball (BodyMovements - Acting)
    NECK_SLASHING_GESTURE = 411  # Neck_Slashing_Gesture (BodyMovements - Acting)
    VICTORY = 412  # victory (BodyMovements - Acting)
    BACKFLIP_AND_RISE = 413  # Backflip_and_Rise (BodyMovements - Acting)
    DOUBLE_KICK_FORWARD = 414  # Double_kick_forward (BodyMovements - Acting)
    HAPPY_SWAY_STANDING = 415  # Happy_Sway_Standing (BodyMovements - Acting)
    HIT_IN_BACK_WHILE_RUNNING = 416  # Hit_in_Back_While_Running (BodyMovements - Acting)
    HOP_WITH_ARMS_RAISED = 417  # Hop_with_Arms_Raised (BodyMovements - Acting)
    JUMP_TO_CATCH_AND_FALL = 419  # Jump_to_Catch_and_Fall (BodyMovements - Acting)
    LEFT_HAND_BITTEN_STEP_BACK = 420  # Left_Hand_Bitten_Step_Back (BodyMovements - Acting)
    OVER_SHOULDER_THROW = 421  # Over_Shoulder_Throw (BodyMovements - Acting)
    RISING_FLYING_KICK = 422  # Rising_Flying_Kick (BodyMovements - Acting)
    VAULT_WITH_RIFLE = 425  # Vault_with_Rifle (BodyMovements - VaultingOverObstacle)
    ROLL_BEHIND_COVER = 426  # Roll_Behind_Cover (BodyMovements - VaultingOverObstacle)
    VAULT_AND_LAND = 427  # Vault_and_Land (BodyMovements - VaultingOverObstacle)
    UNARMED_VAULT = 428  # Unarmed_Vault (BodyMovements - VaultingOverObstacle)
    PARKOUR_VAULT = 429  # Parkour_Vault (BodyMovements - VaultingOverObstacle)
    PARKOUR_VAULT_WITH_ROLL = 430  # Parkour_Vault_with_Roll (BodyMovements - VaultingOverObstacle)
    PARKOUR_VAULT_1 = 431  # Parkour_Vault_1 (BodyMovements - VaultingOverObstacle)
    PARKOUR_VAULT_2 = 432  # Parkour_Vault_2 (BodyMovements - VaultingOverObstacle)
    PARKOUR_VAULT_3 = 433  # Parkour_Vault_3 (BodyMovements - VaultingOverObstacle)
    FAST_LADDER_CLIMB = 434  # Fast_Ladder_Climb (BodyMovements - Climbing)
    LADDER_CLIMB_FINISH = 435  # Ladder_Climb_Finish (BodyMovements - Climbing)
    LADDER_MOUNT_START = 436  # Ladder_Mount_Start (BodyMovements - Climbing)
    SLOW_LADDER_CLIMB = 437  # Slow_Ladder_Climb (BodyMovements - Climbing)
    LADDER_CLIMB_LOOP = 438  # Ladder_Climb_Loop (BodyMovements - Climbing)
    CLIMB_LEFT_WITH_BOTH_LIMBS = 439  # Climb_Left_with_Both_Limbs (BodyMovements - Climbing)
    CLIMB_RIGHT_WITH_BOTH_LIMBS = 440  # Climb_Right_with_Both_Limbs (BodyMovements - Climbing)
    CLIMB_STAIRS = 441  # Climb_Stairs (BodyMovements - Climbing)
    FAST_STAIR_CLIMB = 442  # Fast_Stair_Climb (BodyMovements - Climbing)
    CLIMBING_UP_WALL = 444  # climbing_up_wall (BodyMovements - Climbing)
    DIAGONAL_WALL_RUN = 445  # diagonal_wall_run (BodyMovements - Climbing)
    HANG_AND_CLIMB_LEFT = 446  # Hang_and_Climb_Left (BodyMovements - Climbing)
    HANG_AND_CLIMB_RGHT = 447  # Hang_and_Climb_Rght (BodyMovements - Climbing)
    JUMP_AND_GRAB_WALL = 448  # Jump_and_Grab_Wall (BodyMovements - Climbing)
    CLIMB_UP_ROPE = 449  # Climb_Up_Rope (BodyMovements - Climbing)
    WALL_FLIP = 450  # Wall_Flip (BodyMovements - PerformingStunt)
    ONE_ARM_HANDSTAND = 451  # One_Arm_Handstand (BodyMovements - PerformingStunt)
    BACKFLIP = 452  # Backflip (BodyMovements - PerformingStunt)
    BACKFLIP_SWEEP_KICK = 453  # Backflip_Sweep_Kick (BodyMovements - PerformingStunt)
    SWEEP_KICK = 455  # Sweep_Kick (BodyMovements - PerformingStunt)
    JUMPING_HEAD_SCISSOR_TAKEDOWN = (
        456  # Jumping_Head_Scissor_Takedown (BodyMovements - PerformingStunt)
    )
    JUMPING_PUNCH = 457  # Jumping_Punch (BodyMovements - PerformingStunt)
    UNICYCLE_JUMP_DISMOUNT = 458  # Unicycle_Jump_Dismount (BodyMovements - PerformingStunt)
    RUN_JUMP_AND_ROLL = 459  # Run_Jump_and_Roll (BodyMovements - PerformingStunt)
    JUMP_WITH_ARMS_OPEN = 460  # Jump_with_Arms_Open (BodyMovements - Jumping)
    JUMP_WITH_ARMS_AND_LEGS_OPEN = 461  # Jump_with_Arms_and_Legs_Open (BodyMovements - Jumping)
    BACKFLIP_JUMP = 462  # Backflip_Jump (BodyMovements - Jumping)
    RUN_AND_JUMP = 463  # Run_and_Jump (BodyMovements - Jumping)
    LEAP_AND_PUNCH = 464  # Leap_and_Punch (BodyMovements - Jumping)
    LEAP_RIGHT_AND_CATCH = 465  # Leap_Right_and_Catch (BodyMovements - Jumping)
    REGULAR_JUMP = 466  # Regular_Jump (BodyMovements - Jumping)
    JUMP_OVER_OBSTACLE_2 = 467  # Jump_Over_Obstacle_2 (BodyMovements - Jumping)
    BACK_JUMP = 468  # Back_Jump (BodyMovements - Jumping)
    JUMPING_DOWN = 470  # Jumping_Down (BodyMovements - Jumping)
    JUMP_OVER_OBSTACLE = 471  # Jump_Over_Obstacle (BodyMovements - Jumping)
    JUMP_OVER_OBSTACLE_1 = 472  # Jump_Over_Obstacle_1 (BodyMovements - Jumping)
    QUAD_JUMP_LEFT = 473  # Quad_Jump_Left (BodyMovements - HangingfromLedge)
    QUAD_JUMP_UP = 474  # Quad_Jump_Up (BodyMovements - HangingfromLedge)
    QUAD_CLIMB_RIGHT = 475  # Quad_Climb_Right (BodyMovements - HangingfromLedge)
    HANG_AND_PUSH_WITH_FOOT = 476  # Hang_and_Push_with_Foot (BodyMovements - HangingfromLedge)
    ROPE_HANG_IDLE = 477  # Rope_Hang_Idle (BodyMovements - HangingfromLedge)
    BAR_HANG_IDLE = 478  # Bar_Hang_Idle (BodyMovements - HangingfromLedge)
    UPSIDE_DOWN_ROPE_HANG = 479  # Upside_Down_Rope_Hang (BodyMovements - HangingfromLedge)
    UPSIDE_DOWN_ROPE_HANG_1 = 480  # Upside_Down_Rope_Hang_1 (BodyMovements - HangingfromLedge)
    UPSIDE_DOWN_ROPE_HANG_2 = 481  # Upside_Down_Rope_Hang_2 (BodyMovements - HangingfromLedge)
    GRAB_WALL_MIDAIR_IDLE = 482  # Grab_Wall_Midair_Idle (BodyMovements - HangingfromLedge)
    SLOW_BAR_HANG_LEFT = 483  # Slow_Bar_Hang_Left (BodyMovements - HangingfromLedge)
    SLOW_BAR_HANG_RIGHT = 484  # Slow_Bar_Hang_Right (BodyMovements - HangingfromLedge)
    JUMP_AND_HANG_ON_BAR = 485  # Jump_and_Hang_on_Bar (BodyMovements - HangingfromLedge)
    WALL_SUPPORT_TO_STEP_DOWN = 486  # Wall_Support_to_Step_Down (BodyMovements - HangingfromLedge)
    CLIMB_ATTEMPT_AND_FALL_3 = 487  # Climb_Attempt_and_Fall_3 (BodyMovements - FallingFreely)
    CLIMB_ATTEMPT_AND_FALL_4 = 488  # Climb_Attempt_and_Fall_4 (BodyMovements - FallingFreely)
    CLIMB_ATTEMPT_AND_FALL_5 = 489  # Climb_Attempt_and_Fall_5 (BodyMovements - FallingFreely)
    FALL_DOWN = 490  # Fall_Down (BodyMovements - HangingfromLedge)
    FALL_FROM_BAR = 491  # Fall_from_Bar (BodyMovements - HangingfromLedge)
    WALL_SUPPORT_JUMP_TO_GROUND = (
        492  # Wall_Support_Jump_to_Ground (BodyMovements - HangingfromLedge)
    )
    JUMP_DOWN_FROM_WALL = 493  # Jump_Down_from_Wall (BodyMovements - HangingfromLedge)
    SWING_ON_ROPE_TO_GROUND = 494  # Swing_on_Rope_to_Ground (BodyMovements - HangingfromLedge)
    GRAB_BAR_AND_SWING_FORWARD = (
        495  # Grab_Bar_and_Swing_Forward (BodyMovements - HangingfromLedge)
    )
    ROPE_HANG_BACKFLIP_TO_CROUCH = (
        496  # Rope_Hang_Backflip_to_Crouch (BodyMovements - HangingfromLedge)
    )
    CLIMBING_DOWN_WALL = 497  # climbing_down_wall (BodyMovements - Climbing)
    CLIMB_ATTEMPT_AND_FALL = 498  # Climb_Attempt_and_Fall (BodyMovements - FallingFreely)
    CLIMB_ATTEMPT_AND_FALL_1 = 499  # Climb_Attempt_and_Fall_1 (BodyMovements - FallingFreely)
    CLIMB_ATTEMPT_AND_FALL_2 = 500  # Climb_Attempt_and_Fall_2 (BodyMovements - FallingFreely)
    LEAP_OF_FAITH = 501  # Leap_of_Faith (BodyMovements - FallingFreely)
    FALL1 = 502  # Fall1 (BodyMovements - FallingFreely)
    FALL2 = 503  # Fall2 (BodyMovements - FallingFreely)
    FALL3 = 504  # Fall3 (BodyMovements - FallingFreely)
    FALL4 = 505  # Fall4 (BodyMovements - FallingFreely)
    DIVE_DOWN_AND_LAND = 506  # Dive_Down_and_Land (BodyMovements - FallingFreely)
    DIVE_DOWN_AND_LAND_1 = 507  # Dive_Down_and_Land_1 (BodyMovements - FallingFreely)
    DIVE_DOWN_AND_LAND_2 = 508  # Dive_Down_and_Land_2 (BodyMovements - FallingFreely)
    LEAN_FORWARD_SPRINT = 509  # Lean_Forward_Sprint (WalkAndRun - Running)
    STANDARD_FORWARD_CHARGE = 510  # Standard_Forward_Charge (WalkAndRun - Running)
    RIFLE_CHARGE = 511  # Rifle_Charge (WalkAndRun - Running)
    MALE_HEAD_DOWN_CHARGE = 512  # Male_Head_Down_Charge (WalkAndRun - Running)
    FEMALE_HEAD_DOWN_CHARGE = 513  # Female_Head_Down_Charge (WalkAndRun - Running)
    FEMALE_BOW_CHARGE_LEFT_HAND = 514  # Female_Bow_Charge_Left_Hand (WalkAndRun - Running)
    FEMALE_THROWING_STANCE_CHARGE = 515  # Female_Throwing_Stance_Charge (WalkAndRun - Running)
    SLIDE_LIGHT = 516  # slide_light (WalkAndRun - Running)
    SLIDE_RIGHT = 517  # slide_right (WalkAndRun - Running)
    SLIDING_ROOL = 518  # sliding_rool (WalkAndRun - Running)
    SLIDING_STUMBLE = 519  # sliding_stumble (WalkAndRun - Running)
    CROUCH_WALK_WITH_TORCH = 520  # Crouch_Walk_with_Torch (WalkAndRun - CrouchWalking)
    CROUCH_WALK_LEFT_WITH_TORCH = 521  # Crouch_Walk_Left_with_Torch (WalkAndRun - CrouchWalking)
    CROUCH_WALK_RIGHT_WITH_TORCH = 522  # Crouch_Walk_Right_with_Torch (WalkAndRun - CrouchWalking)
    CAUTIOUS_CROUCH_WALK_BACKWARD = (
        523  # Cautious_Crouch_Walk_Backward (WalkAndRun - CrouchWalking)
    )
    CAUTIOUS_CROUCH_WALK_FORWARD = 524  # Cautious_Crouch_Walk_Forward (WalkAndRun - CrouchWalking)
    CAUTIOUS_CROUCH_WALK_LEFT = 525  # Cautious_Crouch_Walk_Left (WalkAndRun - CrouchWalking)
    CAUTIOUS_CROUCH_WALK_RIGHT = 526  # Cautious_Crouch_Walk_Right (WalkAndRun - CrouchWalking)
    CROUCH_WALK_LEFT_WITH_GUN = 527  # Crouch_Walk_Left_with_Gun (WalkAndRun - CrouchWalking)
    WALK_LEFT_WITH_GUN = 528  # Walk_Left_with_Gun (WalkAndRun - CrouchWalking)
    WALK_BACKWARD_WITH_GUN = 529  # Walk_Backward_with_Gun (WalkAndRun - CrouchWalking)
    RUN_FAST_3 = 530  # run_fast_3 (WalkAndRun - Running)
    SPRINT_AND_SUDDEN_STOP = 531  # Sprint_and_Sudden_Stop (WalkAndRun - Running)
    RUN_FAST_4 = 532  # run_fast_4 (WalkAndRun - Running)
    RUN_FAST_5 = 533  # run_fast_5 (WalkAndRun - Running)
    RUN_FAST_6 = 534  # run_fast_6 (WalkAndRun - Running)
    RUN_FAST_7 = 535  # run_fast_7 (WalkAndRun - Running)
    RUN_FAST_8 = 536  # run_fast_8 (WalkAndRun - Running)
    RUN_FAST_9 = 537  # run_fast_9 (WalkAndRun - Running)
    RUN_FAST_10 = 538  # run_fast_10 (WalkAndRun - Running)
    RUN_FAST_2 = 539  # run_fast_2 (WalkAndRun - Running)
    INJURED_WALK_BACKWARD = 540  # Injured_Walk_Backward (WalkAndRun - Walking)
    WALK_BACKWARD_WITH_GUN_1 = 541  # Walk_Backward_with_Gun_1 (WalkAndRun - Walking)
    WALK_BACKWARD_WITH_GRENADE = 542  # Walk_Backward_with_Grenade (WalkAndRun - Walking)
    STEP_BACK = 543  # Step_Back (WalkAndRun - Walking)
    WALK_BACKWARD = 544  # Walk_Backward (WalkAndRun - Walking)
    WALK_BACKWARD_WITH_BOW = 545  # Walk_Backward_with_Bow (WalkAndRun - Walking)
    WALK_BACKWARD_WITH_SWORD = 546  # Walk_Backward_with_Sword (WalkAndRun - Walking)
    WALK_BACKWARD_WITH_BOW_1 = 547  # Walk_Backward_with_Bow_1 (WalkAndRun - Walking)
    WALK_BACKWARD_WITH_SWORD_SHIELD = 548  # Walk_Backward_with_Sword_Shield (WalkAndRun - Walking)
    CRAWL_BACKWARD = 549  # Crawl_Backward (WalkAndRun - Walking)
    CARRY_HEAVY_CANNON_FORWARD = 550  # Carry_Heavy_Cannon_Forward (WalkAndRun - Walking)
    CARRY_HEAVY_OBJECT_WALK = 551  # Carry_Heavy_Object_Walk (WalkAndRun - Walking)
    CARRY_WATER_BUCKET_WALK = 552  # Carry_Water_Bucket_Walk (WalkAndRun - Walking)
    ELDERLY_SHAKY_WALK = 553  # Elderly_Shaky_Walk (WalkAndRun - Walking)
    FUNKY_WALK = 554  # Funky_Walk (WalkAndRun - Walking)
    LIMPING_WALK_1 = 555  # Limping_Walk_1 (WalkAndRun - Walking)
    LIMPING_WALK_2 = 556  # Limping_Walk_2 (WalkAndRun - Walking)
    LIMPING_WALK_3 = 557  # Limping_Walk_3 (WalkAndRun - Walking)
    LIMPING_WALK = 558  # Limping_Walk (WalkAndRun - Walking)
    SNEAKY_WALK = 559  # Sneaky_Walk (WalkAndRun - Walking)
    SPEAR_WALK = 560  # Spear_Walk (WalkAndRun - Walking)
    STEP_HIP_HOP_DANCE = 561  # Step_Hip_Hop_Dance (WalkAndRun - Walking)
    STUMBLE_WALK = 562  # Stumble_Walk (WalkAndRun - Walking)
    STYLISH_WALK = 563  # Stylish_Walk (WalkAndRun - Walking)
    TIGHTROPE_WALK = 564  # Tightrope_Walk (WalkAndRun - Walking)
    WALK_WITH_UMBRELLA = 565  # Walk_with_Umbrella (WalkAndRun - Walking)
    WALKING_2 = 566  # walking_2 (WalkAndRun - Walking)
    WALK_WITH_WALKER_SUPPORT = 567  # Walk_with_Walker_Support (WalkAndRun - Walking)
    SWIM_IDLE = 568  # Swim_Idle (WalkAndRun - Swimming)
    SWIM_FORWARD = 569  # Swim_Forward (WalkAndRun - Swimming)
    SWIMMING_TO_EDGE = 570  # swimming_to_edge (WalkAndRun - Swimming)
    RUN_TURN_LEFT = 571  # Run_Turn_Left (WalkAndRun - TurningAround)
    WALK_TURN_LEFT = 572  # Walk_Turn_Left (WalkAndRun - TurningAround)
    RIFLE_TURN_LEFT = 573  # Rifle_Turn_Left (WalkAndRun - TurningAround)
    WALK_TURN_LEFT_WITH_WEAPON = 574  # Walk_Turn_Left_with_Weapon (WalkAndRun - TurningAround)
    COMBAT_IDLE_TURN_LEFT = 575  # Combat_Idle_Turn_Left (WalkAndRun - TurningAround)
    IDLE_TURN_LEFT = 576  # Idle_Turn_Left (WalkAndRun - TurningAround)
    IDLE_STEP_TURN_LEFT = 577  # Idle_Step_Turn_Left (WalkAndRun - TurningAround)
    IDLE_TORCH_TURN_LEFT = 578  # Idle_Torch_Turn_Left (WalkAndRun - TurningAround)
    DEPRESSED_FULL_TURN_LEFT = 579  # Depressed_Full_Turn_Left (WalkAndRun - TurningAround)
    SWORD_AND_SHIELD_ALERT_TURN_LEFT = (
        580  # Sword_and_Shield_Alert_Turn_Left (WalkAndRun - TurningAround)
    )
    RUN_SHARP_TURN_RIGHT = 581  # Run_Sharp_Turn_Right (WalkAndRun - TurningAround)
    RUN_TURN_RIGHT = 582  # Run_Turn_Right (WalkAndRun - TurningAround)
    WALK_TURN_RIGHT = 583  # Walk_Turn_Right (WalkAndRun - TurningAround)
    WALK_TURN_RIGHT_FEMALE = 584  # Walk_Turn_Right_Female (WalkAndRun - TurningAround)
    RIFLE_AIM_TURN_RIGHT = 585  # Rifle_Aim_Turn_Right (WalkAndRun - TurningAround)
    IDLE_TURN_RIGHT = 586  # Idle_Turn_Right (WalkAndRun - TurningAround)
    WALK_TURN_RIGHT_IDLE_STYLE = 587  # Walk_Turn_Right_Idle_Style (WalkAndRun - TurningAround)
    FRUSTRATED_TURN_RIGHT = 588  # Frustrated_Turn_Right (WalkAndRun - TurningAround)
    ALERT_QUICK_TURN_RIGHT = 589  # Alert_Quick_Turn_Right (WalkAndRun - TurningAround)
    SWORD_AND_SHIELD_ALERT_TURN_RIGHT = (
        590  # Sword_and_Shield_Alert_Turn_Right (WalkAndRun - TurningAround)
    )
    HIP_HOP_DANCE = 591  # Hip_Hop_Dance (Dancing - Dancing)
    HIP_HOP_DANCE_1 = 592  # Hip_Hop_Dance_1 (Dancing - Dancing)
    HIP_HOP_DANCE_2 = 593  # Hip_Hop_Dance_2 (Dancing - Dancing)
    HIP_HOP_DANCE_3 = 594  # Hip_Hop_Dance_3 (Dancing - Dancing)
    JAZZ_DANC = 595  # jazz_danc (Dancing - Dancing)
    YMCA_DANCE = 596  # ymca_dance (Dancing - Dancing)
    HIP_HOP_DANCE_4 = 597  # Hip_Hop_Dance_4 (Dancing - Dancing)
    KETTLEBELL_SWING_1 = 598  # kettlebell_swing_1 (DailyActions - WorkingOut)
    IDLE_15 = 599  # Idle_15 (DailyActions - Idle)
    BACKFLIP_INPLACE = 601  # Backflip_inplace (BodyMovements - PerformingStunt)
    BACKFLIP_SWEEP_KICK_INPLACE = (
        604  # Backflip_Sweep_Kick_inplace (BodyMovements - PerformingStunt)
    )
    BACK_JUMP_INPLACE = 605  # Back_Jump_inplace (BodyMovements - Jumping)
    BACKLEFT_RUN_INPLACE = 606  # BackLeft_run_inplace (WalkAndRun - Running)
    BACKRIGHT_RUN_INPLACE = 607  # BackRight_Run_inplace (WalkAndRun - Running)
    BEHIT_FLYUP_INPLACE = 608  # BeHit_FlyUp_inplace (Fighting - GettingHit)
    BOXING_PRACTICE_INPLACE = 609  # Boxing_Practice_inplace (Fighting - Punching)
    CARRY_HEAVY_CANNON_FORWARD_INPLACE = (
        610  # Carry_Heavy_Cannon_Forward_inplace (WalkAndRun - Walking)
    )
    CARRY_HEAVY_OBJECT_WALK_INPLACE = 611  # Carry_Heavy_Object_Walk_inplace (WalkAndRun - Walking)
    CARRY_WATER_BUCKET_WALK_INPLACE = 612  # Carry_Water_Bucket_Walk_inplace (WalkAndRun - Walking)
    CASUAL_WALK_INPLACE = 613  # Casual_Walk_inplace (WalkAndRun - Walking)
    CAUTIOUS_CROUCH_WALK_BACKWARD_INPLACE = (
        615  # Cautious_Crouch_Walk_Backward_inplace (WalkAndRun - CrouchWalking)
    )
    CAUTIOUS_CROUCH_WALK_FORWARD_INPLACE = (
        616  # Cautious_Crouch_Walk_Forward_inplace (WalkAndRun - CrouchWalking)
    )
    CAUTIOUS_CROUCH_WALK_LEFT_INPLACE = (
        617  # Cautious_Crouch_Walk_Left_inplace (WalkAndRun - CrouchWalking)
    )
    CAUTIOUS_CROUCH_WALK_RIGHT_INPLACE = (
        618  # Cautious_Crouch_Walk_Right_inplace (WalkAndRun - CrouchWalking)
    )
    CLIMB_LEFT_WITH_BOTH_LIMBS_INPLACE = (
        619  # Climb_Left_with_Both_Limbs_inplace (BodyMovements - Climbing)
    )
    CLIMB_RIGHT_WITH_BOTH_LIMBS_INPLACE = (
        620  # Climb_Right_with_Both_Limbs_inplace (BodyMovements - Climbing)
    )
    CONFIDENT_STRUT_INPLACE = 621  # Confident_Strut_inplace (WalkAndRun - Walking)
    CRAWL_BACKWARD_INPLACE = 622  # Crawl_Backward_inplace (WalkAndRun - Walking)
    CROUCH_WALK_LEFT_WITH_GUN_INPLACE = (
        623  # Crouch_Walk_Left_with_Gun_inplace (WalkAndRun - CrouchWalking)
    )
    CROUCH_WALK_LEFT_WITH_TORCH_INPLACE = (
        624  # Crouch_Walk_Left_with_Torch_inplace (WalkAndRun - CrouchWalking)
    )
    CROUCH_WALK_RIGHT_WITH_TORCH_INPLACE = (
        625  # Crouch_Walk_Right_with_Torch_inplace (WalkAndRun - CrouchWalking)
    )
    ELDERLY_SHAKY_WALK_INPLACE = 626  # Elderly_Shaky_Walk_inplace (WalkAndRun - Walking)
    FEMALE_BOW_CHARGE_LEFT_HAND_INPLACE = (
        627  # Female_Bow_Charge_Left_Hand_inplace (WalkAndRun - Running)
    )
    FEMALE_THROWING_STANCE_CHARGE_INPLACE = (
        628  # Female_Throwing_Stance_Charge_inplace (WalkAndRun - Running)
    )
    FLIRTY_STRUT_INPLACE = 629  # Flirty_Strut_inplace (WalkAndRun - Walking)
    FORWARDLEFT_RUN_FIGHT_INPLACE = 630  # ForwardLeft_Run_Fight_inplace (Fighting - Transitioning)
    FORWARDRIGHT_RUN_FIGHT_INPLACE = (
        631  # ForwardRight_Run_Fight_inplace (Fighting - Transitioning)
    )
    FUNKY_WALK_INPLACE = 632  # Funky_Walk_inplace (WalkAndRun - Walking)
    HANDBAG_WALK_INPLACE = 635  # Handbag_Walk_inplace (BodyMovements - Acting)
    HELLO_RUN_INPLACE = 636  # Hello_Run_inplace (WalkAndRun - Running)
    INJURED_WALK_INPLACE = 637  # Injured_Walk_inplace (WalkAndRun - Walking)
    INJURED_WALK_BACKWARD_INPLACE = 638  # Injured_Walk_Backward_inplace (WalkAndRun - Walking)
    JAZZ_HANDS_INPLACE = 639  # Jazz_Hands_inplace (BodyMovements - Acting)
    JUMP_OVER_OBSTACLE_INPLACE = 640  # Jump_Over_Obstacle_inplace (BodyMovements - Jumping)
    JUMP_OVER_OBSTACLE_1_INPLACE = 641  # Jump_Over_Obstacle_1_inplace (BodyMovements - Jumping)
    JUMP_OVER_OBSTACLE_2_INPLACE = 642  # Jump_Over_Obstacle_2_inplace (BodyMovements - Jumping)
    JUMP_RUN_INPLACE = 643  # Jump_Run_inplace (WalkAndRun - Running)
    LEAN_FORWARD_SPRINT_INPLACE = 644  # Lean_Forward_Sprint_inplace (WalkAndRun - Running)
    LIMPING_WALK_INPLACE = 645  # Limping_Walk_inplace (WalkAndRun - Walking)
    LIMPING_WALK_1_INPLACE = 646  # Limping_Walk_1_inplace (WalkAndRun - Walking)
    LIMPING_WALK_2_INPLACE = 647  # Limping_Walk_2_inplace (WalkAndRun - Walking)
    LIMPING_WALK_3_INPLACE = 648  # Limping_Walk_3_inplace (WalkAndRun - Walking)
    LUNGE_ROUNDHOUSE_KICK_INPLACE = 649  # Lunge_Roundhouse_Kick_inplace (Fighting - Punching)
    MUMMY_STAGGER_INPLACE = 650  # Mummy_Stagger_inplace (BodyMovements - Acting)
    PARKOUR_VAULT_WITH_ROLL_INPLACE = (
        651  # Parkour_Vault_with_Roll_inplace (BodyMovements - VaultingOverObstacle)
    )
    PROUD_STRUT_INPLACE = 652  # Proud_Strut_inplace (WalkAndRun - Walking)
    RED_CARPET_WALK_INPLACE = 653  # Red_Carpet_Walk_inplace (WalkAndRun - Walking)
    RIFLE_CHARGE_INPLACE = 654  # Rifle_Charge_inplace (WalkAndRun - Running)
    RUN_AND_LEAP_INPLACE = 656  # Run_and_Leap_inplace (BodyMovements - Acting)
    RUN_FAST_10_INPLACE = 657  # run_fast_10_inplace (WalkAndRun - Running)
    RUN_FAST_2_INPLACE = 658  # run_fast_2_inplace (WalkAndRun - Running)
    RUN_FAST_3_INPLACE = 659  # run_fast_3_inplace (WalkAndRun - Running)
    RUN_FAST_4_INPLACE = 660  # run_fast_4_inplace (WalkAndRun - Running)
    RUN_FAST_5_INPLACE = 661  # run_fast_5_inplace (WalkAndRun - Running)
    RUN_FAST_6_INPLACE = 662  # run_fast_6_inplace (WalkAndRun - Running)
    RUN_FAST_7_INPLACE = 663  # run_fast_7_inplace (WalkAndRun - Running)
    RUN_FAST_8_INPLACE = 664  # run_fast_8_inplace (WalkAndRun - Running)
    RUN_FAST_9_INPLACE = 665  # run_fast_9_inplace (WalkAndRun - Running)
    RUNNING_RELOAD_INPLACE = 666  # Running_Reload_inplace (Fighting - Transitioning)
    RUN_TO_WALK_TRANSITION_INPLACE = 667  # Run_to_Walk_Transition_inplace (WalkAndRun - Walking)
    SKIP_FORWARD_INPLACE = 668  # Skip_Forward_inplace (WalkAndRun - Walking)
    SLOW_ORC_WALK_INPLACE = 669  # Slow_Orc_Walk_inplace (WalkAndRun - Walking)
    SLOW_WALK_RELOAD_INPLACE = 670  # Slow_Walk_Reload_inplace (Fighting - Transitioning)
    SNEAKY_WALK_INPLACE = 671  # Sneaky_Walk_inplace (WalkAndRun - Walking)
    SPEAR_WALK_INPLACE = 672  # Spear_Walk_inplace (WalkAndRun - Walking)
    STANDARD_FORWARD_CHARGE_INPLACE = 673  # Standard_Forward_Charge_inplace (WalkAndRun - Running)
    STUMBLE_WALK_INPLACE = 674  # Stumble_Walk_inplace (WalkAndRun - Walking)
    STYLISH_WALK_INPLACE = 675  # Stylish_Walk_inplace (WalkAndRun - Walking)
    TEXTING_WALK_INPLACE = 676  # Texting_Walk_inplace (WalkAndRun - Walking)
    TIGHTROPE_WALK_INPLACE = 677  # Tightrope_Walk_inplace (WalkAndRun - Walking)
    UNSTEADY_WALK_INPLACE = 678  # Unsteady_Walk_inplace (WalkAndRun - Walking)
    WALK_BACKWARD_INPLACE = 679  # Walk_Backward_inplace (WalkAndRun - Walking)
    WALK_BACKWARD_WHILE_SHOOTING_INPLACE = (
        680  # Walk_Backward_While_Shooting_inplace (Fighting - AttackingwithWeapon)
    )
    WALK_BACKWARD_WITH_BOW_INPLACE = 681  # Walk_Backward_with_Bow_inplace (WalkAndRun - Walking)
    WALK_BACKWARD_WITH_BOW_1_INPLACE = (
        682  # Walk_Backward_with_Bow_1_inplace (WalkAndRun - Walking)
    )
    WALK_BACKWARD_WITH_BOW_AIMED_INPLACE = (
        683  # Walk_Backward_with_Bow_Aimed_inplace (Fighting - AttackingwithWeapon)
    )
    WALK_BACKWARD_WITH_GRENADE_INPLACE = (
        684  # Walk_Backward_with_Grenade_inplace (WalkAndRun - Walking)
    )
    WALK_BACKWARD_WITH_GUN_INPLACE = (
        685  # Walk_Backward_with_Gun_inplace (WalkAndRun - CrouchWalking)
    )
    WALK_BACKWARD_WITH_GUN_1_INPLACE = (
        686  # Walk_Backward_with_Gun_1_inplace (WalkAndRun - Walking)
    )
    WALK_BACKWARD_WITH_SWORD_INPLACE = (
        687  # Walk_Backward_with_Sword_inplace (WalkAndRun - Walking)
    )
    WALK_FIGHT_BACK_INPLACE = 688  # Walk_Fight_Back_inplace (WalkAndRun - Walking)
    WALK_FIGHT_FORWARD_INPLACE = 689  # Walk_Fight_Forward_inplace (WalkAndRun - Walking)
    WALK_FORWARD_WHILE_SHOOTING_INPLACE = (
        690  # Walk_Forward_While_Shooting_inplace (Fighting - AttackingwithWeapon)
    )
    WALK_FORWARD_WITH_BOW_AIMED_INPLACE = (
        691  # Walk_Forward_with_Bow_Aimed_inplace (Fighting - AttackingwithWeapon)
    )
    WALKING_2_INPLACE = 692  # walking_2_inplace (WalkAndRun - Walking)
    WALKING_WITH_PHONE_INPLACE = 693  # Walking_with_Phone_inplace (WalkAndRun - Walking)
    WALK_LEFT_WITH_GUN_INPLACE = 694  # Walk_Left_with_Gun_inplace (WalkAndRun - CrouchWalking)
    WALK_WITH_UMBRELLA_INPLACE = 695  # Walk_with_Umbrella_inplace (WalkAndRun - Walking)
    WALK_WITH_WALKER_SUPPORT_INPLACE = (
        696  # Walk_with_Walker_Support_inplace (WalkAndRun - Walking)
    )


class BodyMovementsAnimation(IntEnum):
    """Animation IDs for BodyMovements category."""

    SKILL_01 = 17  # Skill_01
    SKILL_02 = 18  # Skill_02
    SKILL_03 = 19  # Skill_03
    BIG_HEART_GESTURE = 27  # Big_Heart_Gesture
    CALL_GESTURE = 29  # Call_Gesture
    CATCHING_BREATH = 31  # Catching_Breath
    CLAPPING_RUN = 35  # Clapping_Run
    EXCITED_WALK_F = 39  # Excited_Walk_F
    EXCITED_WALK_M = 40  # Excited_Walk_M
    HANDBAG_WALK = 43  # Handbag_Walk
    HAPPY_JUMP_F = 44  # Happy_jump_f
    INDOOR_PLAY = 45  # Indoor_Play
    JUMP_ROPE = 46  # Jump_Rope
    SHOUTING_ANGRILY = 51  # Shouting_Angrily
    VICTORY_CHEER = 59  # Victory_Cheer
    HAPPY_JUMP_M = 61  # happy_jump_m
    PENGUIN_WALK = 62  # penguin_walk
    SWORD_SHOUT = 101  # Sword_Shout
    GROOVY_WALK = 109  # Groovy_Walk
    MUMMY_STAGGER = 113  # Mummy_Stagger
    HANDSTAND_FLIP = 375  # Handstand_Flip
    PUNCH_POSE = 376  # Punch_Pose
    RELAX_ARMS_THEN_STRIKE_BATTLE_POSE = 377  # Relax_arms_then_strike_battle_pose
    LARGE_STEP_THEN_HIGH_KICK = 378  # Large_step_then_high_kick
    SIDE_JUMPS_IN_HORSE_STANCE = 379  # Side_jumps_in_horse_stance
    STEP_RIGHT_FOR_EXERCISE = 381  # Step_Right_for_Exercise
    JUMP_AND_SLAM_BACK_DOWN = 382  # Jump_and_Slam_Back_Down
    QUICK_STEP_AND_SPIN_DODGE = 384  # Quick_Step_and_Spin_Dodge
    BOXING_WARMUP = 385  # Boxing_Warmup
    ZOMBIE_SCREAM = 386  # Zombie_Scream
    HALF_SQUAT_WITH_THUMB_UP = 387  # Half_Squat_with_Thumb_Up
    SHOW_BOTH_ARM_MUSCLES = 388  # Show_Both_Arm_Muscles
    GRIP_AND_THROW_DOWN = 389  # Grip_and_Throw_Down
    STAND_ON_POLE_AND_BALANCE = 390  # Stand_on_Pole_and_Balance
    HEAD_HOLD_IN_PAIN = 391  # Head_Hold_in_Pain
    GROUND_FLIP_AND_SWEEP_UP = 392  # Ground_Flip_and_Sweep_Up
    BASEBALL_PITCHING = 393  # baseball_pitching
    BACKFLIP_AND_HOOKS = 394  # Backflip_and_Hooks
    BREAKDANCE_1990 = 395  # Breakdance_1990
    BURPEE_EXERCISE = 396  # Burpee_Exercise
    POWER_SPIN_JUMP_360 = 397  # 360_Power_Spin_Jump
    CROUCH_CHARGE_AND_THROW = 398  # Crouch_Charge_and_Throw
    STEP_STEP_TURN_KICK = 399  # Step_Step_Turn_Kick
    SPRINT_ROLL_AND_FLIP = 401  # Sprint_Roll_and_Flip
    RUN_AND_LEAP = 402  # Run_and_Leap
    VICTORY_FIST_PUMP = 403  # Victory_Fist_Pump
    CROUCH_AND_STEP_BACK = 404  # Crouch_and_Step_Back
    JOYFUL_DANCE_WITH_HAND_SWAY = 405  # Joyful_Dance_with_Hand_Sway
    THOMAS_FLAIR_TO_JUMP_UP = 406  # Thomas_Flair_to_Jump_Up
    WALL_PUSH_JUMP_AND_FLIP = 407  # Wall_Push_Jump_and_Flip
    JAZZ_HANDS = 408  # Jazz_Hands
    FINGER_WAG_NO = 409  # Finger_Wag_No
    KICK_A_SOCCER_BALL = 410  # Kick_a_Soccer_Ball
    NECK_SLASHING_GESTURE = 411  # Neck_Slashing_Gesture
    VICTORY = 412  # victory
    BACKFLIP_AND_RISE = 413  # Backflip_and_Rise
    DOUBLE_KICK_FORWARD = 414  # Double_kick_forward
    HAPPY_SWAY_STANDING = 415  # Happy_Sway_Standing
    HIT_IN_BACK_WHILE_RUNNING = 416  # Hit_in_Back_While_Running
    HOP_WITH_ARMS_RAISED = 417  # Hop_with_Arms_Raised
    JUMP_TO_CATCH_AND_FALL = 419  # Jump_to_Catch_and_Fall
    LEFT_HAND_BITTEN_STEP_BACK = 420  # Left_Hand_Bitten_Step_Back
    OVER_SHOULDER_THROW = 421  # Over_Shoulder_Throw
    RISING_FLYING_KICK = 422  # Rising_Flying_Kick
    VAULT_WITH_RIFLE = 425  # Vault_with_Rifle
    ROLL_BEHIND_COVER = 426  # Roll_Behind_Cover
    VAULT_AND_LAND = 427  # Vault_and_Land
    UNARMED_VAULT = 428  # Unarmed_Vault
    PARKOUR_VAULT = 429  # Parkour_Vault
    PARKOUR_VAULT_WITH_ROLL = 430  # Parkour_Vault_with_Roll
    PARKOUR_VAULT_1 = 431  # Parkour_Vault_1
    PARKOUR_VAULT_2 = 432  # Parkour_Vault_2
    PARKOUR_VAULT_3 = 433  # Parkour_Vault_3
    FAST_LADDER_CLIMB = 434  # Fast_Ladder_Climb
    LADDER_CLIMB_FINISH = 435  # Ladder_Climb_Finish
    LADDER_MOUNT_START = 436  # Ladder_Mount_Start
    SLOW_LADDER_CLIMB = 437  # Slow_Ladder_Climb
    LADDER_CLIMB_LOOP = 438  # Ladder_Climb_Loop
    CLIMB_LEFT_WITH_BOTH_LIMBS = 439  # Climb_Left_with_Both_Limbs
    CLIMB_RIGHT_WITH_BOTH_LIMBS = 440  # Climb_Right_with_Both_Limbs
    CLIMB_STAIRS = 441  # Climb_Stairs
    FAST_STAIR_CLIMB = 442  # Fast_Stair_Climb
    CLIMBING_UP_WALL = 444  # climbing_up_wall
    DIAGONAL_WALL_RUN = 445  # diagonal_wall_run
    HANG_AND_CLIMB_LEFT = 446  # Hang_and_Climb_Left
    HANG_AND_CLIMB_RGHT = 447  # Hang_and_Climb_Rght
    JUMP_AND_GRAB_WALL = 448  # Jump_and_Grab_Wall
    CLIMB_UP_ROPE = 449  # Climb_Up_Rope
    WALL_FLIP = 450  # Wall_Flip
    ONE_ARM_HANDSTAND = 451  # One_Arm_Handstand
    BACKFLIP = 452  # Backflip
    BACKFLIP_SWEEP_KICK = 453  # Backflip_Sweep_Kick
    SWEEP_KICK = 455  # Sweep_Kick
    JUMPING_HEAD_SCISSOR_TAKEDOWN = 456  # Jumping_Head_Scissor_Takedown
    JUMPING_PUNCH = 457  # Jumping_Punch
    UNICYCLE_JUMP_DISMOUNT = 458  # Unicycle_Jump_Dismount
    RUN_JUMP_AND_ROLL = 459  # Run_Jump_and_Roll
    JUMP_WITH_ARMS_OPEN = 460  # Jump_with_Arms_Open
    JUMP_WITH_ARMS_AND_LEGS_OPEN = 461  # Jump_with_Arms_and_Legs_Open
    BACKFLIP_JUMP = 462  # Backflip_Jump
    RUN_AND_JUMP = 463  # Run_and_Jump
    LEAP_AND_PUNCH = 464  # Leap_and_Punch
    LEAP_RIGHT_AND_CATCH = 465  # Leap_Right_and_Catch
    REGULAR_JUMP = 466  # Regular_Jump
    JUMP_OVER_OBSTACLE_2 = 467  # Jump_Over_Obstacle_2
    BACK_JUMP = 468  # Back_Jump
    JUMPING_DOWN = 470  # Jumping_Down
    JUMP_OVER_OBSTACLE = 471  # Jump_Over_Obstacle
    JUMP_OVER_OBSTACLE_1 = 472  # Jump_Over_Obstacle_1
    QUAD_JUMP_LEFT = 473  # Quad_Jump_Left
    QUAD_JUMP_UP = 474  # Quad_Jump_Up
    QUAD_CLIMB_RIGHT = 475  # Quad_Climb_Right
    HANG_AND_PUSH_WITH_FOOT = 476  # Hang_and_Push_with_Foot
    ROPE_HANG_IDLE = 477  # Rope_Hang_Idle
    BAR_HANG_IDLE = 478  # Bar_Hang_Idle
    UPSIDE_DOWN_ROPE_HANG = 479  # Upside_Down_Rope_Hang
    UPSIDE_DOWN_ROPE_HANG_1 = 480  # Upside_Down_Rope_Hang_1
    UPSIDE_DOWN_ROPE_HANG_2 = 481  # Upside_Down_Rope_Hang_2
    GRAB_WALL_MIDAIR_IDLE = 482  # Grab_Wall_Midair_Idle
    SLOW_BAR_HANG_LEFT = 483  # Slow_Bar_Hang_Left
    SLOW_BAR_HANG_RIGHT = 484  # Slow_Bar_Hang_Right
    JUMP_AND_HANG_ON_BAR = 485  # Jump_and_Hang_on_Bar
    WALL_SUPPORT_TO_STEP_DOWN = 486  # Wall_Support_to_Step_Down
    CLIMB_ATTEMPT_AND_FALL_3 = 487  # Climb_Attempt_and_Fall_3
    CLIMB_ATTEMPT_AND_FALL_4 = 488  # Climb_Attempt_and_Fall_4
    CLIMB_ATTEMPT_AND_FALL_5 = 489  # Climb_Attempt_and_Fall_5
    FALL_DOWN = 490  # Fall_Down
    FALL_FROM_BAR = 491  # Fall_from_Bar
    WALL_SUPPORT_JUMP_TO_GROUND = 492  # Wall_Support_Jump_to_Ground
    JUMP_DOWN_FROM_WALL = 493  # Jump_Down_from_Wall
    SWING_ON_ROPE_TO_GROUND = 494  # Swing_on_Rope_to_Ground
    GRAB_BAR_AND_SWING_FORWARD = 495  # Grab_Bar_and_Swing_Forward
    ROPE_HANG_BACKFLIP_TO_CROUCH = 496  # Rope_Hang_Backflip_to_Crouch
    CLIMBING_DOWN_WALL = 497  # climbing_down_wall
    CLIMB_ATTEMPT_AND_FALL = 498  # Climb_Attempt_and_Fall
    CLIMB_ATTEMPT_AND_FALL_1 = 499  # Climb_Attempt_and_Fall_1
    CLIMB_ATTEMPT_AND_FALL_2 = 500  # Climb_Attempt_and_Fall_2
    LEAP_OF_FAITH = 501  # Leap_of_Faith
    FALL1 = 502  # Fall1
    FALL2 = 503  # Fall2
    FALL3 = 504  # Fall3
    FALL4 = 505  # Fall4
    DIVE_DOWN_AND_LAND = 506  # Dive_Down_and_Land
    DIVE_DOWN_AND_LAND_1 = 507  # Dive_Down_and_Land_1
    DIVE_DOWN_AND_LAND_2 = 508  # Dive_Down_and_Land_2
    BACKFLIP_INPLACE = 601  # Backflip_inplace
    BACKFLIP_SWEEP_KICK_INPLACE = 604  # Backflip_Sweep_Kick_inplace
    BACK_JUMP_INPLACE = 605  # Back_Jump_inplace
    CLIMB_LEFT_WITH_BOTH_LIMBS_INPLACE = 619  # Climb_Left_with_Both_Limbs_inplace
    CLIMB_RIGHT_WITH_BOTH_LIMBS_INPLACE = 620  # Climb_Right_with_Both_Limbs_inplace
    HANDBAG_WALK_INPLACE = 635  # Handbag_Walk_inplace
    JAZZ_HANDS_INPLACE = 639  # Jazz_Hands_inplace
    JUMP_OVER_OBSTACLE_INPLACE = 640  # Jump_Over_Obstacle_inplace
    JUMP_OVER_OBSTACLE_1_INPLACE = 641  # Jump_Over_Obstacle_1_inplace
    JUMP_OVER_OBSTACLE_2_INPLACE = 642  # Jump_Over_Obstacle_2_inplace
    MUMMY_STAGGER_INPLACE = 650  # Mummy_Stagger_inplace
    PARKOUR_VAULT_WITH_ROLL_INPLACE = 651  # Parkour_Vault_with_Roll_inplace
    RUN_AND_LEAP_INPLACE = 656  # Run_and_Leap_inplace


class DailyActionsAnimation(IntEnum):
    """Animation IDs for DailyActions category."""

    IDLE = 0  # Idle
    ALERT = 2  # Alert
    ARISE = 3  # Arise
    IDLE_02 = 11  # Idle_02
    IDLE_03 = 12  # Idle_03
    AGREE_GESTURE = 25  # Agree_Gesture
    ANGRY_STOMP = 26  # Angry_Stomp
    BIG_WAVE_HELLO = 28  # Big_Wave_Hello
    CHAIR_SIT_IDLE_F = 32  # Chair_Sit_Idle_F
    CHAIR_SIT_IDLE_M = 33  # Chair_Sit_Idle_M
    CHECKOUT_GESTURE = 34  # Checkout_Gesture
    CONFUSED_SCRATCH = 36  # Confused_Scratch
    DISCUSS_WHILE_MOVING = 37  # Discuss_While_Moving
    DOZING_ELDERLY = 38  # Dozing_Elderly
    FORMAL_BOW = 41  # Formal_Bow
    GENTLEMANS_BOW = 42  # Gentlemans_Bow
    LISTENING_GESTURE = 47  # Listening_Gesture
    MIRROR_VIEWING = 48  # Mirror_Viewing
    MOTIVATIONAL_CHEER = 49  # Motivational_Cheer
    PHONE_CALL_GESTURE = 50  # Phone_Call_Gesture
    SIT_TO_STAND_TRANSITION_F = 52  # Sit_to_Stand_Transition_F
    SIT_TO_STAND_TRANSITION_M = 53  # Sit_to_Stand_Transition_M
    STAND_AND_CHAT = 56  # Stand_and_Chat
    STAND_TO_SIT_TRANSITION_M = 57  # Stand_to_Sit_Transition_M
    STEP_TO_SIT_TRANSITION = 58  # Step_to_Sit_Transition
    WALK_TO_SIT = 60  # Walk_to_Sit
    IDLE_3 = 243  # Idle_3
    IDLE_4 = 244  # Idle_4
    IDLE_5 = 245  # Idle_5
    IDLE_6 = 246  # Idle_6
    IDLE_7 = 247  # Idle_7
    IDLE_8 = 248  # Idle_8
    IDLE_9 = 249  # Idle_9
    IDLE_10 = 250  # Idle_10
    IDLE_11 = 251  # Idle_11
    IDLE_12 = 252  # Idle_12
    IDLE_13 = 253  # Idle_13
    IDLE_14 = 254  # Idle_14
    ANGRY_GROUND_STOMP = 255  # Angry_Ground_Stomp
    ANGRY_GROUND_STOMP_1 = 256  # Angry_Ground_Stomp_1
    ANGRY_GROUND_STOMP_2 = 257  # Angry_Ground_Stomp_2
    CROUCHLOOKAROUNDBOW = 258  # CrouchLookAroundBow
    STEP_FORWARD_AND_PUSH = 259  # Step_Forward_and_Push
    PUSH_FORWARD_AND_STOP = 260  # Push_Forward_and_Stop
    PUSH_AND_WALK_FORWARD = 261  # Push_and_Walk_Forward
    CROUCH_AND_PUSH_FORWARD = 262  # Crouch_and_Push_Forward
    SLEEP_ON_DESK = 263  # Sleep_on_Desk
    COUGH_WHILE_SLEEPING = 264  # Cough_While_Sleeping
    GROAN_HOLDING_STOMACH_IN_SLEEP = 265  # Groan_Holding_Stomach_in_Sleep
    LIE_DOWN_HANDS_SPREAD = 266  # Lie_Down_Hands_Spread
    SLEEP_NORMALLY = 267  # Sleep_Normally
    SIT_AND_DOZE_OFF = 268  # Sit_and_Doze_Off
    SLEEP = 269  # sleep
    TOSS_AND_TURN = 270  # Toss_and_Turn
    WAKE_UP_AND_LOOK_UP = 271  # Wake_Up_and_Look_Up
    LIE_ON_CHAIR_SUNBATHE_AND_SLEEP = 272  # Lie_on_Chair_Sunbathe_and_Sleep
    MALE_RUN_FORWARD_PICK_UP_LEFT = 273  # Male_Run_Forward_Pick_Up_Left
    FEMALE_CROUCH_PICK_UP_PLACE_SIDE = 274  # Female_Crouch_Pick_Up_Place_Side
    FEMALE_RUN_FORWARD_PICK_UP_RIGHT = 275  # Female_Run_Forward_Pick_Up_Right
    MALE_BEND_OVER_PICK_UP = 276  # Male_Bend_Over_Pick_Up
    FEMALE_CROUCH_PICK_FRUIT_BASKET_STAND = 277  # Female_Crouch_Pick_Fruit_Basket_Stand
    FEMALE_STAND_PICK_FRUIT_BASKET = 278  # Female_Stand_Pick_Fruit_Basket
    FEMALE_CROUCH_PICK_GUN_POINT_FORWARD = 279  # Female_Crouch_Pick_Gun_Point_Forward
    FEMALE_CROUCH_PICK_THROW_FORWARD = 280  # Female_Crouch_Pick_Throw_Forward
    FEMALE_BEND_OVER_PICK_UP_INSPECT = 281  # Female_Bend_Over_Pick_Up_Inspect
    FEMALE_WALK_PICK_PUT_IN_POCKET = 282  # Female_Walk_Pick_Put_In_Pocket
    PULL_RADISH = 283  # Pull_Radish
    COLLECT_OBJECT = 284  # Collect_Object
    OPEN_DOOR = 285  # open_door
    OPEN_DOOR_1 = 286  # open_door_1
    OPEN_DOOR_2 = 287  # open_door_2
    OPEN_DOOR_3 = 288  # open_door_3
    OPEN_DOOR_4 = 289  # open_door_4
    WAVE_ONE_HAND = 290  # Wave_One_Hand
    WAVE_FOR_HELP = 291  # Wave_for_Help
    GESTURE_WITH_HAND_ON_GUN = 292  # Gesture_with_Hand_on_Gun
    WAVE_FOR_HELP_1 = 293  # Wave_for_Help_1
    WAVE_FOR_HELP_2 = 294  # Wave_for_Help_2
    WAVE_FOR_HELP_3 = 295  # Wave_for_Help_3
    WAVE_FOR_HELP_4 = 296  # Wave_for_Help_4
    PERSONALIZED_GESTURE = 297  # Personalized_Gesture
    CHEER_WITH_BOTH_HANDS_UP = 298  # Cheer_with_Both_Hands_Up
    STAND_CLAP_AND_SIT_DOWN = 299  # Stand_Clap_and_Sit_Down
    SIT_CHEER_WITH_LEFT_HAND = 300  # Sit_Cheer_with_Left_Hand
    CHEER_WITH_BOTH_HANDS_1 = 301  # Cheer_with_Both_Hands_1
    STAND_WAVE_AND_SIT_DOWN = 302  # Stand_Wave_and_Sit_Down
    CHEER_WITH_BOTH_HANDS = 303  # Cheer_with_Both_Hands
    SEATED_FIST_PUMP = 304  # Seated_Fist_Pump
    STAND_CHEER_AND_SIT_DOWN = 305  # Stand_Cheer_and_Sit_Down
    CHEER_WITH_ONE_HAND_UP = 306  # Cheer_with_One_Hand_Up
    SITTING_ANSWERING_QUESTIONS = 307  # Sitting_Answering_Questions
    TALK_PASSIONATELY = 308  # Talk_Passionately
    TALK_WITH_LEFT_HAND_ON_HIP = 309  # Talk_with_Left_Hand_on_Hip
    TALK_WITH_LEFT_HAND_RAISED = 310  # Talk_with_Left_Hand_Raised
    STAND_TALKING_ANGRY = 311  # Stand_Talking_Angry
    PHONE_CONVERSATION = 312  # Phone_Conversation
    TALK_WITH_HANDS_OPEN = 313  # Talk_with_Hands_Open
    TALK_WITH_RIGHT_HAND_OPEN = 314  # Talk_with_Right_Hand_Open
    HAND_ON_HIP_GESTURE = 315  # Hand_on_Hip_Gesture
    HEADACHE_RELIEF = 316  # Headache_Relief
    SHRUG = 317  # Shrug
    SCHEMING_HAND_RUB = 318  # Scheming_Hand_Rub
    AIR_SQUAT = 319  # air_squat
    BICEP_CURL = 320  # bicep_curl
    BICYCLE_CRUNCH = 321  # bicycle_crunch
    CIRCLE_CRUNCH = 322  # circle_crunch
    GOLF_DRIVE = 323  # golf_drive
    IDLE_TO_PUSH_UP = 324  # idle_to_push_up
    JUMP_PUSH_UP = 325  # jump_push_up
    JUMPING_JACKS = 326  # jumping_jacks
    KETTLEBELL_SWING = 327  # kettlebell_swing
    PUSH_UP_TO_IDLE = 328  # push_up_to_idle
    PUSH_UP = 329  # push_up
    SITUPS = 330  # situps
    SUMO_HIGH_PULL = 331  # Sumo_High_Pull
    LOOK_AROUND_DUMBFOUNDED = 333  # Look_Around_Dumbfounded
    LOWER_WEAPON_LOOK_RAISE = 334  # Lower_Weapon_Look_Raise
    AXE_BREATHE_AND_LOOK_AROUND = 335  # Axe_Breathe_and_Look_Around
    LONG_BREATHE_AND_LOOK_AROUND = 336  # Long_Breathe_and_Look_Around
    TORCH_LOOK_AROUND = 337  # Torch_Look_Around
    SHORT_BREATHE_AND_LOOK_AROUND = 338  # Short_Breathe_and_Look_Around
    WALKING_SCAN_WITH_SUDDEN_LOOK_BACK = 339  # Walking_Scan_with_Sudden_Look_Back
    CRAWL_AND_LOOK_BACK = 340  # Crawl_and_Look_Back
    WALK_SLOWLY_AND_LOOK_AROUND = 341  # Walk_Slowly_and_Look_Around
    STAND_AND_DRINK = 342  # Stand_and_Drink
    SIT_AND_DRINK = 343  # Sit_and_Drink
    STAND_UP1 = 344  # Stand_Up1
    STAND_UP2 = 345  # Stand_Up2
    STAND_UP3 = 346  # Stand_Up3
    STAND_UP4 = 347  # Stand_Up4
    STAND_UP5 = 348  # Stand_Up5
    STAND_UP6 = 349  # Stand_Up6
    STAND_UP7 = 350  # Stand_Up7
    STAND_UP8 = 351  # Stand_Up8
    STAND_UP9 = 352  # Stand_Up9
    STAND_UP10 = 353  # Stand_Up10
    SITTING_CLAP = 354  # Sitting_Clap
    SIT_FINGER_WAG_NO = 355  # Sit_Finger_Wag_No
    SIT_HANDS_ON_HEAD_LEAN_BACK = 356  # Sit_Hands_on_Head_Lean_Back
    SIT_THUMBS_UP_RIGHT = 357  # Sit_Thumbs_Up_Right
    SIT_SHOUT_HANDS_ON_MOUTH = 358  # Sit_Shout_Hands_on_Mouth
    LOOK_BACK_AND_SIT = 359  # Look_Back_and_Sit
    SIT_TO_STANDTRANSITION_FEMALE_2 = 360  # Sit_to_standTransition_Female_2
    SIT_DODGE = 361  # Sit_Dodge
    SIT_CROSS_LEGGED = 362  # Sit_Cross_Legged
    SIT_CROSS_LEGGED_ON_FLOOR = 363  # Sit_Cross_Legged_on_Floor
    SIT_ON_CHAIR_ARMS_CROSSED = 364  # Sit_on_Chair_Arms_Crossed
    KNEEL_ON_ONE_KNEE_AND_STAND = 365  # Kneel_on_One_Knee_and_Stand
    FALLING_DOWN = 366  # falling_down
    SIDELYING_REACH_HELP = 367  # SideLying_Reach_Help
    ANGRY_TO_TANTRUM_SIT = 368  # Angry_To_Tantrum_Sit
    LIE_BACK_LEG_SWING = 369  # Lie_Back_Leg_Swing
    STAND_TO_SIDE_LYING = 370  # Stand_To_Side_Lying
    SIT_LIE_BED = 371  # Sit_Lie_Bed
    PRONE_REACH_HELP = 372  # Prone_Reach_Help
    KETTLEBELL_SWING_1 = 598  # kettlebell_swing_1
    IDLE_15 = 599  # Idle_15


class DancingAnimation(IntEnum):
    """Animation IDs for Dancing category."""

    FUNNYDANCING_01 = 22  # FunnyDancing_01
    FUNNYDANCING_02 = 23  # FunnyDancing_02
    FUNNYDANCING_03 = 24  # FunnyDancing_03
    SQUAT_STANCE = 54  # Squat_Stance
    ARM_CIRCLE_SHUFFLE = 63  # Arm_Circle_Shuffle
    ALL_NIGHT_DANCE = 64  # All_Night_Dance
    BASS_BEATS = 65  # Bass_Beats
    BOOM_DANCE = 66  # Boom_Dance
    BUBBLE_DANCE = 67  # Bubble_Dance
    CHERISH_POP_DANCE = 68  # Cherish_Pop_Dance
    CRYSTAL_BEADS = 69  # Crystal_Beads
    CARDIO_DANCE = 70  # Cardio_Dance
    DENIM_POP_DANCE = 71  # Denim_Pop_Dance
    DONT_YOU_DARE = 72  # Dont_You_Dare
    FAST_LIGHTNING = 73  # Fast_Lightning
    GANGNAM_GROOVE = 74  # Gangnam_Groove
    INDOOR_SWING = 75  # Indoor_Swing
    LOVE_YOU_POP_DANCE = 76  # Love_You_Pop_Dance
    MAGIC_GENIE = 77  # Magic_Genie
    NOT_YOUR_MOM = 78  # Not_Your_Mom
    OMG_GROOVE = 79  # OMG_Groove
    POP_DANCE_LSA2 = 80  # Pop_Dance_LSA2
    POD_BABY_GROOVE = 81  # Pod_Baby_Groove
    SHAKE_IT_OFF_DANCE = 82  # Shake_It_Off_Dance
    SUPERLOVE_POP_DANCE = 83  # Superlove_Pop_Dance
    YOU_GROOVE = 84  # You_Groove
    HIP_HOP_DANCE = 591  # Hip_Hop_Dance
    HIP_HOP_DANCE_1 = 592  # Hip_Hop_Dance_1
    HIP_HOP_DANCE_2 = 593  # Hip_Hop_Dance_2
    HIP_HOP_DANCE_3 = 594  # Hip_Hop_Dance_3
    JAZZ_DANC = 595  # jazz_danc
    YMCA_DANCE = 596  # ymca_dance
    HIP_HOP_DANCE_4 = 597  # Hip_Hop_Dance_4


class FightingAnimation(IntEnum):
    """Animation IDs for Fighting category."""

    ATTACK = 4  # Attack
    BEHIT_FLYUP = 7  # BeHit_FlyUp
    DEAD = 8  # Dead
    FORWARDLEFT_RUN_FIGHT = 9  # ForwardLeft_Run_Fight
    FORWARDRIGHT_RUN_FIGHT = 10  # ForwardRight_Run_Fight
    AXE_STANCE = 85  # Axe_Stance
    BASIC_JUMP = 86  # Basic_Jump
    BOXING_PRACTICE = 87  # Boxing_Practice
    CHEST_POUND_TAUNT = 88  # Chest_Pound_Taunt
    COMBAT_STANCE = 89  # Combat_Stance
    COUNTERSTRIKE = 90  # Counterstrike
    DOUBLE_BLADE_SPIN = 91  # Double_Blade_Spin
    DOUBLE_COMBO_ATTACK = 92  # Double_Combo_Attack
    DODGE_AND_COUNTER = 93  # Dodge_and_Counter
    FLYING_FIST_KICK = 94  # Flying_Fist_Kick
    GUN_HOLD_LEFT_TURN = 95  # Gun_Hold_Left_Turn
    KUNG_FU_PUNCH = 96  # Kung_Fu_Punch
    LEFT_SLASH = 97  # Left_Slash
    RUN_AND_SHOOT = 98  # Run_and_Shoot
    REAPING_SWING = 99  # Reaping_Swing
    RIGHTWARD_SPIN = 100  # Rightward_Spin
    SWORD_JUDGMENT = 102  # Sword_Judgment
    SIMPLE_KICK = 103  # Simple_Kick
    SIDE_SHOT = 104  # Side_Shot
    TRIPLE_COMBO_ATTACK = 105  # Triple_Combo_Attack
    CHARGED_SPELL_CAST = 125  # Charged_Spell_Cast
    CHARGED_SPELL_CAST_1 = 126  # Charged_Spell_Cast_1
    CHARGED_GROUND_SLAM = 127  # Charged_Ground_Slam
    HEAVY_HAMMER_SWING = 128  # Heavy_Hammer_Swing
    MAGE_SOELL_CAST = 129  # mage_soell_cast
    MAGE_SOELL_CAST_1 = 130  # mage_soell_cast_1
    MAGE_SOELL_CAST_2 = 131  # mage_soell_cast_2
    MAGE_SOELL_CAST_3 = 132  # mage_soell_cast_3
    MAGE_SOELL_CAST_4 = 133  # mage_soell_cast_4
    MAGE_SOELL_CAST_5 = 134  # mage_soell_cast_5
    MAGE_SOELL_CAST_6 = 135  # mage_soell_cast_6
    MAGE_SOELL_CAST_7 = 136  # mage_soell_cast_7
    MAGE_SOELL_CAST_8 = 137  # mage_soell_cast_8
    BLOCK1 = 138  # Block1
    BLOCK2 = 139  # Block2
    BLOCK3 = 140  # Block3
    BLOCK4 = 141  # Block4
    BLOCK5 = 142  # Block5
    BLOCK6 = 143  # Block6
    BLOCK8 = 144  # Block8
    BLOCK9 = 145  # Block9
    BLOCK10 = 146  # Block10
    SWORD_PARRY = 147  # Sword_Parry
    SWORD_PARRY_BACKWARD = 148  # Sword_Parry_Backward
    TWO_HANDED_PARRY = 149  # Two_Handed_Parry
    HIT_REACTION_WITH_BOW = 150  # Hit_Reaction_with_Bow
    SWORD_PARRY_BACKWARD_1 = 151  # Sword_Parry_Backward_1
    SWORD_PARRY_BACKWARD_2 = 152  # Sword_Parry_Backward_2
    SWORD_PARRY_BACKWARD_3 = 153  # Sword_Parry_Backward_3
    SWORD_PARRY_BACKWARD_4 = 154  # Sword_Parry_Backward_4
    SWORD_PARRY_BACKWARD_5 = 155  # Sword_Parry_Backward_5
    STAND_DODGE = 156  # Stand_Dodge
    STAND_DODGE_1 = 157  # Stand_Dodge_1
    ROLL_DODGE = 158  # Roll_Dodge
    ROLL_DODGE_1 = 159  # Roll_Dodge_1
    ROLL_DODGE_2 = 160  # Roll_Dodge_2
    ROLL_DODGE_3 = 161  # Roll_Dodge_3
    STAND_DODGE_2 = 162  # Stand_Dodge_2
    ROLL_DODGE_4 = 163  # Roll_Dodge_4
    STAND_DODGE_3 = 164  # Stand_Dodge_3
    KNEELING_RELOAD = 165  # Kneeling_Reload
    RUNNING_RELOAD = 166  # Running_Reload
    SLOW_WALK_RELOAD = 167  # Slow_Walk_Reload
    PRONE_RELOAD = 168  # Prone_Reload
    FORWARD_RELOAD_SUBTLE = 169  # Forward_Reload_Subtle
    STANDING_RELOAD = 170  # Standing_Reload
    HIT_REACTION_TO_WAIST = 171  # Hit_Reaction_to_Waist
    ELECTROCUTION_REACTION = 172  # Electrocution_Reaction
    SLAP_REACTION = 173  # Slap_Reaction
    FACE_PUNCH_REACTION = 174  # Face_Punch_Reaction
    FACE_PUNCH_REACTION_1 = 175  # Face_Punch_Reaction_1
    FACE_PUNCH_REACTION_2 = 176  # Face_Punch_Reaction_2
    GUNSHOT_REACTION = 177  # Gunshot_Reaction
    HIT_REACTION = 178  # Hit_Reaction
    HIT_REACTION_1 = 179  # Hit_Reaction_1
    SHOT_IN_THE_BACK_AND_FALL = 180  # Shot_in_the_Back_and_Fall
    ELECTROCUTED_FALL = 181  # Electrocuted_Fall
    SHOT_AND_BLOWN_BACK = 182  # Shot_and_Blown_Back
    SHOT_AND_FALL_BACKWARD = 183  # Shot_and_Fall_Backward
    SHOT_AND_FALL_FORWARD = 184  # Shot_and_Fall_Forward
    SHOT_AND_SLOW_FALL_BACKWARD = 185  # Shot_and_Slow_Fall_Backward
    STRANGLED_AND_FALL_FORWARD = 186  # Strangled_and_Fall_Forward
    KNOCK_DOWN = 187  # Knock_Down
    FALL_DEAD_FROM_ABDOMINAL_INJURY = 188  # Fall_Dead_from_Abdominal_Injury
    DYING_BACKWARDS = 189  # dying_backwards
    KNOCK_DOWN_1 = 190  # Knock_Down_1
    LEFT_JAB_FROM_GUARD = 191  # Left_Jab_from_Guard
    RIGHT_JAB_FROM_GUARD = 192  # Right_Jab_from_Guard
    LEFT_HOOK_FROM_GUARD = 193  # Left_Hook_from_Guard
    RIGHT_UPPERCUT_FROM_GUARD = 194  # Right_Uppercut_from_Guard
    RIGHT_UPPER_HOOK_FROM_GUARD = 195  # Right_Upper_Hook_from_Guard
    LEFT_UPPERCUT_FROM_GUARD = 196  # Left_Uppercut_from_Guard
    LEFT_SHORT_HOOK_FROM_GUARD = 197  # Left_Short_Hook_from_Guard
    PUNCH_COMBO = 198  # Punch_Combo
    WEAPON_COMBO = 199  # Weapon_Combo
    PUNCH_COMBO_1 = 200  # Punch_Combo_1
    PUNCH_COMBO_2 = 201  # Punch_Combo_2
    WEAPON_COMBO_1 = 202  # Weapon_Combo_1
    PUNCH_COMBO_3 = 203  # Punch_Combo_3
    PUNCH_COMBO_4 = 204  # Punch_Combo_4
    PUNCH_COMBO_5 = 205  # Punch_Combo_5
    SPARTAN_KICK = 206  # Spartan_Kick
    ROUNDHOUSE_KICK = 207  # Roundhouse_Kick
    LUNGE_ROUNDHOUSE_KICK = 208  # Lunge_Roundhouse_Kick
    BOXING_GUARD_RIGHT_STRAIGHT_KICK = 209  # Boxing_Guard_Right_Straight_Kick
    BOXING_GUARD_PREP_STRAIGHT_PUNCH = 210  # Boxing_Guard_Prep_Straight_Punch
    BOXING_GUARD_STEP_KNEE_STRIKE = 211  # Boxing_Guard_Step_Knee_Strike
    ELBOW_STRIKE = 212  # Elbow_Strike
    LEG_SWEEP = 213  # Leg_Sweep
    PUNCH_FORWARD_WITH_BOTH_FISTS = 214  # Punch_Forward_with_Both_Fists
    HIGH_KICK = 215  # High_Kick
    LUNGE_SPIN_KICK = 216  # Lunge_Spin_Kick
    SWEEPING_KICK = 217  # Sweeping_Kick
    STEP_IN_HIGH_KICK = 218  # Step_in_High_Kick
    RIGHT_HAND_SWORD_SLASH = 219  # Right_Hand_Sword_Slash
    SHIELD_PUSH_LEFT = 220  # Shield_Push_Left
    CHARGED_UPWARD_SLASH = 221  # Charged_Upward_Slash
    DRAW_AND_SHOOT_FROM_BACK = 222  # Draw_and_Shoot_from_Back
    DRAW_AND_SHOOT_FROM_BACK_1 = 223  # Draw_and_Shoot_from_Back_1
    ARCHERY_SHOT = 224  # Archery_Shot
    ARCHERY_SHOT_1 = 225  # Archery_Shot_1
    ARCHERY_SHOT_2 = 226  # Archery_Shot_2
    ARCHERY_SHOT_3 = 227  # Archery_Shot_3
    WALK_FORWARD_WITH_BOW_AIMED = 228  # Walk_Forward_with_Bow_Aimed
    DRAW_AND_SHOOT_FROM_BACK_2 = 229  # Draw_and_Shoot_from_Back_2
    WALK_BACKWARD_WITH_BOW_AIMED = 230  # Walk_Backward_with_Bow_Aimed
    ARCHERY_AIM_WITH_LATERAL_SCAN = 231  # Archery_Aim_with_Lateral_Scan
    COWBOY_QUICK_DRAW_SHOOTING = 232  # Cowboy_Quick_Draw_Shooting
    WALK_BACKWARD_WHILE_SHOOTING = 233  # Walk_Backward_While_Shooting
    WALK_FORWARD_WHILE_SHOOTING = 234  # Walk_Forward_While_Shooting
    FORWARD_ROLL_AND_FIRE = 235  # Forward_Roll_and_Fire
    DRAW_AND_SHOOT_LEFT = 236  # Draw_and_Shoot_Left
    CHARGED_AXE_CHOP = 237  # Charged_Axe_Chop
    AXE_SPIN_ATTACK = 238  # Axe_Spin_Attack
    CROUCH_PULL_AND_THROW = 239  # Crouch_Pull_and_Throw
    THRUST_SLASH = 240  # Thrust_Slash
    WEAPON_COMBO_2 = 241  # Weapon_Combo_2
    CHARGED_SLASH = 242  # Charged_Slash
    BEHIT_FLYUP_INPLACE = 608  # BeHit_FlyUp_inplace
    BOXING_PRACTICE_INPLACE = 609  # Boxing_Practice_inplace
    FORWARDLEFT_RUN_FIGHT_INPLACE = 630  # ForwardLeft_Run_Fight_inplace
    FORWARDRIGHT_RUN_FIGHT_INPLACE = 631  # ForwardRight_Run_Fight_inplace
    LUNGE_ROUNDHOUSE_KICK_INPLACE = 649  # Lunge_Roundhouse_Kick_inplace
    RUNNING_RELOAD_INPLACE = 666  # Running_Reload_inplace
    SLOW_WALK_RELOAD_INPLACE = 670  # Slow_Walk_Reload_inplace
    WALK_BACKWARD_WHILE_SHOOTING_INPLACE = 680  # Walk_Backward_While_Shooting_inplace
    WALK_BACKWARD_WITH_BOW_AIMED_INPLACE = 683  # Walk_Backward_with_Bow_Aimed_inplace
    WALK_FORWARD_WHILE_SHOOTING_INPLACE = 690  # Walk_Forward_While_Shooting_inplace
    WALK_FORWARD_WITH_BOW_AIMED_INPLACE = 691  # Walk_Forward_with_Bow_Aimed_inplace


class WalkAndRunAnimation(IntEnum):
    """Animation IDs for WalkAndRun category."""

    WALKING_WOMAN = 1  # Walking_Woman
    BACKLEFT_RUN = 5  # BackLeft_run
    BACKRIGHT_RUN = 6  # BackRight_Run
    JUMP_RUN = 13  # Jump_Run
    RUN_02 = 14  # Run_02
    RUN_03 = 15  # Run_03
    RUNFAST = 16  # RunFast
    WALK_FIGHT_BACK = 20  # Walk_Fight_Back
    WALK_FIGHT_FORWARD = 21  # Walk_Fight_Forward
    CASUAL_WALK = 30  # Casual_Walk
    STAGE_WALK = 55  # Stage_Walk
    CONFIDENT_WALK = 106  # Confident_Walk
    CONFIDENT_STRUT = 107  # Confident_Strut
    FLIRTY_STRUT = 108  # Flirty_Strut
    HELLO_RUN = 110  # Hello_Run
    INJURED_WALK = 111  # Injured_Walk
    MONSTER_WALK = 112  # Monster_Walk
    PROUD_STRUT = 114  # Proud_Strut
    QUICK_WALK = 115  # Quick_Walk
    RUN_TO_WALK_TRANSITION = 116  # Run_to_Walk_Transition
    RED_CARPET_WALK = 117  # Red_Carpet_Walk
    SKIP_FORWARD = 118  # Skip_Forward
    SLOW_ORC_WALK = 119  # Slow_Orc_Walk
    TOUCH_AND_RUN = 120  # Touch_and_Run
    THOUGHTFUL_WALK = 121  # Thoughtful_Walk
    TEXTING_WALK = 122  # Texting_Walk
    UNSTEADY_WALK = 123  # Unsteady_Walk
    WALKING_WITH_PHONE = 124  # Walking_with_Phone
    LEAN_FORWARD_SPRINT = 509  # Lean_Forward_Sprint
    STANDARD_FORWARD_CHARGE = 510  # Standard_Forward_Charge
    RIFLE_CHARGE = 511  # Rifle_Charge
    MALE_HEAD_DOWN_CHARGE = 512  # Male_Head_Down_Charge
    FEMALE_HEAD_DOWN_CHARGE = 513  # Female_Head_Down_Charge
    FEMALE_BOW_CHARGE_LEFT_HAND = 514  # Female_Bow_Charge_Left_Hand
    FEMALE_THROWING_STANCE_CHARGE = 515  # Female_Throwing_Stance_Charge
    SLIDE_LIGHT = 516  # slide_light
    SLIDE_RIGHT = 517  # slide_right
    SLIDING_ROOL = 518  # sliding_rool
    SLIDING_STUMBLE = 519  # sliding_stumble
    CROUCH_WALK_WITH_TORCH = 520  # Crouch_Walk_with_Torch
    CROUCH_WALK_LEFT_WITH_TORCH = 521  # Crouch_Walk_Left_with_Torch
    CROUCH_WALK_RIGHT_WITH_TORCH = 522  # Crouch_Walk_Right_with_Torch
    CAUTIOUS_CROUCH_WALK_BACKWARD = 523  # Cautious_Crouch_Walk_Backward
    CAUTIOUS_CROUCH_WALK_FORWARD = 524  # Cautious_Crouch_Walk_Forward
    CAUTIOUS_CROUCH_WALK_LEFT = 525  # Cautious_Crouch_Walk_Left
    CAUTIOUS_CROUCH_WALK_RIGHT = 526  # Cautious_Crouch_Walk_Right
    CROUCH_WALK_LEFT_WITH_GUN = 527  # Crouch_Walk_Left_with_Gun
    WALK_LEFT_WITH_GUN = 528  # Walk_Left_with_Gun
    WALK_BACKWARD_WITH_GUN = 529  # Walk_Backward_with_Gun
    RUN_FAST_3 = 530  # run_fast_3
    SPRINT_AND_SUDDEN_STOP = 531  # Sprint_and_Sudden_Stop
    RUN_FAST_4 = 532  # run_fast_4
    RUN_FAST_5 = 533  # run_fast_5
    RUN_FAST_6 = 534  # run_fast_6
    RUN_FAST_7 = 535  # run_fast_7
    RUN_FAST_8 = 536  # run_fast_8
    RUN_FAST_9 = 537  # run_fast_9
    RUN_FAST_10 = 538  # run_fast_10
    RUN_FAST_2 = 539  # run_fast_2
    INJURED_WALK_BACKWARD = 540  # Injured_Walk_Backward
    WALK_BACKWARD_WITH_GUN_1 = 541  # Walk_Backward_with_Gun_1
    WALK_BACKWARD_WITH_GRENADE = 542  # Walk_Backward_with_Grenade
    STEP_BACK = 543  # Step_Back
    WALK_BACKWARD = 544  # Walk_Backward
    WALK_BACKWARD_WITH_BOW = 545  # Walk_Backward_with_Bow
    WALK_BACKWARD_WITH_SWORD = 546  # Walk_Backward_with_Sword
    WALK_BACKWARD_WITH_BOW_1 = 547  # Walk_Backward_with_Bow_1
    WALK_BACKWARD_WITH_SWORD_SHIELD = 548  # Walk_Backward_with_Sword_Shield
    CRAWL_BACKWARD = 549  # Crawl_Backward
    CARRY_HEAVY_CANNON_FORWARD = 550  # Carry_Heavy_Cannon_Forward
    CARRY_HEAVY_OBJECT_WALK = 551  # Carry_Heavy_Object_Walk
    CARRY_WATER_BUCKET_WALK = 552  # Carry_Water_Bucket_Walk
    ELDERLY_SHAKY_WALK = 553  # Elderly_Shaky_Walk
    FUNKY_WALK = 554  # Funky_Walk
    LIMPING_WALK_1 = 555  # Limping_Walk_1
    LIMPING_WALK_2 = 556  # Limping_Walk_2
    LIMPING_WALK_3 = 557  # Limping_Walk_3
    LIMPING_WALK = 558  # Limping_Walk
    SNEAKY_WALK = 559  # Sneaky_Walk
    SPEAR_WALK = 560  # Spear_Walk
    STEP_HIP_HOP_DANCE = 561  # Step_Hip_Hop_Dance
    STUMBLE_WALK = 562  # Stumble_Walk
    STYLISH_WALK = 563  # Stylish_Walk
    TIGHTROPE_WALK = 564  # Tightrope_Walk
    WALK_WITH_UMBRELLA = 565  # Walk_with_Umbrella
    WALKING_2 = 566  # walking_2
    WALK_WITH_WALKER_SUPPORT = 567  # Walk_with_Walker_Support
    SWIM_IDLE = 568  # Swim_Idle
    SWIM_FORWARD = 569  # Swim_Forward
    SWIMMING_TO_EDGE = 570  # swimming_to_edge
    RUN_TURN_LEFT = 571  # Run_Turn_Left
    WALK_TURN_LEFT = 572  # Walk_Turn_Left
    RIFLE_TURN_LEFT = 573  # Rifle_Turn_Left
    WALK_TURN_LEFT_WITH_WEAPON = 574  # Walk_Turn_Left_with_Weapon
    COMBAT_IDLE_TURN_LEFT = 575  # Combat_Idle_Turn_Left
    IDLE_TURN_LEFT = 576  # Idle_Turn_Left
    IDLE_STEP_TURN_LEFT = 577  # Idle_Step_Turn_Left
    IDLE_TORCH_TURN_LEFT = 578  # Idle_Torch_Turn_Left
    DEPRESSED_FULL_TURN_LEFT = 579  # Depressed_Full_Turn_Left
    SWORD_AND_SHIELD_ALERT_TURN_LEFT = 580  # Sword_and_Shield_Alert_Turn_Left
    RUN_SHARP_TURN_RIGHT = 581  # Run_Sharp_Turn_Right
    RUN_TURN_RIGHT = 582  # Run_Turn_Right
    WALK_TURN_RIGHT = 583  # Walk_Turn_Right
    WALK_TURN_RIGHT_FEMALE = 584  # Walk_Turn_Right_Female
    RIFLE_AIM_TURN_RIGHT = 585  # Rifle_Aim_Turn_Right
    IDLE_TURN_RIGHT = 586  # Idle_Turn_Right
    WALK_TURN_RIGHT_IDLE_STYLE = 587  # Walk_Turn_Right_Idle_Style
    FRUSTRATED_TURN_RIGHT = 588  # Frustrated_Turn_Right
    ALERT_QUICK_TURN_RIGHT = 589  # Alert_Quick_Turn_Right
    SWORD_AND_SHIELD_ALERT_TURN_RIGHT = 590  # Sword_and_Shield_Alert_Turn_Right
    BACKLEFT_RUN_INPLACE = 606  # BackLeft_run_inplace
    BACKRIGHT_RUN_INPLACE = 607  # BackRight_Run_inplace
    CARRY_HEAVY_CANNON_FORWARD_INPLACE = 610  # Carry_Heavy_Cannon_Forward_inplace
    CARRY_HEAVY_OBJECT_WALK_INPLACE = 611  # Carry_Heavy_Object_Walk_inplace
    CARRY_WATER_BUCKET_WALK_INPLACE = 612  # Carry_Water_Bucket_Walk_inplace
    CASUAL_WALK_INPLACE = 613  # Casual_Walk_inplace
    CAUTIOUS_CROUCH_WALK_BACKWARD_INPLACE = 615  # Cautious_Crouch_Walk_Backward_inplace
    CAUTIOUS_CROUCH_WALK_FORWARD_INPLACE = 616  # Cautious_Crouch_Walk_Forward_inplace
    CAUTIOUS_CROUCH_WALK_LEFT_INPLACE = 617  # Cautious_Crouch_Walk_Left_inplace
    CAUTIOUS_CROUCH_WALK_RIGHT_INPLACE = 618  # Cautious_Crouch_Walk_Right_inplace
    CONFIDENT_STRUT_INPLACE = 621  # Confident_Strut_inplace
    CRAWL_BACKWARD_INPLACE = 622  # Crawl_Backward_inplace
    CROUCH_WALK_LEFT_WITH_GUN_INPLACE = 623  # Crouch_Walk_Left_with_Gun_inplace
    CROUCH_WALK_LEFT_WITH_TORCH_INPLACE = 624  # Crouch_Walk_Left_with_Torch_inplace
    CROUCH_WALK_RIGHT_WITH_TORCH_INPLACE = 625  # Crouch_Walk_Right_with_Torch_inplace
    ELDERLY_SHAKY_WALK_INPLACE = 626  # Elderly_Shaky_Walk_inplace
    FEMALE_BOW_CHARGE_LEFT_HAND_INPLACE = 627  # Female_Bow_Charge_Left_Hand_inplace
    FEMALE_THROWING_STANCE_CHARGE_INPLACE = 628  # Female_Throwing_Stance_Charge_inplace
    FLIRTY_STRUT_INPLACE = 629  # Flirty_Strut_inplace
    FUNKY_WALK_INPLACE = 632  # Funky_Walk_inplace
    HELLO_RUN_INPLACE = 636  # Hello_Run_inplace
    INJURED_WALK_INPLACE = 637  # Injured_Walk_inplace
    INJURED_WALK_BACKWARD_INPLACE = 638  # Injured_Walk_Backward_inplace
    JUMP_RUN_INPLACE = 643  # Jump_Run_inplace
    LEAN_FORWARD_SPRINT_INPLACE = 644  # Lean_Forward_Sprint_inplace
    LIMPING_WALK_INPLACE = 645  # Limping_Walk_inplace
    LIMPING_WALK_1_INPLACE = 646  # Limping_Walk_1_inplace
    LIMPING_WALK_2_INPLACE = 647  # Limping_Walk_2_inplace
    LIMPING_WALK_3_INPLACE = 648  # Limping_Walk_3_inplace
    PROUD_STRUT_INPLACE = 652  # Proud_Strut_inplace
    RED_CARPET_WALK_INPLACE = 653  # Red_Carpet_Walk_inplace
    RIFLE_CHARGE_INPLACE = 654  # Rifle_Charge_inplace
    RUN_FAST_10_INPLACE = 657  # run_fast_10_inplace
    RUN_FAST_2_INPLACE = 658  # run_fast_2_inplace
    RUN_FAST_3_INPLACE = 659  # run_fast_3_inplace
    RUN_FAST_4_INPLACE = 660  # run_fast_4_inplace
    RUN_FAST_5_INPLACE = 661  # run_fast_5_inplace
    RUN_FAST_6_INPLACE = 662  # run_fast_6_inplace
    RUN_FAST_7_INPLACE = 663  # run_fast_7_inplace
    RUN_FAST_8_INPLACE = 664  # run_fast_8_inplace
    RUN_FAST_9_INPLACE = 665  # run_fast_9_inplace
    RUN_TO_WALK_TRANSITION_INPLACE = 667  # Run_to_Walk_Transition_inplace
    SKIP_FORWARD_INPLACE = 668  # Skip_Forward_inplace
    SLOW_ORC_WALK_INPLACE = 669  # Slow_Orc_Walk_inplace
    SNEAKY_WALK_INPLACE = 671  # Sneaky_Walk_inplace
    SPEAR_WALK_INPLACE = 672  # Spear_Walk_inplace
    STANDARD_FORWARD_CHARGE_INPLACE = 673  # Standard_Forward_Charge_inplace
    STUMBLE_WALK_INPLACE = 674  # Stumble_Walk_inplace
    STYLISH_WALK_INPLACE = 675  # Stylish_Walk_inplace
    TEXTING_WALK_INPLACE = 676  # Texting_Walk_inplace
    TIGHTROPE_WALK_INPLACE = 677  # Tightrope_Walk_inplace
    UNSTEADY_WALK_INPLACE = 678  # Unsteady_Walk_inplace
    WALK_BACKWARD_INPLACE = 679  # Walk_Backward_inplace
    WALK_BACKWARD_WITH_BOW_INPLACE = 681  # Walk_Backward_with_Bow_inplace
    WALK_BACKWARD_WITH_BOW_1_INPLACE = 682  # Walk_Backward_with_Bow_1_inplace
    WALK_BACKWARD_WITH_GRENADE_INPLACE = 684  # Walk_Backward_with_Grenade_inplace
    WALK_BACKWARD_WITH_GUN_INPLACE = 685  # Walk_Backward_with_Gun_inplace
    WALK_BACKWARD_WITH_GUN_1_INPLACE = 686  # Walk_Backward_with_Gun_1_inplace
    WALK_BACKWARD_WITH_SWORD_INPLACE = 687  # Walk_Backward_with_Sword_inplace
    WALK_FIGHT_BACK_INPLACE = 688  # Walk_Fight_Back_inplace
    WALK_FIGHT_FORWARD_INPLACE = 689  # Walk_Fight_Forward_inplace
    WALKING_2_INPLACE = 692  # walking_2_inplace
    WALKING_WITH_PHONE_INPLACE = 693  # Walking_with_Phone_inplace
    WALK_LEFT_WITH_GUN_INPLACE = 694  # Walk_Left_with_Gun_inplace
    WALK_WITH_UMBRELLA_INPLACE = 695  # Walk_with_Umbrella_inplace
    WALK_WITH_WALKER_SUPPORT_INPLACE = 696  # Walk_with_Walker_Support_inplace


class AnimationCatalog:
    """Query interface for Meshy animation library."""

    def __init__(self):
        catalog_path = Path(__file__).parent / "animations.json"
        with open(catalog_path) as f:
            self._data = json.load(f)

        # Build lookup indices
        self._by_id: dict[int, dict[str, Any]] = {}
        self._by_slug: dict[str, dict[str, Any]] = {}
        self._by_name: dict[str, dict[str, Any]] = {}

        for _category, subcategories in self._data["categories"].items():
            for _subcategory, animations in subcategories.items():
                for anim in animations:
                    self._by_id[anim["id"]] = anim
                    self._by_slug[anim["slug"].upper()] = anim
                    self._by_name[anim["name"].lower()] = anim

    def get_by_id(self, animation_id: int) -> dict[str, Any]:
        """Get animation by ID.

        Args:
            animation_id: Numeric animation ID

        Returns:
            Animation dict with id, name, slug, category, subcategory

        Raises:
            KeyError: If animation ID not found
        """
        if animation_id not in self._by_id:
            msg = f"Animation with ID {animation_id} not found"
            raise KeyError(msg)
        return self._by_id[animation_id]

    def get_by_name(self, name: str) -> dict[str, Any]:
        """Get animation by name (case-insensitive).

        Args:
            name: Animation name (e.g., "Walking Woman")

        Returns:
            Animation dict

        Raises:
            KeyError: If animation name not found
        """
        key = name.lower()
        if key not in self._by_name:
            msg = f"Animation with name '{name}' not found"
            raise KeyError(msg)
        return self._by_name[key]

    def get_by_slug(self, slug: str) -> dict[str, Any]:
        """Get animation by slug (case-insensitive).

        Args:
            slug: Animation slug (e.g., "WALKING_WOMAN" or "walking_woman")

        Returns:
            Animation dict

        Raises:
            KeyError: If animation slug not found
        """
        key = slug.upper()
        if key not in self._by_slug:
            msg = f"Animation with slug '{slug}' not found"
            raise KeyError(msg)
        return self._by_slug[key]

    def get_by_category(
        self, category: str, subcategory: str | None = None
    ) -> list[dict[str, Any]]:
        """Get all animations in a category or subcategory.

        Args:
            category: Category name (e.g., "Walk And Run")
            subcategory: Optional subcategory filter (e.g., "Walking")

        Returns:
            List of animation dicts

        Raises:
            KeyError: If category not found
        """
        if category not in self._data["categories"]:
            msg = f"Category '{category}' not found"
            raise KeyError(msg)

        if subcategory:
            if subcategory not in self._data["categories"][category]:
                msg = f"Subcategory '{subcategory}' not found in category '{category}'"
                raise KeyError(msg)
            return self._data["categories"][category][subcategory]

        # Return all animations in category
        result = []
        for anims in self._data["categories"][category].values():
            result.extend(anims)
        return result

    def list_all(self) -> list[dict[str, Any]]:
        """Get all animations."""
        return list(self._by_id.values())

    def list_categories(self) -> list[str]:
        """Get all category names."""
        return list(self._data["categories"].keys())

    def list_subcategories(self, category: str) -> list[str]:
        """Get all subcategory names for a category."""
        if category not in self._data["categories"]:
            msg = f"Category '{category}' not found"
            raise KeyError(msg)
        return list(self._data["categories"][category].keys())


__all__ = [
    "AnimationCatalog",
    "AnimationId",
    "BodyMovementsAnimation",
    "DailyActionsAnimation",
    "DancingAnimation",
    "FightingAnimation",
    "WalkAndRunAnimation",
]
