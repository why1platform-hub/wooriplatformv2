/**
 * Push a notification to a specific user's notification list.
 * Stored in localStorage per user email.
 */

// Push to user-side notifications
export const pushUserNotification = (userEmail, text, path) => {
  if (!userEmail) return;
  const key = `woori_notifs_${userEmail}`;
  try {
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.unshift({
      id: `n-${Date.now()}`,
      text,
      time: '방금 전',
      path,
    });
    // Keep max 20
    localStorage.setItem(key, JSON.stringify(existing.slice(0, 20)));
  } catch { /* ignore */ }
};

// Push to admin-side notifications
export const pushAdminNotification = (adminEmail, text, path) => {
  if (!adminEmail) return;
  const key = `woori_admin_notifs_${adminEmail}`;
  try {
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.unshift({
      id: `an-${Date.now()}`,
      text,
      time: '방금 전',
      path,
    });
    localStorage.setItem(key, JSON.stringify(existing.slice(0, 20)));
  } catch { /* ignore */ }
};

// Push notification to all admin/consultant accounts
export const pushToAllAdmins = (text, path) => {
  // Known admin/consultant emails
  const adminEmails = ['admin@woori.com', 'parkjy@woori.com', 'leemh@woori.com', 'kimjh@woori.com'];
  adminEmails.forEach((email) => pushAdminNotification(email, text, path));
};
