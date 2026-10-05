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
