// utils/detectShopify.js

export function detectShopifyUser() {
  const params = new URLSearchParams(window.location.search);
  const shop = params.get("shop");
  const host = params.get("host");

  if (shop) localStorage.setItem("shop", shop);
  if (host) localStorage.setItem("host", host);

  // Consider as Shopify user if either shop or host is present
  const isShopify = !!(shop || host);
  localStorage.setItem("shopifyUser", isShopify ? "true" : "false");

  return isShopify;
}
