export const features = {
  childrensCheckIn: true,
  pastoralCare: true,
  discipleship: true,
  volunteers: true,
  giving: true,
  selfCheckIn: true,
} as const;

export type FeatureFlag = keyof typeof features;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return features[flag];
}
