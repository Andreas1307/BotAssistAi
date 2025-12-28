import { useEffect, useState } from "react";

export default function ShopifyLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const params = new URLSearchParams(window.location.search);
      const shop = params.get("shop");

      if (!shop) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("https://api.botassistai.com/auth-check", {
          credentials: "include",
        });

        const data = await res.json();

        // ✅ Already authenticated → stay in app
        if (data?.user) {
          setLoading(false);
          return;
        }

        // ❌ Not authenticated → start OAuth
        const installUrl = `https://api.botassistai.com/shopify?shop=${encodeURIComponent(
          shop
        )}`;

        if (window.top !== window.self) {
          window.top.location.href = installUrl;
        } else {
          window.location.href = installUrl;
        }
      } catch (err) {
        console.error("Auth check failed", err);
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  return <div>{loading ? "Loading Shopify App…" : null}</div>;
}
