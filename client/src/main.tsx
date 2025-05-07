import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import App from "./App";
import "./index.css";
import { queryClient } from "./lib/queryClient";
import { store } from "./store";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </Provider>
);

// Registra o service worker apenas em produção
if (process.env.NODE_ENV === 'production' || import.meta.env.PROD) {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registrado com sucesso:', registration.scope);
          
          // Verifica atualizações
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('Nova versão disponível! Recarregue para atualizar.');
                  
                  // Opcional: Notificar o usuário sobre a atualização
                  if (window.confirm('Nova versão disponível. Deseja atualizar agora?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch(error => {
          console.error('Erro ao registrar Service Worker:', error);
        });
      
      // Lidar com mudanças de service worker
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker atualizado, recarregando página...');
        window.location.reload();
      });
    });
  }
}
