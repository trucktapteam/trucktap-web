"use client";

import { useCallback, useState } from "react";
import type { Commercial } from "@/lib/redesign/commercial-break";
import type { ProgrammingSlate as SlateData } from "@/lib/redesign/ttn-guide";
import { ProgrammingSlate } from "./ProgrammingSlate";
import { CommercialBreakSlate } from "./CommercialBreakSlate";

/**
 * The TTN-86 upper programming panel. Server-decided once per load (in
 * <Ttn86>) whether this is a commercial-break load; this client wrapper
 * then owns the one runtime transition:
 *
 *   commercial facade -> spot plays -> spot's YouTube video ENDS
 *     -> back to <ProgrammingSlate> with the same slate data
 *
 * The swap is pure client state — no navigation, no refetch — and it
 * doesn't touch the TruckTap Guide rendered as a sibling below it. On a
 * normal load (`commercial` is null) this is just <ProgrammingSlate>.
 */
export function ProgrammingPanel({
  commercial,
  slateA,
  slateB,
}: {
  commercial: Commercial | null;
  slateA: SlateData;
  slateB: SlateData;
}) {
  const [breakEnded, setBreakEnded] = useState(false);
  const handleEnded = useCallback(() => setBreakEnded(true), []);

  if (commercial && !breakEnded) {
    return <CommercialBreakSlate commercial={commercial} onEnded={handleEnded} />;
  }

  return <ProgrammingSlate slateA={slateA} slateB={slateB} />;
}
