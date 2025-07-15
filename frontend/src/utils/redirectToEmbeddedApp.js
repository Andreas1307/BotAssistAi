// utils/redirectToEmbeddedApp.js
export function ensureEmbeddedApp() {
  const isEmbedded = window.top !== window.self;
  const urlParams = new URLSearchParams(window.location.search);
  const shop = urlParams.get("shop");
  const host = urlParams.get("host");

  if (isEmbedded && (!host || !shop)) {
    // fallback to redirect to /auth/embedded
    window.location.href = `/auth/embedded?shop=${shop || ""}`;
  }
}
