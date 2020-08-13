/* sw = service worker, es6 */

'use strict';

self.addEventListener('push', function(event) {
    console.log('service worker: push Received.');
    console.log(`service worker: push had this data: "${event.data.text()}"`);

    const title = 'New Ticked Opened';
    const options = {
        body: "John posted a new ticket",
        icon: "images/icon.png",
        vibrate: [200, 100, 200, 100, 200, 100, 400],
        badge: "images/badge.png"
    };

    const notificationPromise = self.registration.showNotification(title, options);
    event.waitUntil(notificationPromise);
});

self.addEventListener('notificationclick', function(event) {
    console.log('notification click received.');

    event.notification.close();

    event.waitUntil(
        clients.openWindow('https://wippo.md')
    );
});
