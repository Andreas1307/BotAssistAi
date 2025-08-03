import { useEffect, useState } from "react";

export function useShopifyInstalled() {
  const [shopifyInstalled, setShopifyInstalled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // First try URL param
    const params = new URLSearchParams(window.location.search);
    const fromURL = params.get("shopifyUser");

    // Then fallback to localStorage
    const fromStorage = localStorage.getItem("shopifyUser");

    if (fromURL === "true" || fromStorage === "true") {
      setShopifyInstalled(true);
    }

    setLoading(false);
  }, []);

  return { shopifyInstalled, loading };
}
