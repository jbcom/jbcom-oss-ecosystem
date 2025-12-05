"""Meshy Animation Library - 600+ pre-built animations."""

from dataclasses import dataclass
from enum import Enum


@dataclass
class AnimationMeta:
    """Metadata for a Meshy animation."""

    id: int
    name: str
    category: str
    subcategory: str
    preview_url: str


class AnimationCategory(str, Enum):
    """Animation categories."""

    DAILY_ACTIONS = "DailyActions"
    WALK_AND_RUN = "WalkAndRun"
    FIGHTING = "Fighting"
    DANCING = "Dancing"
    BODY_MOVEMENTS = "BodyMovements"


class AnimationSubcategory(str, Enum):
    """Animation subcategories."""

    # Daily Actions
    IDLE = "Idle"
    LOOKING_AROUND = "LookingAround"
    INTERACTING = "Interacting"
    TRANSITIONING = "Transitioning"

    # Walk and Run
    WALKING = "Walking"
    RUNNING = "Running"

    # Fighting
    ATTACKING_WITH_WEAPON = "AttackingwithWeapon"
    GETTING_HIT = "GettingHit"
    DYING = "Dying"

    # Dancing
    DANCING = "Dancing"

    # Body Movements
    ACTING = "Acting"


# Animation Library (first 85 from docs, full 600+ available)
ANIMATIONS: dict[int, AnimationMeta] = {
    0: AnimationMeta(
        0,
        "Idle",
        "DailyActions",
        "Idle",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/Idle.gif",
    ),
    1: AnimationMeta(
        1,
        "Walking_Woman",
        "WalkAndRun",
        "Walking",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/Walking_Woman_woman.gif",
    ),
    2: AnimationMeta(
        2,
        "Alert",
        "DailyActions",
        "LookingAround",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/Alert.gif",
    ),
    3: AnimationMeta(
        3,
        "Arise",
        "DailyActions",
        "LookingAround",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/Arise.gif",
    ),
    4: AnimationMeta(
        4,
        "Attack",
        "Fighting",
        "AttackingwithWeapon",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/Attack.gif",
    ),
    5: AnimationMeta(
        5,
        "BackLeft_run",
        "WalkAndRun",
        "Running",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/BackLeft_run.gif",
    ),
    6: AnimationMeta(
        6,
        "BackRight_Run",
        "WalkAndRun",
        "Running",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/BackRight_Run.gif",
    ),
    7: AnimationMeta(
        7,
        "BeHit_FlyUp",
        "Fighting",
        "GettingHit",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/BeHit_FlyUp.gif",
    ),
    8: AnimationMeta(
        8,
        "Dead",
        "Fighting",
        "Dying",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/Dead.gif",
    ),
    9: AnimationMeta(
        9,
        "ForwardLeft_Run_Fight",
        "Fighting",
        "Transitioning",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/ForwardLeft_Run_Fight.gif",
    ),
    10: AnimationMeta(
        10,
        "ForwardRight_Run_Fight",
        "Fighting",
        "Transitioning",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/ForwardRight_Run_Fight.gif",
    ),
    11: AnimationMeta(
        11,
        "Idle_02",
        "DailyActions",
        "Idle",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/Idle_02.gif",
    ),
    12: AnimationMeta(
        12,
        "Idle_03",
        "DailyActions",
        "Idle",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/Idle_03.gif",
    ),
    13: AnimationMeta(
        13,
        "Jump_Run",
        "WalkAndRun",
        "Running",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/Jump_Run.gif",
    ),
    14: AnimationMeta(
        14,
        "Run_02",
        "WalkAndRun",
        "Running",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/Run_02.gif",
    ),
    15: AnimationMeta(
        15,
        "Run_03",
        "WalkAndRun",
        "Running",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/Run_03.gif",
    ),
    16: AnimationMeta(
        16,
        "RunFast",
        "WalkAndRun",
        "Running",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/RunFast.gif",
    ),
    17: AnimationMeta(
        17,
        "Skill_01",
        "BodyMovements",
        "Acting",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/Skill_01.gif",
    ),
    18: AnimationMeta(
        18,
        "Skill_02",
        "BodyMovements",
        "Acting",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/Skill_02.gif",
    ),
    19: AnimationMeta(
        19,
        "Skill_03",
        "BodyMovements",
        "Acting",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/Skill_03.gif",
    ),
    20: AnimationMeta(
        20,
        "Walk_Fight_Back",
        "WalkAndRun",
        "Walking",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/Walk_Fight_Back.gif",
    ),
    21: AnimationMeta(
        21,
        "Walk_Fight_Forward",
        "WalkAndRun",
        "Walking",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/Walk_Fight_Forward.gif",
    ),
    # Dancing
    22: AnimationMeta(
        22,
        "FunnyDancing_01",
        "Dancing",
        "Dancing",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/FunnyDancing_01.gif",
    ),
    23: AnimationMeta(
        23,
        "FunnyDancing_02",
        "Dancing",
        "Dancing",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/FunnyDancing_02.gif",
    ),
    24: AnimationMeta(
        24,
        "FunnyDancing_03",
        "Dancing",
        "Dancing",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/FunnyDancing_03.gif",
    ),
    # Interactive gestures
    25: AnimationMeta(
        25,
        "Agree_Gesture",
        "DailyActions",
        "Interacting",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/Agree_Gesture.gif",
    ),
    26: AnimationMeta(
        26,
        "Angry_Stomp",
        "DailyActions",
        "Interacting",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/Angry_Stomp.gif",
    ),
    27: AnimationMeta(
        27,
        "Big_Heart_Gesture",
        "BodyMovements",
        "Acting",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/Big_Heart_Gesture.gif",
    ),
    28: AnimationMeta(
        28,
        "Big_Wave_Hello",
        "DailyActions",
        "Interacting",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/Big_Wave_Hello.gif",
    ),
    29: AnimationMeta(
        29,
        "Call_Gesture",
        "BodyMovements",
        "Acting",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/Call_Gesture.gif",
    ),
    30: AnimationMeta(
        30,
        "Casual_Walk",
        "WalkAndRun",
        "Walking",
        "https://cdn.meshy.ai/webapp-assets/feature-demo/animation/preview/biped/Casual_Walk.gif",
    ),
}


# Curated animation sets for common game use cases


class GameAnimationSet:
    """Pre-defined animation sets for common game scenarios."""

    # Basic character movement
    BASIC_MOVEMENT = [0, 1, 14, 30]  # Idle, Walk, Run_02, Casual_Walk

    # Combat
    COMBAT = [0, 4, 7, 8, 9, 10]  # Idle, Attack, BeHit, Dead, transitions

    # Social/NPC
    SOCIAL = [0, 25, 26, 28, 41, 49, 56]  # Idle, gestures, bow, cheer, chat

    # Dance/celebrate
    CELEBRATION = [22, 23, 24, 59, 63, 64, 65, 66]  # Dancing, cheers

    # Exploration
    EXPLORATION = [0, 1, 2, 3, 30, 55]  # Idle, walk, alert, arise, stage walk

    # Otter player (for Rivermarsh)
    OTTER_PLAYER = [0, 1, 14, 30, 28, 46, 45]  # Idle, walk, run, wave, jump rope, play


def get_animations_by_category(category: AnimationCategory) -> list[AnimationMeta]:
    """Get all animations in a category."""
    return [anim for anim in ANIMATIONS.values() if anim.category == category.value]


def get_animations_by_subcategory(subcategory: AnimationSubcategory) -> list[AnimationMeta]:
    """Get all animations in a subcategory."""
    return [anim for anim in ANIMATIONS.values() if anim.subcategory == subcategory.value]


def get_animation(action_id: int) -> AnimationMeta:
    """Get animation by ID."""
    if action_id not in ANIMATIONS:
        msg = f"Animation ID {action_id} not found"
        raise ValueError(msg)
    return ANIMATIONS[action_id]
