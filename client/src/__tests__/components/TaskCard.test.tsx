import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import TaskCard from '../../components/TaskCard';
import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from '../../store/slices/tasksSlice';

// Mock para o queryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Mock para store do Redux
const mockStore = configureStore({
  reducer: {
    tasks: tasksReducer,
  },
});

// Mock para tarefas
const mockTask = {
  id: 1,
  title: 'Completar lição de casa',
  description: 'Capítulo 5 - Exercícios 1-10',
  dueDate: new Date('2025-05-15'),
  priority: 'high',
  completed: false,
  courseId: 1,
  userId: 1,
  createdAt: new Date('2025-05-01')
};

// Mock para cursos
const mockCourses = [
  {
    id: 1,
    name: 'Matemática',
    code: 'MAT101',
    color: '#FF5733',
    userId: 1
  }
];

// Wrapper para testes
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Provider store={mockStore}>
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  </Provider>
);

describe('TaskCard Component', () => {
  test('renderiza corretamente com informações da tarefa', () => {
    render(
      <TestWrapper>
        <TaskCard task={mockTask} courses={mockCourses} />
      </TestWrapper>
    );
    
    // Verifica se o título é exibido
    expect(screen.getByText('Completar lição de casa')).toBeInTheDocument();
    
    // Verifica se a descrição é exibida
    expect(screen.getByText('Capítulo 5 - Exercícios 1-10')).toBeInTheDocument();
    
    // Verifica se a data de vencimento é exibida (formatada)
    expect(screen.getByText(/15\/05\/2025/)).toBeInTheDocument();
    
    // Verifica se o nome do curso é exibido
    expect(screen.getByText('Matemática')).toBeInTheDocument();
    
    // Verifica se o indicador de prioridade alta é exibido
    const priorityIndicator = screen.getByText(/Alta/i);
    expect(priorityIndicator).toBeInTheDocument();
    expect(priorityIndicator).toHaveClass('bg-red-500');
  });
  
  test('altera o estado de conclusão quando o checkbox é clicado', () => {
    render(
      <TestWrapper>
        <TaskCard task={mockTask} courses={mockCourses} />
      </TestWrapper>
    );
    
    // Encontra o checkbox (pode ser por role ou por testid)
    const checkbox = screen.getByRole('checkbox');
    
    // Verifica o estado inicial
    expect(checkbox).not.toBeChecked();
    
    // Clica no checkbox
    fireEvent.click(checkbox);
    
    // Verifica se o estado mudou
    // Nota: Como estamos usando um store Redux, precisaríamos verificar se a ação foi disparada
    // ou usar um spy. Aqui estamos apenas verificando a interação com o checkbox.
    expect(checkbox).toBeChecked();
  });
  
  test('abre o modal de edição quando o botão de editar é clicado', () => {
    render(
      <TestWrapper>
        <TaskCard task={mockTask} courses={mockCourses} />
      </TestWrapper>
    );
    
    // Encontra o botão de editar
    const editButton = screen.getByLabelText(/editar tarefa/i);
    
    // Clica no botão de editar
    fireEvent.click(editButton);
    
    // Verifica se o modal foi aberto (o modal seria renderizado pelo Dialog)
    // Este é um exemplo para ilustrar o teste - na implementação real, seria necessário
    // verificar o estado do modal ou a presença de elementos específicos do modal
    expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
  });
});