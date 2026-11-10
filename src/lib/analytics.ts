import "client-only";

// Bundle the recorder locally so replay works with our script-src policy.
import "posthog-js/dist/posthog-recorder";
import posthog from "posthog-js/dist/module.no-external";
import { safeTelemetryUrl } from "@/lib/sentry-privacy";

let initialized = false;

function scrubUrlProperties(properties: Record<string, unknown>) {
  for (const key of [
    "$current_url",
    "$referrer",
    "$initial_current_url",
    "$initial_referrer",
  ]) {
    if (typeof properties[key] === "string") {
      properties[key] = safeTelemetryUrl(properties[key]);
    }
  }
}

export function initializeAnalytics() {
  if (initialized || typeof window === "undefined") return initialized;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return false;

  try {
    posthog.init(key, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      autocapture: true,
      capture_pageview: "history_change",
      capture_pageleave: true,
      disable_session_recording: false,
      disable_external_dependency_loading: true,
      enable_recording_console_log: false,
      mask_all_text: true,
      mask_all_element_attributes: true,
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: "*",
        recordHeaders: false,
        recordBody: false,
        maskCapturedNetworkRequestFn: (request) => {
          if (request.name) request.name = safeTelemetryUrl(request.name);
          return request;
        },
      },
      before_send: (event) => {
        if (!event) return event;
        scrubUrlProperties(event.properties);
        for (const key of ["$set", "$set_once"]) {
          const properties: unknown = event.properties[key];
          if (properties && typeof properties === "object") {
            scrubUrlProperties(properties as Record<string, unknown>);
          }
        }
        return event;
      },
      opt_out_capturing_by_default: false,
      opt_out_persistence_by_default: false,
      persistence: "localStorage",
      person_profiles: "identified_only",
      respect_dnt: false,
      loaded: (client) => {
        // Retire the previous consent gate without emitting a user opt-in event.
        client.clear_opt_in_out_capturing();
        client.startSessionRecording();
      },
    });
    initialized = true;
    return true;
  } catch {
    // A blocked analytics SDK must not prevent the app or Sentry from starting.
    console.warn("10Trials analytics could not initialize.");
    return false;
  }
}
