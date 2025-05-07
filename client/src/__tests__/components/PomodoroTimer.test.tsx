import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import PomodoroTimer from '../../components/PomodoroTimer';
import { configureStore } from '@reduxjs/toolkit';
import pomodoroReducer from '../../store/slices/pomodoroSlice';
import tasksReducer from '../../store/slices/tasksSlice';

// Mock do timer global
jest.useFakeTimers();

// Mock para o queryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Mock para store do Redux com estado inicial
const createMockStore = (initialState = {}) => configureStore({
  reducer: {
    pomodoro: pomodoroReducer,
    tasks: tasksReducer,
  },
  preloadedState: initialState
});

// Mock para tarefas
const mockTasks = [
  {
    id: 1,
    title: 'Tarefa 1',
    description: 'Descrição da tarefa 1',
    dueDate: new Date('2025-05-15'),
    priority: 'high',
    completed: false,
    courseId: 1,
    userId: 1,
    createdAt: new Date('2025-05-01')
  },
  {
    id: 2,
    title: 'Tarefa 2',
    description: 'Descrição da tarefa 2',
    dueDate: new Date('2025-05-20'),
    priority: 'medium',
    completed: false,
    courseId: 1,
    userId: 1,
    createdAt: new Date('2025-05-02')
  }
];

// Wrapper para testes
const TestWrapper: React.FC<{ store?: any; children: React.ReactNode }> = ({ 
  store = createMockStore(), 
  children 
}) => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  </Provider>
);

describe('PomodoroTimer Component', () => {
  test('renderiza o componente timer com tempo inicial padrão', () => {
    render(
      <TestWrapper>
        <PomodoroTimer tasks={mockTasks} />
      </TestWrapper>
    );
    
    // Verifica se o temporizador está exibindo o tempo inicial padrão (25:00)
    expect(screen.getByText('25:00')).toBeInTheDocument();
    
    // Verifica se os botões de controle estão presentes
    expect(screen.getByText(/iniciar/i)).toBeInTheDocument();
    expect(screen.getByText(/pomodoro/i)).toBeInTheDocument();
    expect(screen.getByText(/pausa curta/i)).toBeInTheDocument();
    expect(screen.getByText(/pausa longa/i)).toBeInTheDocument();
  });
  
  test('inicia o timer quando o botão iniciar é clicado', () => {
    render(
      <TestWrapper>
        <PomodoroTimer tasks={mockTasks} />
      </TestWrapper>
    );
    
    // Encontra e clica no botão iniciar
    const startButton = screen.getByText(/iniciar/i);
    fireEvent.click(startButton);
    
    // Avança o tempo em 1 segundo
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Verifica se o temporizador foi atualizado
    expect(screen.getByText('24:59')).toBeInTheDocument();
    
    // Verifica se o botão agora é "Pausar"
    expect(screen.getByText(/pausar/i)).toBeInTheDocument();
  });
  
  test('pausa o timer quando o botão pausar é clicado', () => {
    render(
      <TestWrapper>
        <PomodoroTimer tasks={mockTasks} />
      </TestWrapper>
    );
    
    // Inicia o timer
    const startButton = screen.getByText(/iniciar/i);
    fireEvent.click(startButton);
    
    // Avança o tempo em 1 segundo
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Verifica a atualização do temporizador
    expect(screen.getByText('24:59')).toBeInTheDocument();
    
    // Pausa o timer
    const pauseButton = screen.getByText(/pausar/i);
    fireEvent.click(pauseButton);
    
    // Avança mais 1 segundo
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // O tempo não deve ter mudado
    expect(screen.getByText('24:59')).toBeInTheDocument();
    
    // Verifica se o botão agora é "Retomar"
    expect(screen.getByText(/retomar/i)).toBeInTheDocument();
  });
  
  test('muda o modo do timer quando clica nos botões de modo', () => {
    render(
      <TestWrapper>
        <PomodoroTimer tasks={mockTasks} />
      </TestWrapper>
    );
    
    // Verifica estado inicial (modo Pomodoro)
    expect(screen.getByText('25:00')).toBeInTheDocument();
    
    // Clica no botão de pausa curta
    const shortBreakButton = screen.getByText(/pausa curta/i);
    fireEvent.click(shortBreakButton);
    
    // Verifica se mudou para 5:00 (pausa curta)
    expect(screen.getByText('05:00')).toBeInTheDocument();
    
    // Clica no botão de pausa longa
    const longBreakButton = screen.getByText(/pausa longa/i);
    fireEvent.click(longBreakButton);
    
    // Verifica se mudou para 15:00 (pausa longa)
    expect(screen.getByText('15:00')).toBeInTheDocument();
    
    // Volta para o modo Pomodoro
    const pomodoroButton = screen.getByText(/pomodoro/i);
    fireEvent.click(pomodoroButton);
    
    // Verifica se voltou para 25:00
    expect(screen.getByText('25:00')).toBeInTheDocument();
  });
  
  test('exibe a lista de tarefas disponíveis para selecionar', () => {
    render(
      <TestWrapper>
        <PomodoroTimer tasks={mockTasks} />
      </TestWrapper>
    );
    
    // Verifica se o seletor de tarefas está presente
    expect(screen.getByText(/selecionar tarefa/i)).toBeInTheDocument();
    
    // Abre o seletor
    const taskSelector = screen.getByRole('combobox');
    fireEvent.click(taskSelector);
    
    // Verifica se as tarefas estão listadas
    expect(screen.getByText('Tarefa 1')).toBeInTheDocument();
    expect(screen.getByText('Tarefa 2')).toBeInTheDocument();
  });
  
  test('renderiza corretamente em modo minimal', () => {
    render(
      <TestWrapper>
        <PomodoroTimer tasks={mockTasks} minimal={true} />
      </TestWrapper>
    );
    
    // Verifica se o temporizador está presente
    expect(screen.getByText('25:00')).toBeInTheDocument();
    
    // Verifica se os botões de controle estão presentes, mas mais compactos
    expect(screen.getByText(/iniciar/i)).toBeInTheDocument();
    
    // No modo minimal, a aparência deve ser diferente
    // Podemos verificar classes específicas ou a ausência de certos elementos
    // Por exemplo, verificar se o seletor de tarefas não está visível
    expect(screen.queryByText(/selecionar tarefa/i)).not.toBeInTheDocument();
  });
});