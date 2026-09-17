import { createContext, useContext, useEffect, useState } from 'react';

// BhojanSetu always talks to the real FastAPI backend by default. Demo mode
// is an explicit, visible opt-in for running the UI when the backend isn't
// reachable (e.g. showing the app without the API up). It is never turned on
// silently — screens that use mock data always render the "Demo data" banner
// from <DemoBanner />, so nobody mistakes fixture data for a live backend
// response.

const DemoModeContext = createContext(null);
const KEY = 'bhojansetu:demoMode';

export function DemoModeProvider({ children }) {
  const [demoMode, setDemoMode] = useState(() => localStorage.getItem(KEY) === '1');

  useEffect(() => {
    localStorage.setItem(KEY, demoMode ? '1' : '0');
  }, [demoMode]);

  return (
    <DemoModeContext.Provider value={{ demoMode, setDemoMode }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const ctx = useContext(DemoModeContext);
  if (!ctx) throw new Error('useDemoMode must be used within DemoModeProvider');
  return ctx;
}
