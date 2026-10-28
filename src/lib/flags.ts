/**
 * Feature flags. Anything that does not hit the quality bar ships behind one
 * of these so it can be turned on for testing without a redeploy of logic.
 * Flip in the browser with: localStorage.setItem("nomad:flag:<name>", "1")
 */
export const FLAGS = {
  /** Shake-to-dig on phones. Depends on DeviceMotion permission; button is the fallback. */
  shakeToDig: true,
  /** Hanger-to-hanger knock physics. */
  knocks: true,
  /** Needle Drop generative loops. */
  needleDrop: true,
} as const;

export type FlagName = keyof typeof FLAGS;

export function flag(name: FlagName): boolean {
  if (typeof window !== "undefined") {
    const v = window.localStorage.getItem(`nomad:flag:${name}`);
    if (v === "1") return true;
    if (v === "0") return false;
  }
  return FLAGS[name];
}
