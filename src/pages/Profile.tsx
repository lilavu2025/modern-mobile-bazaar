
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
import { toast } from 'sonner';
import { User, Settings, MapPin } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const { t, isRTL } = useLanguage();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Add safety check for profile data
  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateProfile(profileData);
      toast.success(t('profileUpdated'));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'admin':
        return t('admin');
      case 'wholesale':
        return t('wholesale');
      case 'retail':
        return t('retail');
      default:
        return userType;
    }
  };

  // Show loading if user or profile is not available yet
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Header 
        onSearchChange={() => {}}
        onCartClick={() => setIsCartOpen(true)}
        onMenuClick={() => {}}
      />

      <div className="container mx-auto px-4 py-6">
        <div className={`mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
          <h1 className={`text-3xl font-bold mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('profile')}</h1>
          <p className={`text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('manageYourAccount')}
          </p>
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${isRTL ? 'direction-rtl' : 'direction-ltr'}`}>
          {/* Profile Summary */}
          <Card className={isRTL ? 'text-right' : 'text-left'}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <User className="h-5 w-5" />
                <span className={isRTL ? 'text-right' : 'text-left'}>{t('accountInfo')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>{t('fullName')}</p>
                <p className={`font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{profile?.full_name || t('notProvided')}</p>
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>{t('email')}</p>
                <p className={`font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{user?.email}</p>
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>{t('phone')}</p>
                <p className={`font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{profile?.phone || t('notProvided')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className={`lg:col-span-2 ${isRTL ? 'text-right' : 'text-left'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <Settings className="h-5 w-5" />
                <span className={isRTL ? 'text-right' : 'text-left'}>{t('settings')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className={isRTL ? 'text-right' : 'text-left'}>
              <Tabs defaultValue="profile" className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
                <TabsList className={`grid w-full grid-cols-2 ${isRTL ? 'direction-rtl' : 'direction-ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                  <TabsTrigger value="profile" className={isRTL ? 'text-right' : 'text-left'}>{t('profileInfo')}</TabsTrigger>
                  <TabsTrigger value="addresses" className={isRTL ? 'text-right' : 'text-left'}>{t('addresses')}</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className={isRTL ? 'text-right' : 'text-left'}>
                  <form onSubmit={handleUpdateProfile} className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                    <div className={`space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <Label htmlFor="full_name" className={`${isRTL ? 'text-right block' : 'text-left block'}`}>{t('fullName')}</Label>
                      <Input
                        id="full_name"
                        value={profileData.full_name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                        required
                        className={`${isRTL ? 'text-right' : 'text-left'} w-full`}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>

                    <div className={`space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <Label htmlFor="phone" className={`${isRTL ? 'text-right block' : 'text-left block'}`}>{t('phone')}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className={`${isRTL ? 'text-right' : 'text-left'} w-full`}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>

                    <div className={`space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <Label htmlFor="email" className={`${isRTL ? 'text-right block' : 'text-left block'}`}>{t('email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className={`bg-gray-100 ${isRTL ? 'text-right' : 'text-left'} w-full`}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                      <p className={`text-sm text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>{t('emailCannotBeChanged')}</p>
                    </div>

                    <div className={`flex ${isRTL ? 'justify-start' : 'justify-start'}`}>
                      <Button type="submit" disabled={isLoading} className={isRTL ? 'text-right' : 'text-left'}>
                        {isLoading ? t('loading') : t('updateProfile')}
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="addresses" className={isRTL ? 'text-right' : 'text-left'}>
                  <div className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                      <h3 className={`text-lg font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{t('savedAddresses')}</h3>
                      <Button size="sm" className={isRTL ? 'text-right' : 'text-left'}>
                        {t('addAddress')}
                      </Button>
                    </div>
                    
                    <div className={`text-center py-8 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className={`text-gray-500 ${isRTL ? 'text-right' : 'text-left'} text-center`}>{t('noAddressesSaved')}</p>
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
