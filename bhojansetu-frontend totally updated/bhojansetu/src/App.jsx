import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DemoModeProvider } from './context/DemoModeContext';
import { ThemeProvider } from './context/ThemeContext';
import { HealthProvider } from './context/HealthContext';
import RequireRole from './components/RequireRole';

import Login from './pages/Login';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import PostFood from './pages/provider/PostFood';
import AvailableFood from './pages/ngo/AvailableFood';
import MyClaims from './pages/ngo/MyClaims';
import Assignments from './pages/volunteer/Assignments';
import DashboardImpact from './pages/DashboardImpact';

export default function App() {
  return (
    <ThemeProvider>
      <DemoModeProvider>
        <HealthProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Login />} />

                <Route
                  path="/provider"
                  element={
                    <RequireRole role="provider">
                      <ProviderDashboard />
                    </RequireRole>
                  }
                />
                <Route
                  path="/provider/post"
                  element={
                    <RequireRole role="provider">
                      <PostFood />
                    </RequireRole>
                  }
                />

                <Route
                  path="/ngo"
                  element={
                    <RequireRole role="ngo">
                      <AvailableFood />
                    </RequireRole>
                  }
                />
                <Route
                  path="/ngo/claims"
                  element={
                    <RequireRole role="ngo">
                      <MyClaims />
                    </RequireRole>
                  }
                />

                <Route
                  path="/volunteer"
                  element={
                    <RequireRole role="volunteer">
                      <Assignments />
                    </RequireRole>
                  }
                />

                <Route
                  path="/impact"
                  element={
                    <RequireRole>
                      <DashboardImpact />
                    </RequireRole>
                  }
                />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </HealthProvider>
      </DemoModeProvider>
    </ThemeProvider>
  );
}
