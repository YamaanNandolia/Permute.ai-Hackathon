/**
 * Settings - Profile, Store, Data connections, Plan & Billing, Notifications
 */

import React, { useState } from 'react';
import { User, Store, Database, CreditCard, Bell, Shield, HelpCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';

export function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [insightAlerts, setInsightAlerts] = useState(true);
  const [performanceAlerts, setPerformanceAlerts] = useState(false);

  const handleSaveProfile = () => {
    toast.success('Profile settings updated');
  };

  const handleSaveStore = () => {
    toast.success('Store settings updated');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences updated');
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Header Band */}
      <div className="bg-white border-b border-[rgba(33,38,63,0.12)]">
        <div className="px-8 py-6">
          <h1 className="text-[#21263F] mb-1">Settings</h1>
          <p className="text-[15px] text-[#676F8E]">
            Manage your account, stores, and integrations
          </p>
        </div>
      </div>

      {/* Settings Content */}
      <div className="px-8 py-8">
        <div className="max-w-[1000px]">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-white border border-[rgba(33,38,63,0.08)]">
              <TabsTrigger value="profile" className="gap-2">
                <User size={16} />
                Profile
              </TabsTrigger>
              <TabsTrigger value="store" className="gap-2">
                <Store size={16} />
                Store
              </TabsTrigger>
              <TabsTrigger value="data" className="gap-2">
                <Database size={16} />
                Data Connections
              </TabsTrigger>
              <TabsTrigger value="billing" className="gap-2">
                <CreditCard size={16} />
                Plan & Billing
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell size={16} />
                Notifications
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="bg-white rounded-[16px] border border-[rgba(33,38,63,0.08)] shadow-[0_8px_24px_-6px_rgba(0,0,0,0.28)] p-8">
                <h3 className="text-[#21263F] mb-6">Profile Information</h3>

                <div className="flex items-center gap-6 mb-8">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-[#3D4468] text-white text-[24px]">
                      SK
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">
                      Change Photo
                    </Button>
                    <p className="text-[13px] text-[#676F8E] mt-2">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        defaultValue="Sarah"
                        className="mt-2 bg-[#FAFBFC]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        defaultValue="Kim"
                        className="mt-2 bg-[#FAFBFC]"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="sarah@pathwise.com"
                      className="mt-2 bg-[#FAFBFC]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      defaultValue="Pathwise Inc."
                      className="mt-2 bg-[#FAFBFC]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      defaultValue="Store Manager"
                      className="mt-2 bg-[#FAFBFC]"
                    />
                  </div>
                </div>

                <Separator className="my-8" />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[16px] font-semibold text-[#21263F] mb-1">
                      Delete Account
                    </h4>
                    <p className="text-[13px] text-[#676F8E]">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button variant="outline" className="text-[#EF4444] border-[#EF4444] hover:bg-[#EF4444] hover:text-white">
                    Delete Account
                  </Button>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-[rgba(33,38,63,0.12)]">
                  <Button variant="outline">Cancel</Button>
                  <Button
                    className="bg-[#21263F] hover:bg-[#3D4468] text-white"
                    onClick={handleSaveProfile}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Store Tab */}
            <TabsContent value="store" className="space-y-6">
              <div className="bg-white rounded-[16px] border border-[rgba(33,38,63,0.08)] shadow-[0_8px_24px_-6px_rgba(0,0,0,0.28)] p-8">
                <h3 className="text-[#21263F] mb-6">Store Settings</h3>

                <div className="space-y-5">
                  <div>
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input
                      id="storeName"
                      defaultValue="Store A - Downtown NYC"
                      className="mt-2 bg-[#FAFBFC]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="storeAddress">Address</Label>
                    <Input
                      id="storeAddress"
                      defaultValue="123 Broadway, New York, NY 10007"
                      className="mt-2 bg-[#FAFBFC]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="storeSize">Store Size (sq ft)</Label>
                      <Input
                        id="storeSize"
                        defaultValue="2,500"
                        className="mt-2 bg-[#FAFBFC]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="aisles">Number of Aisles</Label>
                      <Input
                        id="aisles"
                        defaultValue="12"
                        className="mt-2 bg-[#FAFBFC]"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="storeHours">Operating Hours</Label>
                    <Input
                      id="storeHours"
                      defaultValue="Mon-Sun: 8:00 AM - 10:00 PM"
                      className="mt-2 bg-[#FAFBFC]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-[rgba(33,38,63,0.12)]">
                  <Button variant="outline">Cancel</Button>
                  <Button
                    className="bg-[#21263F] hover:bg-[#3D4468] text-white"
                    onClick={handleSaveStore}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Data Connections Tab */}
            <TabsContent value="data" className="space-y-6">
              <div className="bg-white rounded-[16px] border border-[rgba(33,38,63,0.08)] shadow-[0_8px_24px_-6px_rgba(0,0,0,0.28)] p-8">
                <h3 className="text-[#21263F] mb-6">Data Connections</h3>

                <div className="space-y-4">
                  {/* Square POS */}
                  <div className="flex items-center justify-between p-4 border border-[rgba(33,38,63,0.08)] rounded-[12px]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[10px] bg-[#F3F4F6] flex items-center justify-center">
                        <Database size={24} className="text-[#3D4468]" />
                      </div>
                      <div>
                        <div className="text-[15px] font-medium text-[#21263F]">
                          Square POS
                        </div>
                        <div className="text-[13px] text-[#676F8E]">
                          Connected • Last sync 2 hours ago
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">Configure</Button>
                      <Button variant="outline" size="sm" className="text-[#EF4444]">
                        Disconnect
                      </Button>
                    </div>
                  </div>

                  {/* Shopify */}
                  <div className="flex items-center justify-between p-4 border border-[rgba(33,38,63,0.08)] rounded-[12px]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[10px] bg-[#F3F4F6] flex items-center justify-center">
                        <Store size={24} className="text-[#3D4468]" />
                      </div>
                      <div>
                        <div className="text-[15px] font-medium text-[#21263F]">
                          Shopify
                        </div>
                        <div className="text-[13px] text-[#676F8E]">
                          Not connected
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Connect</Button>
                  </div>

                  {/* Custom API */}
                  <div className="flex items-center justify-between p-4 border border-[rgba(33,38,63,0.08)] rounded-[12px]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[10px] bg-[#F3F4F6] flex items-center justify-center">
                        <Shield size={24} className="text-[#3D4468]" />
                      </div>
                      <div>
                        <div className="text-[15px] font-medium text-[#21263F]">
                          Custom API
                        </div>
                        <div className="text-[13px] text-[#676F8E]">
                          Configure your own data source
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Setup</Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Plan & Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              <div className="bg-white rounded-[16px] border border-[rgba(33,38,63,0.08)] shadow-[0_8px_24px_-6px_rgba(0,0,0,0.28)] p-8">
                <h3 className="text-[#21263F] mb-6">Current Plan</h3>

                <div className="p-6 bg-gradient-to-br from-[#21263F] to-[#3D4468] rounded-[12px] text-white mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-[13px] text-white/80 mb-1">Current Plan</div>
                      <div className="text-[24px] font-semibold">Professional</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[32px] font-semibold">$99</div>
                      <div className="text-[13px] text-white/80">per month</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-[14px]">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                      <span>Unlimited stores</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                      <span>Advanced analytics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                      <span>Priority support</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[15px] font-medium text-[#21263F]">
                        Billing Cycle
                      </div>
                      <div className="text-[13px] text-[#676F8E]">
                        Next billing date: November 30, 2025
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Change Plan</Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[15px] font-medium text-[#21263F]">
                        Payment Method
                      </div>
                      <div className="text-[13px] text-[#676F8E]">
                        Visa ending in 4242
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Update</Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[15px] font-medium text-[#21263F]">
                        Billing History
                      </div>
                      <div className="text-[13px] text-[#676F8E]">
                        View past invoices and receipts
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View History</Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <div className="bg-white rounded-[16px] border border-[rgba(33,38,63,0.08)] shadow-[0_8px_24px_-6px_rgba(0,0,0,0.28)] p-8">
                <h3 className="text-[#21263F] mb-6">Notification Preferences</h3>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-[15px] font-medium text-[#21263F] mb-1">
                        Email Notifications
                      </div>
                      <div className="text-[13px] text-[#676F8E]">
                        Receive email updates about your account
                      </div>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-[15px] font-medium text-[#21263F] mb-1">
                        Weekly Reports
                      </div>
                      <div className="text-[13px] text-[#676F8E]">
                        Get weekly summaries of your store performance
                      </div>
                    </div>
                    <Switch
                      checked={weeklyReports}
                      onCheckedChange={setWeeklyReports}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-[15px] font-medium text-[#21263F] mb-1">
                        Insight Alerts
                      </div>
                      <div className="text-[13px] text-[#676F8E]">
                        Be notified when new optimization insights are discovered
                      </div>
                    </div>
                    <Switch
                      checked={insightAlerts}
                      onCheckedChange={setInsightAlerts}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-[15px] font-medium text-[#21263F] mb-1">
                        Performance Alerts
                      </div>
                      <div className="text-[13px] text-[#676F8E]">
                        Get notified about significant performance changes
                      </div>
                    </div>
                    <Switch
                      checked={performanceAlerts}
                      onCheckedChange={setPerformanceAlerts}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-[rgba(33,38,63,0.12)]">
                  <Button variant="outline">Cancel</Button>
                  <Button
                    className="bg-[#21263F] hover:bg-[#3D4468] text-white"
                    onClick={handleSaveNotifications}
                  >
                    Save Preferences
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
