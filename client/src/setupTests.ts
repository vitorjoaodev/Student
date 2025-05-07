// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';

// Estende os matchers do Jest com matchers de acessibilidade
expect.extend(toHaveNoViolations);

// Suprime logs de erros do console durante os testes
beforeAll(() => {
  // Armazena as implementações originais
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  // Mock das funções para reduzir ruído durante os testes
  console.error = (...args: any[]) => {
    if (args[0].includes('Warning: ReactDOM.render')) return;
    originalConsoleError(...args);
  };
  
  console.warn = (...args: any[]) => {
    if (args[0].includes('Warning: ReactDOM.render')) return;
    originalConsoleWarn(...args);
  };
});