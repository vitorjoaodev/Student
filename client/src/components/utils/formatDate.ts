/**
 * Formata uma data para o formato dd/mm/yyyy
 * @param date A data a ser formatada
 * @returns A data formatada como string
 */
export function formatDate(date: Date | null | undefined): string {
  if (!date) return 'N/A';
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Formata uma data para o formato dd de mês por extenso
 * @param date A data a ser formatada 
 * @returns A data formatada como string
 */
export function formatDateLong(date: Date | null | undefined): string {
  if (!date) return 'Data não disponível';
  
  const day = date.getDate();
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} de ${month} de ${year}`;
}

/**
 * Verifica se uma data já passou
 * @param date A data a ser verificada
 * @returns true se a data já passou, false caso contrário
 */
export function isPastDate(date: Date | null | undefined): boolean {
  if (!date) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Cria nova data apenas com ano, mês e dia para comparação justa
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  
  return compareDate < today;
}

/**
 * Calcula a diferença em dias entre duas datas
 * @param date1 A primeira data
 * @param date2 A segunda data (padrão: data atual)
 * @returns O número de dias entre as datas
 */
export function daysBetween(date1: Date | null | undefined, date2: Date = new Date()): number {
  if (!date1) return 0;
  
  const oneDay = 24 * 60 * 60 * 1000; // milissegundos em um dia
  
  // Cria novas datas apenas com ano, mês e dia para comparação justa
  const firstDate = new Date(date1);
  firstDate.setHours(0, 0, 0, 0);
  
  const secondDate = new Date(date2);
  secondDate.setHours(0, 0, 0, 0);
  
  // Calcula a diferença e converte para dias
  return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay));
}