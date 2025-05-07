/**
 * Teste básico para verificar se o ambiente Jest está funcionando
 */

describe('Ambiente de Testes', () => {
  test('soma corretamente dois números', () => {
    expect(1 + 1).toBe(2);
  });

  test('strings são comparadas corretamente', () => {
    expect('hello').toBe('hello');
    expect('hello').not.toBe('world');
  });

  test('arrays são comparados corretamente', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [1, 2, 3];
    const arr3 = [3, 2, 1];
    
    expect(arr1).toEqual(arr2);
    expect(arr1).not.toEqual(arr3);
  });
});