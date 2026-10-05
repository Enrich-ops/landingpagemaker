/**
 * Campaign rules (Vyro / Ketone-IQ brief). Overlay mode enforces these so a post
 * can't be published in violation of the brief.
 */
export const campaign = {
  name: "Ketone-IQ (Vyro)",
  mandatoryCaptions: [
    "Crazy how far Ketone-IQ has come",
    "Ketone-IQ really started like THIS 💀",
    "The nerds were onto something 👀",
    "Ketone-IQ before it was everywhere 👀",
  ],
  suggestedHooks: [
    "Sharks go OFF on these nerds",
    "Shark Tank absolutely COOKED these nerds",
    "Joe Rogan's 6-hour brain cheat code??",
    "Silicon Valley really tried to bottle ketosis 😭",
    "this is either genius or peak biohacker insanity",
    "the tech bros might've actually cooked with this one",
  ],
};

/** Returns a list of problems; empty means the caption is compliant. */
export function validateCaption(caption: string): string[] {
  const problems: string[] = [];
  const lower = caption.toLowerCase();
  if (!campaign.mandatoryCaptions.some((m) => lower.includes(m.toLowerCase())))
    problems.push(`Caption must include one of: ${campaign.mandatoryCaptions.map((m) => `"${m}"`).join(" | ")}`);
  if (/(^|\s)#\w+/.test(caption))
    problems.push("Brief forbids hashtags not affiliated with the campaign; remove all hashtags.");
  return problems;
}

/** Border colours for A/B variants (dark, high-contrast against typical footage). */
export const borderPalette = ["#111111", "#0b1f3a", "#3a0b0b", "#0b3a22", "#2a0b3a", "#3a2a0b"];

export interface Variant {
  hookText: string;
  caption: string;
  border: string;
}

/**
 * Plan N distinct hook/caption/border combos from the brief's approved lists.
 * Hooks and captions are offset against each other so no two variants share either,
 * which makes the performance of each hook and each caption separable.
 */
export function planVariants(n: number): Variant[] {
  const count = Math.max(1, Math.min(n, campaign.suggestedHooks.length));
  return Array.from({ length: count }, (_, i) => ({
    hookText: campaign.suggestedHooks[i],
    caption: campaign.mandatoryCaptions[i % campaign.mandatoryCaptions.length],
    border: borderPalette[i % borderPalette.length],
  }));
}
