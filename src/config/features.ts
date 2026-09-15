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
  /**
   * The AI drafting copilot inside the admin area. Separate from `aiAssistant`
   * on purpose: a church may want staff drafting help without a bot talking to
   * the public, or the reverse. Also requires an API key.
   */
  aiStaffCopilot: true,
} as const;

export type FeatureFlag = keyof typeof features;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return features[flag];
}
