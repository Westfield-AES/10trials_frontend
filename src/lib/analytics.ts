import "client-only";

import posthog from "posthog-js";

let initialized = false;

function initializeAnalytics(optedOut: boolean) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return false;

  if (!initialized) {
    posthog.init(key, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      disable_session_recording: true,
      mask_all_text: true,
      mask_all_element_attributes: true,
      opt_out_capturing_by_default: optedOut,
      persistence: "localStorage",
      person_profiles: "identified_only",
      respect_dnt: true,
    });
    initialized = true;
  }
  return true;
}

export function enableAnalytics() {
  if (!initializeAnalytics(false)) return false;
  posthog.opt_in_capturing();
  return true;
}

export function disableAnalytics() {
  if (!initializeAnalytics(true)) return;
  posthog.stopSessionRecording();
  posthog.reset(true);
  posthog.opt_out_capturing();
}
