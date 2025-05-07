import { formatDate, formatDateLong, isPastDate, daysBetween } from '../../components/utils/formatDate';

describe('Funções de formatação de data', () => {
  describe('formatDate', () => {
    test('formata data corretamente', () => {
      const date = new Date(2025, 4, 7); // 7 de maio de 2025
      expect(formatDate(date)).toBe('07/05/2025');
    });

    test('retorna N/A para data nula', () => {
      expect(formatDate(null)).toBe('N/A');
    });

    test('retorna N/A para data undefined', () => {
      expect(formatDate(undefined)).toBe('N/A');
    });
  });

  describe('formatDateLong', () => {
    test('formata data no formato longo corretamente', () => {
      const date = new Date(2025, 4, 7); // 7 de maio de 2025
      expect(formatDateLong(date)).toBe('7 de maio de 2025');
    });

    test('retorna mensagem para data nula', () => {
      expect(formatDateLong(null)).toBe('Data não disponível');
    });
  });

  describe('isPastDate', () => {
    test('retorna true para datas passadas', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // ontem
      expect(isPastDate(pastDate)).toBe(true);
    });

    test('retorna false para datas futuras', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1); // amanhã
      expect(isPastDate(futureDate)).toBe(false);
    });

    test('retorna false para datas nulas', () => {
      expect(isPastDate(null)).toBe(false);
    });
  });

  describe('daysBetween', () => {
    test('calcula corretamente a diferença de dias', () => {
      const date1 = new Date(2025, 4, 1); // 1 de maio de 2025
      const date2 = new Date(2025, 4, 5); // 5 de maio de 2025
      expect(daysBetween(date1, date2)).toBe(4);
    });

    test('retorna zero para datas nulas', () => {
      expect(daysBetween(null)).toBe(0);
    });

    test('retorna zero para a mesma data', () => {
      const date = new Date(2025, 4, 7);
      expect(daysBetween(date, date)).toBe(0);
    });
  });
});