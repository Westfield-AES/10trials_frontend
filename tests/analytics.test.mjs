import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function evaluate(relativePath, environment, dependencies = {}) {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });
  const loadedModule = { exports: {} };
  vm.runInNewContext(outputText, {
    module: loadedModule,
    exports: loadedModule.exports,
    require: (name) => {
      assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
    process: { env: environment.env ?? {} },
    console: environment.console ?? console,
    ...(environment.browser === false ? {} : { window: {} }),
    URL,
  });
  return loadedModule.exports;
}

function analytics({
  key = "phc_test",
  browser = true,
  fail = false,
  optedOut = false,
} = {}) {
  let config;
  let initCount = 0;
  let capturing = !optedOut;
  const calls = [];
  const warnings = [];
  const client = {
    init(_key, options) {
      initCount += 1;
      if (fail) throw new Error("SDK unavailable");
      config = options;
      options.loaded(client);
      return client;
    },
    clear_opt_in_out_capturing() {
      calls.push("clearLegacyGate");
      capturing = true;
    },
    startSessionRecording() {
      assert.equal(capturing, true);
      calls.push("startReplay");
    },
  };
  const privacy = evaluate("src/lib/sentry-privacy.ts", {});
  const exports = evaluate(
    "src/lib/analytics.ts",
    {
      browser,
      env: { NEXT_PUBLIC_POSTHOG_KEY: key },
      console: { warn: (message) => warnings.push(message) },
    },
    {
      "client-only": {},
      "posthog-js/dist/posthog-recorder": {},
      "posthog-js/dist/module.no-external": {
        __esModule: true,
        default: client,
      },
      "@/lib/sentry-privacy": privacy,
    },
  );
  return {
    ...exports,
    calls,
    warnings,
    config: () => config,
    initCount: () => initCount,
  };
}

test("analytics starts automatically without a consent choice and initializes once", () => {
  const sdk = analytics();
  assert.equal(sdk.initializeAnalytics(), true);
  assert.equal(sdk.initializeAnalytics(), true);
  assert.equal(sdk.initCount(), 1);
  assert.equal(sdk.config().autocapture, true);
  assert.equal(sdk.config().capture_pageview, "history_change");
  assert.equal(sdk.config().capture_pageleave, true);
  assert.equal(sdk.config().disable_session_recording, false);
  assert.equal(sdk.config().opt_out_capturing_by_default, false);
  assert.equal(sdk.config().respect_dnt, false);
  assert.deepEqual(sdk.calls, ["clearLegacyGate", "startReplay"]);
});

test("returning visitors no longer retain the previous SDK opt-out gate", () => {
  const sdk = analytics({ optedOut: true });
  assert.equal(sdk.initializeAnalytics(), true);
  assert.deepEqual(sdk.calls, ["clearLegacyGate", "startReplay"]);
});

test("replay protects inputs and text and excludes headers, bodies, and console logs", () => {
  const sdk = analytics();
  sdk.initializeAnalytics();
  const config = sdk.config();
  assert.equal(config.session_recording.maskAllInputs, true);
  assert.equal(config.session_recording.maskTextSelector, "*");
  assert.equal(config.session_recording.recordHeaders, false);
  assert.equal(config.session_recording.recordBody, false);
  assert.equal(config.enable_recording_console_log, false);
  assert.equal(config.mask_all_text, true);
  assert.equal(config.mask_all_element_attributes, true);
  assert.equal(config.disable_external_dependency_loading, true);
});

test("analytics and replay redact auth URL parameters without dropping ordinary events", () => {
  const sdk = analytics();
  sdk.initializeAnalytics();
  const event = {
    event: "$pageview",
    properties: {
      $current_url: "https://10trials.com/auth/action?oobCode=secret#token",
      $referrer: "https://example.com/?email=private@example.com",
      $set_once: { $initial_current_url: "https://10trials.com/?token=secret" },
      $set: { $initial_referrer: "https://example.com/?auth=secret" },
      label: "page visit",
    },
  };
  assert.equal(sdk.config().before_send(null), null);
  assert.equal(sdk.config().before_send(event), event);
  assert.equal(
    event.properties.$current_url,
    "https://10trials.com/auth/action",
  );
  assert.equal(event.properties.$referrer, "https://example.com/");
  assert.equal(
    event.properties.$set_once.$initial_current_url,
    "https://10trials.com/",
  );
  assert.equal(event.properties.$set.$initial_referrer, "https://example.com/");
  assert.equal(event.properties.label, "page visit");
  const request = {
    name: "https://10trials.com/app/history/private-id?token=secret",
  };
  assert.equal(
    sdk.config().session_recording.maskCapturedNetworkRequestFn(request).name,
    "https://10trials.com/app/history/[id]",
  );
});

test("missing configuration and server rendering do not initialize the browser SDK", () => {
  for (const options of [{ key: "" }, { browser: false }]) {
    const sdk = analytics(options);
    assert.equal(sdk.initializeAnalytics(), false);
    assert.equal(sdk.initCount(), 0);
  }
});

test("SDK failure cannot prevent application startup", () => {
  const sdk = analytics({ fail: true });
  assert.equal(sdk.initializeAnalytics(), false);
  assert.equal(sdk.warnings.length, 1);
});

test("client instrumentation initializes analytics even without a Sentry DSN", () => {
  let starts = 0;
  evaluate(
    "src/instrumentation-client.ts",
    {},
    {
      "@sentry/nextjs": {},
      "@/lib/analytics": { initializeAnalytics: () => starts++ },
      "@/lib/sentry-privacy": {},
    },
  );
  assert.equal(starts, 1);
});

test("production CSP permits PostHog config and replay workers with locally bundled scripts", async () => {
  const config = evaluate("next.config.ts", {
    env: { NODE_ENV: "production" },
  }).default;
  const headers = await config.headers();
  const policy = headers
    .find((entry) => entry.source === "/(.*)")
    .headers.find((entry) => entry.key === "Content-Security-Policy").value;
  const directives = Object.fromEntries(
    policy.split("; ").map((directive) => {
      const [name, ...values] = directive.split(" ");
      return [name, values];
    }),
  );
  assert.ok(directives["connect-src"].includes("https://*.posthog.com"));
  assert.ok(directives["connect-src"].includes("https://us.i.posthog.com"));
  assert.ok(directives["worker-src"].includes("blob:"));
  assert.ok(directives["worker-src"].includes("data:"));
  assert.ok(
    !directives["script-src"].some((source) => source.includes("posthog.com")),
  );
});
