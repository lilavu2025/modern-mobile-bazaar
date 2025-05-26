
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const EmailConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the tokens from URL parameters
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        if (token_hash && type === 'signup') {
          // Verify the email confirmation
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'signup'
          });

          if (error) {
            console.error('Email confirmation error:', error);
            setStatus('error');
            setMessage(t('emailConfirmationError'));
          } else {
            console.log('Email confirmed successfully:', data);
            setStatus('success');
            setMessage(t('emailConfirmedSuccess'));
            
            // Auto redirect to main page after 2 seconds if user is authenticated
            setTimeout(() => {
              if (data.user) {
                navigate('/');
              }
            }, 2000);
          }
        } else {
          setStatus('error');
          setMessage(t('invalidConfirmationLink'));
        }
      } catch (error) {
        console.error('Unexpected error during confirmation:', error);
        setStatus('error');
        setMessage(t('emailConfirmationError'));
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate, t]);

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (user && status === 'success') {
      navigate('/');
    }
  }, [user, status, navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-16 w-16 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'loading':
        return t('verifyingEmail');
      case 'success':
        return t('emailConfirmed');
      case 'error':
        return t('confirmationFailed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <LanguageSwitcher />
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">م</span>
            </div>
            <CardTitle className="text-2xl">{t('storeName')}</CardTitle>
            <CardDescription>{getStatusTitle()}</CardDescription>
          </CardHeader>

          <CardContent className="text-center space-y-6">
            <div className="flex justify-center">
              {getStatusIcon()}
            </div>

            <div className="space-y-2">
              <p className="text-lg font-medium">
                {getStatusTitle()}
              </p>
              <p className="text-gray-600">
                {message}
              </p>
            </div>

            {status === 'success' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  {t('redirectingToHome')}
                </p>
                <Button onClick={() => navigate('/')} className="w-full">
                  {t('goToHome')}
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <Button onClick={() => navigate('/auth')} className="w-full">
                  {t('backToLogin')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailConfirmation;
