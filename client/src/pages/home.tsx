import { useState } from "react";
import { Header } from "@/components/header";
import { PublicInterface } from "@/components/public-interface";
import { AdminPanel } from "@/components/admin-panel";
import { LoginModal } from "@/components/login-modal";
import { useAuth } from "@/hooks/use-auth";
import type { TabType } from "@/lib/types";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("public");
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const { data: auth } = useAuth();

  const handleTabChange = (tab: TabType) => {
    if (tab === 'admin' && !auth?.isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        onLoginClick={() => setLoginModalOpen(true)}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'public'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
                onClick={() => handleTabChange('public')}
              >
                Public Interface
              </button>
              {auth?.isAuthenticated && (
                <button
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'admin'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                  onClick={() => handleTabChange('admin')}
                >
                  Admin Panel
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'public' ? <PublicInterface /> : <AdminPanel />}
      </main>

      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
      />
    </div>
  );
}
