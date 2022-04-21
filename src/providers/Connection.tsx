import React from 'react';

export const ConnectionContext = React.createContext('0.0.0');

interface IConnectionProps {
  children: React.ReactNode;
}

export const ConnectionProvider = ({ children }: IConnectionProps) => {
  return <ConnectionContext.Provider value={'0.0.0'}>{children}</ConnectionContext.Provider>;
};
