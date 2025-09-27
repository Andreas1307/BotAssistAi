// utils/logoutConfirm.js
import { showToast } from "./shopifyToast";

export async function handleLogoutConfirm(onConfirm) {
  const confirmed = window.confirm("⚠️ Are you sure you want to log out?");
  if (confirmed) {
    onConfirm();
    showToast("Logged out successfully!");
  } else {
    showToast("Logout cancelled", true);
  }
}
