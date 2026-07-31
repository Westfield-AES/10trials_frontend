type HeaderMap = Record<string, unknown>;

type Breadcrumb = {
  category?: string;
  data?: Record<string, unknown>;
};

type SentryLikeEvent = {
  breadcrumbs?: Breadcrumb[];
  extra?: unknown;
  request?: {
    cookies?: unknown;
    data?: unknown;
    headers?: HeaderMap;
    query_string?: unknown;
    url?: string;
  };
  transaction?: string;
  user?: unknown;
};

const SENSITIVE_HEADERS = new Set([
  "authorization",
  "cookie",
  "referer",
  "set-cookie",
  "x-paystack-signature",
  "x-twilio-signature",
]);

export function safeTelemetryUrl(value: string) {
  const withoutQuery = value.split(/[?#]/, 1)[0];
  return withoutQuery.replace(/\/app\/history\/[^/]+$/, "/app/history/[id]");
}

export function scrubSentryEvent<T extends SentryLikeEvent>(event: T): T {
  delete event.user;
  delete event.extra;
  if (event.transaction) {
    event.transaction = safeTelemetryUrl(event.transaction);
  }

  if (event.request) {
    delete event.request.cookies;
    delete event.request.data;
    delete event.request.query_string;
    if (event.request.url) {
      event.request.url = safeTelemetryUrl(event.request.url);
    }
    if (event.request.headers) {
      for (const name of Object.keys(event.request.headers)) {
        if (SENSITIVE_HEADERS.has(name.toLowerCase())) {
          event.request.headers[name] = "[Filtered]";
        }
      }
    }
  }

  event.breadcrumbs = event.breadcrumbs
    ?.filter((breadcrumb) => {
      const category = breadcrumb.category ?? "";
      return category !== "console" && !category.startsWith("ui.");
    })
    .map((breadcrumb) => {
      if (!breadcrumb.data) return breadcrumb;
      const data = { ...breadcrumb.data };
      for (const key of ["url", "from", "to"]) {
        if (typeof data[key] === "string") {
          data[key] = safeTelemetryUrl(data[key]);
        }
      }
      return { ...breadcrumb, data };
    });

  return event;
}
