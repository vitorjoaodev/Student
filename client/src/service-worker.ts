/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope;

// Utiliza o clientsClaim para que o service worker tenha controle imediato sobre as páginas
clientsClaim();

// Pré-caching dos recursos estáticos gerados pelo processo de build
precacheAndRoute(self.__WB_MANIFEST);

// Configuração para servir o index.html para todas as navegações (SPA)
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  ({ request, url }: { request: Request; url: URL }) => {
    // Se for uma navegação, serve o index.html
    if (request.mode !== 'navigate') {
      return false;
    }
    
    // Se já for uma URL para um arquivo específico (não uma rota SPA), ignora
    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    }
    
    return true;
  },
  createHandlerBoundToURL('/index.html')
);

// Cache de imagens com estratégia Cache First
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
      }),
    ],
  })
);

// Cache para requisições de API com estratégia StaleWhileRevalidate
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 dias
      }),
    ],
  })
);

// Cache para arquivos estáticos (CSS, JS, fontes)
registerRoute(
  ({ request }) => 
    request.destination === 'style' || 
    request.destination === 'script' ||
    request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
      }),
    ],
  })
);

// Evento de instalação - mostrará no console quando o SW for instalado
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado com sucesso!');
});

// Evento de ativação - limpa caches antigos
self.addEventListener('activate', (event) => {
  const currentCaches = [
    'images-cache',
    'api-cache',
    'static-resources',
  ];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!currentCaches.includes(cacheName)) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Evento de sincronização em segundo plano (para ações offline)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks());
  }
});

// Implementação para sincronizar tarefas quando voltar online
async function syncTasks() {
  try {
    const offlineTasksResponse = await fetch('/api/offline-tasks');
    const offlineTasks = await offlineTasksResponse.json();
    
    if (offlineTasks && offlineTasks.length > 0) {
      for (const task of offlineTasks) {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task)
        });
      }
      // Limpar a fila depois de sincronizar
      await fetch('/api/offline-tasks/clear', { method: 'POST' });
    }
  } catch (error) {
    console.error('Erro ao sincronizar tarefas:', error);
  }
}

// Evento para lidar com notificações push
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const options = {
      body: data.message,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Estudos Manager', options)
    );
  } catch (error) {
    console.error('Erro ao processar notificação push:', error);
  }
});

// Evento para lidar com cliques em notificações
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      const url = event.notification.data?.url || '/';
      
      // Verificar se já existe uma janela aberta e focá-la
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Caso contrário, abrir uma nova janela
      return clients.openWindow(url);
    })
  );
});