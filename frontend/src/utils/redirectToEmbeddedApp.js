// redirectToEmbeddedApp.js
export function ensureEmbeddedApp() {
    const isEmbedded = window.top !== window.self;
    const host = new URLSearchParams(window.location.search).get("host");
    const shop = new URLSearchParams(window.location.search).get("shop");
  
    if (!isEmbedded && host && shop) {
      const redirectUrl = `/auth/embedded?shop=${shop}&host=${host}`;
      window.top.location.assign(redirectUrl);
    }
  }
  