import { useEffect, useState } from "react";

export function useShopifyInstalled() {
  const [shopifyInstalled, setShopifyInstalled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shopifyUser = params.get("shopifyUser");

    if (shopifyUser === "true") {
      setShopifyInstalled(true);
    }
    setLoading(false);
  }, []);

  return { shopifyInstalled, loading };
}
