"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatCoordinates,
  googleMapsVerifyUrl,
} from "../utils/coordinate-input";

/**
 * "Here is where we think you are — go look, then tell us it's right."
 *
 * Used by BOTH paths: the GPS fix on a phone and the typed coordinate on a
 * desktop. One rule, one component: `exact` always means a human opened the
 * spot in Google Maps and said yes.
 *
 * Why this applies to GPS too, not just the desktop fallback: the accuracy
 * figure a browser reports is itself an estimate. A fix that claims 40m indoors
 * can easily be the building next door, and a wrong doorstep costs a failed
 * delivery. The address line we resolve is a weak check — plenty of Indian
 * colonies reverse-geocode to the same street name for a hundred houses — so
 * seeing the pin on satellite imagery is the only real confirmation available.
 *
 * Google Maps rather than a map we render ourselves: on the desktop path the
 * user copied the coordinate out of Google Maps in the first place, so showing
 * it back there is pixel-identical to what they were just looking at. Using the
 * same surface on mobile keeps one mental model instead of two.
 */

interface LocationConfirmProps {
  latitude: number;
  longitude: number;
  /** Reverse-geocoded street/area line. Empty is fine — it's a hint, not a gate. */
  areaLine: string;
  isResolving: boolean;
  /**
   * Start in the confirmed state. Used when editing a saved address: that
   * coordinate was confirmed when it was created, and making someone re-verify
   * it just to correct a flat number is friction for nothing. The link is still
   * shown, so they can re-check if they want to.
   */
  initiallyConfirmed?: boolean;
  /** Fires false the moment the coordinate changes, true once confirmed. */
  onConfirmedChange: (confirmed: boolean) => void;
}

export function LocationConfirm({
  latitude,
  longitude,
  areaLine,
  isResolving,
  initiallyConfirmed = false,
  onConfirmedChange,
}: LocationConfirmProps) {
  const [linkOpened, setLinkOpened] = useState(initiallyConfirmed);
  const [confirmed, setConfirmed] = useState(initiallyConfirmed);

  const key = formatCoordinates(latitude, longitude);

  const onConfirmedChangeRef = useRef(onConfirmedChange);
  useEffect(() => {
    onConfirmedChangeRef.current = onConfirmedChange;
  }, [onConfirmedChange]);

  /**
   * A new coordinate invalidates any confirmation that came before it.
   * Otherwise a user could confirm one point, change it, and save the second
   * one on the first one's approval.
   *
   * Skipped on mount, so `initiallyConfirmed` survives the first render.
   */
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    setLinkOpened(false);
    setConfirmed(false);
  }, [key]);

  useEffect(() => {
    onConfirmedChangeRef.current(confirmed);
  }, [confirmed]);

  return (
    <div className="space-y-3 rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3.5">
      <div className="flex items-start gap-2.5">
        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-sm font-semibold text-on-surface">{key}</p>
          <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
            {isResolving ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Reading address…
              </span>
            ) : (
              areaLine || "Address not found — type it below."
            )}
          </p>
        </div>
      </div>

      <a
        href={googleMapsVerifyUrl(latitude, longitude)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setLinkOpened(true)}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
      >
        <ExternalLink className="h-4 w-4" />
        Open in Google Maps to check
      </a>

      {confirmed ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/25 px-4 py-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          <p className="text-sm leading-relaxed text-emerald-100">
            <span className="font-semibold">Location confirmed.</span> Fill in
            your flat and building below.
          </p>
        </div>
      ) : (
        <>
          <Button
            type="button"
            onClick={() => setConfirmed(true)}
            disabled={!linkOpened}
            className={`w-full cursor-pointer rounded-xl text-sm font-bold text-black ${
              !linkOpened ? "pointer-events-none opacity-50" : ""
            }`}
          >
            Yes, this is my location
          </Button>
          <p className="text-center text-sm leading-relaxed text-on-surface-variant">
            {linkOpened
              ? "Confirm only if the pin landed on your house."
              : "Open the link above first — we need you to check the pin before saving."}
          </p>
        </>
      )}
    </div>
  );
}
