import type { ConditionGrade } from "./data/types";

export const MAX_YEARS = 30;

export function gradeFor(years: number): ConditionGrade {
  if (years <= 2) return "Mint";
  if (years <= 8) return "Lightly worn";
  if (years <= 15) return "Worn in";
  if (years <= 22) return "Well loved";
  return "Road worn";
}

/** 0..1 ageing factor, eased so the first years are gentle. */
export function ageFactor(years: number) {
  const t = Math.max(0, Math.min(1, years / MAX_YEARS));
  return t * t * (3 - 2 * t);
}
