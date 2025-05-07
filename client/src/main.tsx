import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import App from "./App";
import "./index.css";
import { register as registerServiceWorker } from "./serviceWorkerRegistration";
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
if (import.meta.env.PROD) {
  registerServiceWorker({
    onSuccess: () => console.log("Service Worker registrado com sucesso!"),
    onUpdate: (registration) => {
      const waitingServiceWorker = registration.waiting;
      if (waitingServiceWorker) {
        waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
        waitingServiceWorker.addEventListener("statechange", (event) => {
          if ((event.target as ServiceWorker).state === "activated") {
            window.location.reload();
          }
        });
      }
    },
  });
}
