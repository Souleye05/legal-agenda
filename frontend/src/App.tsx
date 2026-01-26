import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Index from "./pages/Index";
import Cases from "./pages/Cases";
import CaseDetail from "./pages/CaseDetail";
import NewCase from "./pages/NewCase";
import Agenda from "./pages/Agenda";
import NewHearing from "./pages/NewHearing";
import HearingDetail from "./pages/HearingDetail";
import EditHearing from "./pages/EditHearing";
import RecordHearingResult from "./pages/RecordHearingResult";
import EditCase from "./pages/EditCase";
import UnreportedHearings from "./pages/UnreportedHearings";
import TomorrowHearings from "./pages/TomorrowHearings";
import EnrollementReminders from "./pages/EnrollementReminders";
import AppealReminders from "./pages/AppealReminders";
import DailyReports from "./pages/DailyReports";
import Profile from "./pages/Profile";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/affaires"
              element={
                <ProtectedRoute>
                  <Cases />
                </ProtectedRoute>
              }
            />
            <Route
              path="/affaires/nouvelle"
              element={
                <ProtectedRoute>
                  <NewCase />
                </ProtectedRoute>
              }
            />
            <Route
              path="/affaires/:id"
              element={
                <ProtectedRoute>
                  <CaseDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/affaires/:id/modifier"
              element={
                <ProtectedRoute>
                  <EditCase />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agenda"
              element={
                <ProtectedRoute>
                  <Agenda />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agenda/nouvelle-audience"
              element={
                <ProtectedRoute>
                  <NewHearing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audiences/:id"
              element={
                <ProtectedRoute>
                  <HearingDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audiences/:id/modifier"
              element={
                <ProtectedRoute>
                  <EditHearing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audiences/:id/renseigner"
              element={
                <ProtectedRoute>
                  <RecordHearingResult />
                </ProtectedRoute>
              }
            />
            <Route
              path="/a-renseigner"
              element={
                <ProtectedRoute>
                  <UnreportedHearings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/demain"
              element={
                <ProtectedRoute>
                  <TomorrowHearings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rappels-enrolement"
              element={
                <ProtectedRoute>
                  <EnrollementReminders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recours"
              element={
                <ProtectedRoute>
                  <AppealReminders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/comptes-rendus"
              element={
                <ProtectedRoute>
                  <DailyReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profil"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/utilisateurs"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
