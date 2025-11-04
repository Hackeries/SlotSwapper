import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      const newSocket = io(WS_URL, {
        auth: {
          token
        }
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      newSocket.on('swap_request_received', (data) => {
        toast.info('You have a new swap request!', {
          autoClose: 5000
        });
        // Trigger a refresh or update
        window.dispatchEvent(new CustomEvent('swap_request_received', { detail: data }));
      });

      newSocket.on('swap_request_accepted', (data) => {
        toast.success('Your swap request was accepted!', {
          autoClose: 5000
        });
        window.dispatchEvent(new CustomEvent('swap_request_accepted', { detail: data }));
      });

      newSocket.on('swap_request_rejected', (data) => {
        toast.warning('Your swap request was rejected', {
          autoClose: 5000
        });
        window.dispatchEvent(new CustomEvent('swap_request_rejected', { detail: data }));
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
