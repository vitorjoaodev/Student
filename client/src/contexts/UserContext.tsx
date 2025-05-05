import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: false,
  error: null
});

export const useUser = () => useContext(UserContext);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  // Fetch user data
  const { data, isLoading, error } = useQuery<User>({
    queryKey: ["/api/user"],
    retry: 1,
    onSuccess: (data) => {
      setUser(data);
    },
    onError: () => {
      setUser(null);
    }
  });

  // Update user when data changes
  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data]);

  return (
    <UserContext.Provider value={{ user, isLoading, error: error as Error | null }}>
      {children}
    </UserContext.Provider>
  );
};
