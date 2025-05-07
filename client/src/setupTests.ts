// jest-dom adiciona matchers personalizados do jest para afirmações em nós DOM.
// permite fazer coisas como:
// expect(element).toHaveTextContent(/react/i)
// saiba mais: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Configuração global de mock para IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock para matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // obsoleto
    removeListener: jest.fn(), // obsoleto
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock para localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  
  return {
    getItem: function(key: string) {
      return store[key] || null;
    },
    setItem: function(key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem: function(key: string) {
      delete store[key];
    },
    clear: function() {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Suprimir erros de console durante testes
const originalConsoleError = console.error;
console.error = (...args) => {
  // Filtra erros conhecidos dos testes
  if (
    args[0].includes('Warning: ReactDOM.render is no longer supported') ||
    args[0].includes('Warning: useLayoutEffect does nothing on the server')
  ) {
    return;
  }
  originalConsoleError(...args);
};