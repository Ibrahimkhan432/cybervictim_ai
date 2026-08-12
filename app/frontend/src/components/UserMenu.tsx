import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  User,
  LogOut,
  Globe,
  Settings,
  ChevronDown,
  Loader,
  BarChart3,
} from "lucide-react";

export default function UserMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, setLanguage, isLoading: isLanguageLoading } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  const handleLanguageChange = async (newLanguage: "english" | "urdu") => {
    try {
      await setLanguage(newLanguage);
    } catch (error) {
      console.error("Language change error:", error);
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="sm"
        className="gap-2"
      >
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
          <User className="h-4 w-4 text-white" />
        </div>
        <span className="hidden sm:inline text-sm font-medium max-w-[150px] truncate">
          {user?.name || user?.email || "User"}
        </span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-64 z-50 border-border/50 shadow-xl">
          {/* User Info */}
          <div className="px-4 py-4 border-b border-border/20">
            <p className="text-sm font-semibold text-foreground">
              {user?.name || "User Account"}
            </p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>

          {/* Menu Items */}
          <div className="p-2 space-y-1">
            {/* Profile */}
            <button
              onClick={() => handleNavigate("/profile")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-sm text-foreground"
            >
              <User className="h-4 w-4 text-muted-foreground" />
              <span>My Profile</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => handleNavigate("/settings")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-sm text-foreground"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>Settings</span>
            </button>

            {/* Language */}
            <div className="px-3 py-2.5">
              <div className="flex items-center gap-3 text-sm text-foreground mb-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>Language</span>
              </div>
              <div className="flex gap-2 ml-7">
                <button
                  onClick={() => handleLanguageChange("english")}
                  disabled={isLanguageLoading}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    language === "english"
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  } ${isLanguageLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isLanguageLoading && language !== "english" ? (
                    <Loader className="h-3 w-3 inline mr-1 animate-spin" />
                  ) : null}
                  English
                </button>
                <button
                  onClick={() => handleLanguageChange("urdu")}
                  disabled={isLanguageLoading}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    language === "urdu"
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  } ${isLanguageLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isLanguageLoading && language === "urdu" ? (
                    <Loader className="h-3 w-3 inline mr-1 animate-spin" />
                  ) : null}
                  اردو
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border/20" />

          {/* Logout */}
          <div className="p-2">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 transition-colors text-sm text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
