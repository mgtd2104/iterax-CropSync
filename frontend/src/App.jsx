import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import DiseaseDetection from "./pages/DiseaseDetection";
import DocumentsVault from "./pages/DocumentsVault";

export default function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/disease-detection" element={<DiseaseDetection />} />
          <Route path="/documents" element={<DocumentsVault />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}
