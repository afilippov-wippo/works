/* es6 */

'use strict';

const applicationServerPublicKey = 'BG90pN0S36xTePn2uAM-zSZrGdoBZdhKk4twktb0jdc1beGEoI15Nn_Gf8K5NW_Lw3yOLQ4-j177pOATq0rtEUs';

const pushButton = document.querySelector('.js-push-btn');

let isSubscribed = false;
let swRegistration = null;

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

if ('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('service worker and push is supported');

  navigator.serviceWorker.register('sw.js')
      .then(function(swReg) {
        console.log('service worker is registered', swReg);

        swRegistration = swReg;
        initializeUI();
      })
      .catch(function(error) {
        console.error('service worker error', error);
      });
} else {
  console.warn('push messaging is not supported');
  pushButton.textContent = 'push not supported';
}

function initializeUI() {
  pushButton.addEventListener('click', function() {
      pushButton.disabled = true;
      if (isSubscribed) {
          unsubscribeUser();
      } else {
          subscribeUser();
      }
  });

  // Set the initial subscription value
  swRegistration.pushManager.getSubscription()
      .then(function(subscription) {
        isSubscribed = !(subscription === null);

        updateSubscriptionOnServer(subscription);

        if (isSubscribed) {
          console.log('user is subscribed.');
        } else {
          console.log('user is not subscribed.');
        }

        updateBtn();
      });
}

function updateBtn() {
  if (Notification.permission === 'denied') {
    pushButton.textContent = 'push messaging blocked.';
    pushButton.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }

  if (isSubscribed) {
    pushButton.textContent = 'disable push messaging';
  } else {
    pushButton.textContent = 'enable push messaging';
  }

  pushButton.disabled = false;
}

function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
      .then(function(subscription) {
        console.log('user is subscribed.');

        updateSubscriptionOnServer(subscription);

        isSubscribed = true;

        updateBtn();
      })
      .catch(function(err) {
        console.log('failed to subscribe the user: ', err);
        updateBtn();
      });
}

function updateSubscriptionOnServer(subscription) {

    // send subscription to application server

    const subscriptionJson = document.querySelector('.js-subscription-json');
    const subscriptionDetails =
      document.querySelector('.js-subscription-details');

    if (subscription) {
        subscriptionJson.textContent = JSON.stringify(subscription);
        subscriptionDetails.classList.remove('is-invisible');
    } else {
        subscriptionDetails.classList.add('is-invisible');
    }
}

function unsubscribeUser() {
    swRegistration.pushManager.getSubscription()
        .then(function(subscription) {
            if (subscription) {
                return subscription.unsubscribe();
            }
        })
        .catch(function(error) {
            console.log('error unsubscribing', error);
        })
        .then(function() {
            updateSubscriptionOnServer(null);

            console.log('user is unsubscribed.');
            isSubscribed = false;

            updateBtn();
        });
}
