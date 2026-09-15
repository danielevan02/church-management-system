export const features = {
  childrensCheckIn: true,
  pastoralCare: true,
  discipleship: true,
  volunteers: true,
  giving: true,
  selfCheckIn: true,
  devotionals: true,
  /** The public AI assistant on the landing page. Also requires an API key. */
  aiAssistant: true,
} as const;

export type FeatureFlag = keyof typeof features;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return features[flag];
}
