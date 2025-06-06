import { GraduationCap, Bell, User, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { TabType } from "@/lib/types";

interface HeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onLoginClick: () => void;
}

export function Header({ activeTab, onTabChange, onLoginClick }: HeaderProps) {
  const { data: auth, isLoading } = useAuth();
  const logout = useLogout();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      toast({ title: "Logged out successfully" });
      onTabChange('public');
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to logout", 
        variant: "destructive" 
      });
    }
  };
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="text-primary-foreground text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">StudyHub</h1>
              <p className="text-xs text-slate-500">Q&A Learning Platform</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Button
              variant="ghost"
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === 'public'
                  ? 'text-primary'
                  : 'text-slate-700 hover:text-primary'
              }`}
              onClick={() => onTabChange('public')}
            >
              Browse Questions
            </Button>
            {auth?.isAuthenticated && (
              <Button
                variant="ghost"
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'admin'
                    ? 'text-primary'
                    : 'text-slate-700 hover:text-primary'
                }`}
                onClick={() => onTabChange('admin')}
              >
                Admin Panel
              </Button>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {!isLoading && (
              auth?.isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-600">
                    Welcome, {auth.user?.email}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleLogout}
                    disabled={logout.isPending}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {logout.isPending ? "Logging out..." : "Logout"}
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onLoginClick}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Admin Login
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
