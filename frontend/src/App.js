import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import AuthCallback from "@/components/AuthCallback";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppShell from "@/components/AppShell";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/user/Dashboard";
import Onboarding from "@/pages/user/Onboarding";
import BluetoothSync from "@/pages/user/BluetoothSync";
import Wallet from "@/pages/user/Wallet";
import Contacts from "@/pages/user/Contacts";
import StartJourney from "@/pages/user/StartJourney";
import LiveJourney from "@/pages/user/LiveJourney";
import Claim from "@/pages/user/Claim";
import DealerDashboard from "@/pages/dealer/DealerDashboard";

function AppRouter() {
  const location = useLocation();
  if (location.hash?.includes("session_id=")) return <AuthCallback />;

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute role="user">
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="onboarding" element={<Onboarding />} />
        <Route path="bluetooth" element={<BluetoothSync />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="journey/new" element={<StartJourney />} />
        <Route path="journey/live" element={<LiveJourney />} />
        <Route path="claim" element={<Claim />} />
      </Route>
      <Route
        path="/dealer"
        element={
          <ProtectedRoute role="dealer">
            <DealerDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
          <Toaster position="top-center" richColors theme="dark" />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
