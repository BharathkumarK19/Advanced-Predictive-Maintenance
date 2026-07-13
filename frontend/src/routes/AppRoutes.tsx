import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { DashboardPage } from "../pages/Dashboard/DashboardPage";
import { PredictionPage } from "../pages/Prediction/PredictionPage";
import { HistoryPage } from "../pages/History/HistoryPage";
import { MonitoringPage } from "../pages/Monitoring/MonitoringPage";
import { SystemPage } from "../pages/System/SystemPage";
import { SettingsPage } from "../pages/Settings/SettingsPage";

export const AppRoutes = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/prediction" element={<PredictionPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/monitoring" element={<MonitoringPage />} />
      <Route path="/system" element={<SystemPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
);

