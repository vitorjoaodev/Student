// Este é o arquivo de Service Worker que será registrado no navegador
// para habilitar funcionalidades offline e PWA

// Importa bibliotecas do Workbox
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

// Mensagem para confirmar que o service worker está funcionando
console.log('Service Worker Iniciado com Workbox!');

// Configura o Workbox
workbox.setConfig({
  debug: false // Desabilita logs de debug em produção
});

// Use o modo de escopo correto
workbox.core.setCacheNameDetails({
  prefix: 'estudos-manager',
  suffix: 'v1',
  precache: 'precache',
  runtime: 'runtime'
});

// Pré-cache para arquivos essenciais
workbox.precaching.precacheAndRoute([
  { url: '/', revision: '1' },
  { url: '/index.html', revision: '1' },
  { url: '/manifest.json', revision: '1' }
]);

// Cache para arquivos estáticos (JS, CSS)
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
      }),
    ],
  })
);

// Cache para imagens
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
      }),
    ],
  })
);

// Cache para fontes
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'font',
  new workbox.strategies.CacheFirst({
    cacheName: 'fonts-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 24 * 60 * 60, // 60 dias
      }),
    ],
  })
);

// Cache para API com estratégia Network First
workbox.routing.registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new workbox.strategies.NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 dias
      }),
    ],
  })
);

// Navegação para rotas SPA
workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.NetworkFirst({
    cacheName: 'navigation',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 2 * 24 * 60 * 60, // 2 dias
      }),
    ],
  })
);

// Evento de instalação
self.addEventListener('install', event => {
  console.log('Service Worker instalado com sucesso!');
  self.skipWaiting(); // Permite que o novo service worker assuma o controle imediatamente
});

// Evento de ativação - limpa caches antigos
self.addEventListener('activate', event => {
  console.log('Service Worker ativado com sucesso!');
  
  // Limpa caches antigos
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName.startsWith('estudos-manager'))
          .filter(cacheName => !cacheName.endsWith('v1'))
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
  
  // Permite que o service worker tome controle de clientes não controlados
  self.clients.claim();
});

// Evento para sincronização em segundo plano
self.addEventListener('sync', event => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks());
  }
});

// Função para sincronizar tarefas quando voltar online
async function syncTasks() {
  try {
    // Recupera tarefas offline do IndexedDB
    const dbPromise = await self.indexedDB.open('offline-tasks-store', 1);
    const db = dbPromise.result;
    
    if (db.objectStoreNames.contains('tasks')) {
      const tx = db.transaction('tasks', 'readonly');
      const store = tx.objectStore('tasks');
      const tasks = await store.getAll();
      
      // Envia as tarefas para o servidor
      if (tasks && tasks.length > 0) {
        for (const task of tasks) {
          await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
          });
        }
        
        // Limpa o armazenamento offline após sincronização
        const deleteTx = db.transaction('tasks', 'readwrite');
        const deleteStore = deleteTx.objectStore('tasks');
        await deleteStore.clear();
      }
    }
  } catch (error) {
    console.error('Erro ao sincronizar tarefas:', error);
  }
}

// Evento para lidar com notificações push
self.addEventListener('push', event => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const options = {
      body: data.message || 'Nova notificação do Estudos Manager',
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
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(windowClients => {
      const url = event.notification.data?.url || '/';
      
      // Verificar se já existe uma janela aberta e focá-la
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Caso contrário, abrir uma nova janela
      return self.clients.openWindow(url);
    })
  );
});