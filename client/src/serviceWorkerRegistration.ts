// Este código registra o service worker para funcionalidade offline.
// Será executado apenas em produção.

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
};

export function register(config?: Config): void {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // O URL construtor está disponível em todos os navegadores que suportam SW
    const publicUrl = new URL(import.meta.env.BASE_URL, window.location.href);
    
    // O service worker não funcionará se PUBLIC_URL estiver em uma origem diferente
    // da página. Isso pode acontecer se um CDN for usado para servir assets.
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${import.meta.env.BASE_URL}service-worker.js`;

      if (isLocalhost) {
        // Isso está rodando no localhost. Vamos verificar se o service worker ainda existe.
        checkValidServiceWorker(swUrl, config);

        // Adiciona logs adicionais no localhost
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service worker. To learn more, visit https://cra.link/PWA'
          );
        });
      } else {
        // Não é localhost. Apenas registra o service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl: string, config?: Config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // Neste ponto, o conteúdo pré-cacheado foi buscado,
              // mas o service worker anterior ainda servirá o conteúdo antigo
              // até que todas as abas cliente sejam fechadas.
              console.log(
                'New content is available and will be used when all tabs for this page are closed.'
              );

              // Executa callback
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // Neste ponto, tudo foi pré-cacheado.
              console.log('Content is cached for offline use.');

              // Executa callback
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl: string, config?: Config) {
  // Verifica se o service worker pode ser encontrado. Se não puder, recarrega a página.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // Garante que o service worker existe e que estamos realmente recebendo um arquivo JS.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // Nenhum service worker encontrado. Provavelmente uma diferente aplicação. Recarrega a página.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker encontrado. Procede normalmente.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

// Função para verificar e solicitar permissão para notificações push
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('Este navegador não suporta notificações');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// Função para registrar para notificações push
export async function subscribeToPushNotifications(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Verifica se o navegador suporta pushManager
    if (!registration.pushManager) {
      console.log('Push notifications não são suportadas por este navegador');
      return false;
    }

    // Gera chaves públicas VAPID no servidor - simplificado para este exemplo
    // Em um app real, você geraria isso no backend
    const publicVapidKey = 'BLBx-hf5H9mLWR9zQIX3ZCBQbN_Udso78JQ0_XgkOgR7KZ-X05jtwgGLvh6JKg-j5TlGxwHxnWNfBh2bqYPgBXc';
    
    // Converte a chave string para Uint8Array
    const appServerKey = urlBase64ToUint8Array(publicVapidKey);
    
    // Registra o endpoint de push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: appServerKey,
    });
    
    // Aqui você enviaria a subscription para o servidor
    // await fetch('/api/subscribe', {
    //   method: 'POST',
    //   body: JSON.stringify(subscription),
    //   headers: { 'Content-Type': 'application/json' }
    // });
    
    return true;
  } catch (error) {
    console.error('Erro ao se inscrever para notificações push:', error);
    return false;
  }
}

// Função auxiliar para converter base64 em Uint8Array para chaves VAPID
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}