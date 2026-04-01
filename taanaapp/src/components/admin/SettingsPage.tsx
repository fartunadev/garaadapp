import { useState, useEffect } from 'react';
import { Save, Bell, Lock, Palette, Globe, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useSettings, useUpdateSettings, SiteSettings } from '@/hooks/useSettings';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const SettingsPage = () => {
  const { data: savedSettings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  
  const [settings, setSettings] = useState({
    siteName: 'Taano',
    siteEmail: 'admin@taanoshop.com',
    siteDescription: 'Your trusted marketplace for quality products',
    bannerText: 'Free shipping on orders over $10 • 90-day returns • Price match guarantee',
    bannerEnabled: true,
    primaryColor: '#0d9488',
    logoUrl: '',
    notifications: {
      orderUpdates: true,
      newMessages: true,
      lowStock: true,
      newReviews: false,
    },
    email: {
      smtp: 'smtp.gmail.com',
      port: '587',
      username: '',
      password: '',
    },
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (savedSettings) {
      setSettings(prev => ({
        ...prev,
        siteName: savedSettings.siteName || prev.siteName,
        siteEmail: savedSettings.siteEmail || prev.siteEmail,
        siteDescription: savedSettings.siteDescription || prev.siteDescription,
        bannerText: savedSettings.bannerText || prev.bannerText,
        bannerEnabled: savedSettings.bannerEnabled ?? prev.bannerEnabled,
        primaryColor: savedSettings.primaryColor || prev.primaryColor,
        logoUrl: savedSettings.logoUrl || prev.logoUrl,
      }));
    }
  }, [savedSettings]);

  const handleSave = () => {
    updateSettings.mutate({
      siteName: settings.siteName,
      siteEmail: settings.siteEmail,
      siteDescription: settings.siteDescription,
      bannerText: settings.bannerText,
      bannerEnabled: settings.bannerEnabled,
      primaryColor: settings.primaryColor,
      logoUrl: settings.logoUrl,
    });
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setPasswordLoading(true);
    try {
      await api.put('/auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast({ title: "Password updated", description: "Your password has been changed successfully." });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to update password", variant: "destructive" });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-muted">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="w-4 h-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h3 className="text-lg font-bold text-foreground mb-6">General Settings</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName" className="text-foreground font-medium">Site Name</Label>
                <Input id="siteName" value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteEmail" className="text-foreground font-medium">Site Email</Label>
                <Input id="siteEmail" type="email" value={settings.siteEmail} onChange={(e) => setSettings({ ...settings, siteEmail: e.target.value })} className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription" className="text-foreground font-medium">Site Description</Label>
                <Textarea id="siteDescription" value={settings.siteDescription} onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })} className="bg-background border-border min-h-[100px]" placeholder="Describe your marketplace..." />
                <p className="text-xs text-muted-foreground">This description is used for SEO and meta tags.</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h3 className="text-lg font-bold text-foreground mb-6">Notification Preferences</h3>
            <div className="space-y-6">
              {[
                { key: 'orderUpdates', label: 'Order Updates', desc: 'Receive notifications when orders are placed or updated' },
                { key: 'newMessages', label: 'New Messages', desc: 'Get notified when you receive new messages' },
                { key: 'lowStock', label: 'Low Stock Alerts', desc: 'Receive alerts when product stock is running low' },
                { key: 'newReviews', label: 'New Reviews', desc: 'Get notified when products receive new reviews' },
              ].map((item, i, arr) => (
                <div key={item.key} className={`flex items-center justify-between py-3 ${i < arr.length - 1 ? 'border-b border-border' : ''}`}>
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, [item.key]: checked },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Email Tab */}
        <TabsContent value="email" className="space-y-6 mt-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h3 className="text-lg font-bold text-foreground mb-6">Email Configuration</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp" className="text-foreground font-medium">SMTP Server</Label>
                  <Input id="smtp" value={settings.email.smtp} onChange={(e) => setSettings({ ...settings, email: { ...settings.email, smtp: e.target.value } })} className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port" className="text-foreground font-medium">Port</Label>
                  <Input id="port" value={settings.email.port} onChange={(e) => setSettings({ ...settings, email: { ...settings.email, port: e.target.value } })} className="bg-background border-border" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground font-medium">Username</Label>
                <Input id="username" value={settings.email.username} onChange={(e) => setSettings({ ...settings, email: { ...settings.email, username: e.target.value } })} className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailPassword" className="text-foreground font-medium">Password</Label>
                <Input id="emailPassword" type="password" value={settings.email.password} onChange={(e) => setSettings({ ...settings, email: { ...settings.email, password: e.target.value } })} className="bg-background border-border" />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Security Tab - Now functional */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h3 className="text-lg font-bold text-foreground mb-6">Security Settings</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-foreground font-medium">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="bg-background border-border"
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground font-medium">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="bg-background border-border"
                  placeholder="Confirm new password"
                />
              </div>
              <Button variant="default" className="mt-4" onClick={handlePasswordUpdate} disabled={passwordLoading}>
                {passwordLoading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6 mt-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h3 className="text-lg font-bold text-foreground mb-6">Appearance Settings</h3>
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Announcement Banner</h4>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="font-medium text-foreground">Enable Banner</p>
                    <p className="text-sm text-muted-foreground">Show announcement banner at the top of the site</p>
                  </div>
                  <Switch checked={settings.bannerEnabled} onCheckedChange={(checked) => setSettings({ ...settings, bannerEnabled: checked })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bannerText" className="text-foreground font-medium">Banner Text</Label>
                  <Input id="bannerText" value={settings.bannerText} onChange={(e) => setSettings({ ...settings, bannerText: e.target.value })} className="bg-background border-border" placeholder="Free shipping on orders over $10 • 90-day returns" />
                  <p className="text-xs text-muted-foreground">This text appears in the top banner of your site.</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <h4 className="font-medium text-foreground">Branding</h4>
                <div className="space-y-2">
                  <Label htmlFor="logoUrl" className="text-foreground font-medium">Logo URL</Label>
                  <Input id="logoUrl" value={settings.logoUrl} onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })} className="bg-background border-border" placeholder="https://example.com/logo.png" />
                  <p className="text-xs text-muted-foreground">Enter a URL for your site logo (recommended size: 200x50px).</p>
                </div>
                {settings.logoUrl && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-2">Preview:</p>
                    <img src={settings.logoUrl} alt="Logo preview" className="h-12 object-contain border rounded p-2" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <h4 className="font-medium text-foreground">Theme</h4>
                <div className="space-y-2">
                  <Label htmlFor="primaryColor" className="text-foreground font-medium">Primary Color</Label>
                  <div className="flex gap-3 items-center">
                    <Input id="primaryColor" type="color" value={settings.primaryColor} onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })} className="w-16 h-10 p-1 cursor-pointer" />
                    <Input value={settings.primaryColor} onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })} className="bg-background border-border flex-1" placeholder="#0d9488" />
                  </div>
                  <p className="text-xs text-muted-foreground">The main accent color used throughout your site.</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} variant="default" className="gap-2" disabled={updateSettings.isPending}>
          <Save className="w-4 h-4" />
          {updateSettings.isPending ? "Saving..." : "Save All Settings"}
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
