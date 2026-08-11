import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Globe, Bell, Shield, Trash2 } from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleLanguageChange = async (newLanguage: "english" | "urdu") => {
    try {
      setIsSaving(true);
      await setLanguage(newLanguage);
    } catch (error) {
      console.error("Error changing language:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    try {
      setIsDeleting(true);
      // TODO: Implement account deletion API call
      // For now, just show a message
      alert("Account deletion is not yet implemented");
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/chat")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Language Settings */}
        <Card className="border-border/50 mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Language
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Choose your preferred language for the application interface.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => handleLanguageChange("english")}
                disabled={isSaving}
                variant={language === "english" ? "default" : "outline"}
                className={`${
                  language === "english"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white"
                    : "border-border/50"
                }`}
              >
                English
              </Button>
              <Button
                onClick={() => handleLanguageChange("urdu")}
                disabled={isSaving}
                variant={language === "urdu" ? "default" : "outline"}
                className={`${
                  language === "urdu"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white"
                    : "border-border/50"
                }`}
              >
                اردو
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {language === "english"
                ? "The interface will be displayed in English."
                : "انٹرفیس اردو میں دکھایا جائے گا۔"}
            </p>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-border/50 mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Manage how you receive notifications.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-border/20">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Email Notifications
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Receive updates about your conversations
                  </p>
                </div>
                <div className="relative inline-block w-10 h-6 bg-muted rounded-full cursor-pointer">
                  <div className="absolute left-0.5 top-0.5 h-5 w-5 bg-background rounded-full shadow-md transition-transform"></div>
                </div>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    AI Response Notifications
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Get notified when AI responds to your messages
                  </p>
                </div>
                <div className="relative inline-block w-10 h-6 bg-muted rounded-full cursor-pointer">
                  <div className="absolute left-0.5 top-0.5 h-5 w-5 bg-background rounded-full shadow-md transition-transform"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="border-border/50 mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
              <p className="text-sm text-foreground font-medium mb-2">
                End-to-End Encryption
              </p>
              <p className="text-xs text-muted-foreground">
                Your conversations are encrypted and secure. We do not share your data with third parties.
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-border/20">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Auto-logout
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Automatically logout after 30 minutes of inactivity
                  </p>
                </div>
                <div className="relative inline-block w-10 h-6 bg-cyan-500/20 rounded-full cursor-pointer">
                  <div className="absolute right-0.5 top-0.5 h-5 w-5 bg-background rounded-full shadow-md transition-transform"></div>
                </div>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Two-Factor Authentication
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Add extra security to your account
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border/50"
                  disabled
                >
                  Coming Soon
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-500/20 bg-red-500/5 mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-red-400">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete your account and all associated data.
            </p>
            <Button
              onClick={() => setIsDeleteDialogOpen(true)}
              variant="outline"
              className="border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        {isDeleteDialogOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="border-border/50 w-full max-w-md">
              <CardHeader>
                <CardTitle>Delete Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone. All your conversations and data will be permanently deleted.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setIsDeleteDialogOpen(false)}
                    variant="outline"
                    className="flex-1 border-border/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
