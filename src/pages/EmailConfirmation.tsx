
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const EmailConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        console.log('Current location hash:', location.hash);
        console.log('Current location search:', location.search);

        // Parse hash parameters (Supabase sends confirmation data in hash)
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const token_hash = hashParams.get('access_token') || hashParams.get('token_hash');
        const type = hashParams.get('type');
        const error = hashParams.get('error');
        const error_description = hashParams.get('error_description');

        console.log('Hash params:', { token_hash, type, error, error_description });

        // Check for errors first
        if (error) {
          console.error('Email confirmation error from URL:', error, error_description);
          setStatus('error');
          if (error === 'access_denied' && error_description?.includes('expired')) {
            setMessage(t('invalidConfirmationLink'));
          } else {
            setMessage(error_description || t('emailConfirmationError'));
          }
          return;
        }

        // If we have a token, try to verify it
        if (token_hash) {
          console.log('Attempting to verify token...');
          
          // For email confirmation, we use the session from the URL
          const { data, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Session error:', sessionError);
            setStatus('error');
            setMessage(t('emailConfirmationError'));
          } else if (data.session) {
            console.log('Session found, user confirmed successfully:', data.session.user);
            setStatus('success');
            setMessage(t('emailConfirmedSuccess'));
            
            // Auto redirect to main page after 2 seconds
            setTimeout(() => {
              navigate('/');
            }, 2000);
          } else {
            console.log('No session found, checking for refresh token in hash...');
            // Try to set session from hash
            const refresh_token = hashParams.get('refresh_token');
            if (refresh_token) {
              const { error: refreshError } = await supabase.auth.setSession({
                access_token: token_hash,
                refresh_token: refresh_token
              });
              
              if (refreshError) {
                console.error('Refresh error:', refreshError);
                setStatus('error');
                setMessage(t('emailConfirmationError'));
              } else {
                setStatus('success');
                setMessage(t('emailConfirmedSuccess'));
                setTimeout(() => {
                  navigate('/');
                }, 2000);
              }
            } else {
              setStatus('error');
              setMessage(t('invalidConfirmationLink'));
            }
          }
        } else {
          // No token found, show error
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
  }, [location.hash, location.search, navigate, t]);

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
