import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Intro } from './components/Intro';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { PublicProfile } from './components/PublicProfile';

const App: React.FC = () => {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            !introComplete ? (
              <Intro onComplete={() => setIntroComplete(true)} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/u/:username" element={<PublicProfile />} />
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;