import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { ProcessingPipeline } from './components/pipeline/ProcessingPipeline';
import { PresentationMode } from './components/presentation/PresentationMode';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { DepthPage } from './pages/DepthPage';
import { HeightPage } from './pages/HeightPage';
import { ReconstructionPage } from './pages/ReconstructionPage';
import { FlythroughPage } from './pages/FlythroughPage';
import { ObjectPage } from './pages/ObjectPage';
import { ExportPage } from './pages/ExportPage';
import { SettingsPage } from './pages/SettingsPage';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  if (activeTab === 'landing') {
    return (
      <div className="flex flex-col min-h-screen bg-[#030712] text-white">
        {/* Simple Landing Navbar */}
        <header className="h-16 px-6 md:px-12 border-b border-cyan-500/20 flex items-center justify-between z-20 backdrop-blur-md bg-navy-950/80">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-navy-950 text-xs shadow-glow-cyan">
              DW
            </div>
            <div>
              <span className="font-mono font-extrabold text-sm tracking-wider text-white">DEPTHWIZARD <span className="text-cyan-400">AI</span></span>
              <span className="text-[10px] font-mono text-cyan-400/80 block font-semibold">TEAM PARALLAX</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-mono text-xs font-bold transition"
            >
              Enter Dashboard
            </button>
          </div>
        </header>

        <LandingPage />
        <ProcessingPipeline />
        <PresentationMode />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#030712] text-white">
      {/* Main Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Topbar />
        
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardPage />}
          {activeTab === 'upload' && <UploadPage />}
          {activeTab === 'depth' && <DepthPage />}
          {activeTab === 'height' && <HeightPage />}
          {activeTab === 'reconstruction' && <ReconstructionPage />}
          {activeTab === 'flythrough' && <FlythroughPage />}
          {activeTab === 'objects' && <ObjectPage />}
          {activeTab === 'export' && <ExportPage />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Global Interactive Overlays */}
      <ProcessingPipeline />
      <PresentationMode />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
