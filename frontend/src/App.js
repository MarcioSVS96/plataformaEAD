import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import RoutesApp from './routes/RoutesApp';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <RoutesApp />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
