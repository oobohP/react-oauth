import React, { forwardRef, useEffect, useRef } from 'react';
import { useGoogleOAuth } from './GoogleOAuthProvider';
import {
  CredentialResponse,
  GoogleCredentialResponse,
  MomentListener,
  GsiButtonConfiguration,
} from './types';

const containerHeightMap = { large: 40, medium: 32, small: 20 };

export type GoogleLoginProps = {
  onSuccess: (credentialResponse: CredentialResponse) => void;
  onError?: () => void;
  promptMomentNotification?: MomentListener;
  useOneTap?: boolean;
  containerProps?: React.ComponentPropsWithoutRef<'div'>;
} & Omit<GsiButtonConfiguration, 'client_id' | 'callback'>;

const GoogleLogin = forwardRef<HTMLDivElement, GoogleLoginProps>(
  (
    {
      onSuccess,
      onError,
      useOneTap,
      promptMomentNotification,
      type = 'standard',
      theme = 'outline',
      size = 'large',
      text,
      shape,
      logo_alignment,
      width,
      locale,
      click_listener,
      containerProps,
      ...props
    },
    forwardedRef,
  ) => {
    const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth();
    const internalRef = useRef<HTMLDivElement>(null);
    const ref = forwardedRef || internalRef;

    useEffect(() => {
      if (!scriptLoadedSuccessfully) return;

      window?.google?.accounts.id.initialize({
        client_id: clientId,
        callback: (credentialResponse: GoogleCredentialResponse) => {
          if (!credentialResponse?.credential) {
            onError?.();
          } else {
            onSuccess(credentialResponse);
          }
        },
        ...props,
      });

      if (ref && 'current' in ref && ref.current) {
        window?.google?.accounts.id.renderButton(ref.current, {
          type,
          theme,
          size,
          text,
          shape,
          logo_alignment,
          width,
          locale,
          click_listener,
        });
      }

      if (useOneTap) {
        window?.google?.accounts.id.prompt(promptMomentNotification);
      }

      return () => {
        if (useOneTap) {
          window?.google?.accounts.id.cancel();
        }
      };
    }, [
      clientId,
      scriptLoadedSuccessfully,
      onSuccess,
      onError,
      useOneTap,
      type,
      theme,
      size,
      text,
      shape,
      logo_alignment,
      width,
      locale,
      props,
      promptMomentNotification,
      ref,
    ]);

    return (
      <div
        {...containerProps}
        ref={ref}
        style={{ display: 'none', ...containerProps?.style }}
      />
    );
  },
);

export default GoogleLogin;
