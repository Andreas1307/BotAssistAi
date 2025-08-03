import { useEffect, useState } from "react";

export function useShopifyInstalled() {
  const [shopifyInstalled, setShopifyInstalled] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shopifyUser = params.get("shopifyUser");

    if (shopifyUser === "true") {
      setShopifyInstalled(true);
    }
  }, []);

  return shopifyInstalled;
}
