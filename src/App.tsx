import React from 'react';
import { createRoot } from 'react-dom/client';
import { Routes, Route } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomePage from './components/home/HomePage';
import FlowBuilder from './components/flow/FlowBuilder';
import ToolsPage from './components/tools/ToolsPage';
import { PluginStore } from './components/store/PluginStore';
import DashboardPage from './components/dashboard/DashboardPage';
import { Toaster } from './components/ui/toaster';
import './styles/globals.css';

interface PlaceholderPageProps {
  title: string;
}

// Placeholder component for routes under development
const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => (
  <div className="flex flex-col gap-4">
    <h1 className="text-4xl font-bold text-foreground/90">{title}</h1>
    <p className="text-foreground/70">
      This feature is under development. Stay tuned for updates!
    </p>
  </div>
);

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="store" element={<PluginStore />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="workflows" element={<FlowBuilder />} />
        <Route path="tools" element={<ToolsPage />} />
        <Route path="skills" element={<PlaceholderPage title="Skills" />} />
        <Route path="functions" element={<PlaceholderPage title="Functions" />} />
        <Route path="datastores" element={<PlaceholderPage title="Data Stores" />} />
        <Route path="knowledge-bases" element={<PlaceholderPage title="Knowledge Bases" />} />
        <Route path="frameworks" element={<PlaceholderPage title="LLM Frameworks" />} />
        <Route path="models" element={<PlaceholderPage title="Models" />} />
        <Route path="settings" element={<PlaceholderPage title="Settings" />} />
      </Route>
    </Routes>
    <Toaster />
  </BrowserRouter>
);

// Initialize the app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} 