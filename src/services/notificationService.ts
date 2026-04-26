export const requestNotificationPermission = async () => {
  console.log('Notification: Requesting permission...');
  if (!('Notification' in window)) {
    console.warn('Notification: This browser does not support desktop notification');
    return false;
  }

  if (Notification.permission === 'granted') {
    console.log('Notification: Permission already granted');
    return true;
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('Notification: Permission result:', permission);
    return permission === 'granted';
  } catch (error) {
    console.error('Notification: Error requesting permission:', error);
    return false;
  }
};

export const showLocalNotification = (title: string, body: string) => {
  console.log('Notification: Attempting to show:', { title, body });
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      const n = new Notification(title, {
        body,
        icon: '/favicon.ico', // Standard vite favicon
        badge: '/favicon.ico',
      });
      n.onclick = () => {
        window.focus();
        n.close();
      };
      console.log('Notification: Sent successfully');
    } catch (error) {
      console.error('Notification: Failed to create notification object:', error);
      // Fallback for some browsers that require service workers for persistent notifications
      // or just stay with basic Notification for now.
    }
  } else {
    console.warn('Notification: Cannot show, permission is:', Notification.permission);
  }
};

export const testNotification = () => {
  showLocalNotification('Study Reminder', "It's time for your scheduled retrieval session!");
};
