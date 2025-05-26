
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import CartSidebar from '@/components/CartSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { User, Settings, MapPin } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateProfile(profileData);
      toast({
        title: t('success'),
        description: t('profileUpdated'),
      });
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onSearchChange={() => {}}
        onCartClick={() => setIsCartOpen(true)}
        onMenuClick={() => {}}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('profile')}</h1>
          <p className="text-gray-600">
            {t('manageYourAccount')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('accountInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">{t('fullName')}</p>
                <p className="font-medium">{profile?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('email')}</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('phone')}</p>
                <p className="font-medium">{profile?.phone || t('notProvided')}</p>
              </div>
              {profile?.is_admin && (
                <div>
                  <p className="text-sm text-gray-600">{t('accountType')}</p>
                  <p className="font-medium text-primary">{t('admin')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t('settings')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profile">{t('profileInfo')}</TabsTrigger>
                  <TabsTrigger value="addresses">{t('addresses')}</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">{t('fullName')}</Label>
                      <Input
                        id="full_name"
                        value={profileData.full_name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('phone')}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">{t('email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-gray-100"
                      />
                      <p className="text-sm text-gray-500">{t('emailCannotBeChanged')}</p>
                    </div>

                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? t('loading') : t('updateProfile')}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="addresses">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">{t('savedAddresses')}</h3>
                      <Button size="sm">
                        {t('addAddress')}
                      </Button>
                    </div>
                    
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">{t('noAddressesSaved')}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default Profile;
