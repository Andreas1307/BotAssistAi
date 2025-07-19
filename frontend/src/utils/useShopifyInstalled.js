import { useEffect, useState } from "react";

export function useShopifyInstalled() {
  const [shopifyInstalled, setShopifyInstalled] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const host = params.get("host");

    if (host) {
      setShopifyInstalled(true);
      console.log("hello hello")
    }
  }, []);
  console.log("hello")
  return shopifyInstalled;
}
