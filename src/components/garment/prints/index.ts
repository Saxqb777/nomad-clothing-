import type { PrintId } from "@/lib/data/types";
import type { PrintComponent } from "./common";
import { VelvetStatic, DustCoyote, PaperSaints, HollowKings } from "./set-a";
import { NeonMirage, RustParade, BlackOrchidClub, SunRiot } from "./set-b";
import { GlassHarbour, CopperHymnal, LanternYouth, PaleRadio } from "./set-c";

export const PRINTS: Record<PrintId, PrintComponent> = {
  "velvet-static": VelvetStatic,
  "dust-coyote": DustCoyote,
  "paper-saints": PaperSaints,
  "hollow-kings": HollowKings,
  "neon-mirage": NeonMirage,
  "rust-parade": RustParade,
  "black-orchid-club": BlackOrchidClub,
  "sun-riot": SunRiot,
  "glass-harbour": GlassHarbour,
  "copper-hymnal": CopperHymnal,
  "lantern-youth": LanternYouth,
  "pale-radio": PaleRadio,
};
