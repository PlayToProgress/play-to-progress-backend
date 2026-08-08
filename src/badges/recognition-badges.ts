import { BadgeType } from '../schemas/badge.schema';

export const RECOGNITION_BADGES: { type: BadgeType; label: string }[] = [
  { type: 'confidence_builder', label: 'Confidence Builder' },
  { type: 'goal_setter', label: 'Goal Setter' },
  { type: 'creative_thinker', label: 'Creative Thinker' },
  { type: 'team_player', label: 'Team Player' },
];

export const RECOGNITION_BADGE_TYPES = RECOGNITION_BADGES.map((b) => b.type);

export function labelForRecognitionBadge(type: BadgeType): string {
  return RECOGNITION_BADGES.find((b) => b.type === type)?.label ?? type;
}