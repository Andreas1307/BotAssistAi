export function detectShopifyUser() {
  const params = new URLSearchParams(window.location.search);
  const shop = params.get("shop");
  const host = params.get("host");

  if (shop && host) {
    localStorage.setItem("shopifyUser", "true");
    localStorage.setItem("shop", shop);
    localStorage.setItem("host", host);
    return true;
  }

  console.warn("❌ Missing shop or host parameter in URL.");
  return false;
}
