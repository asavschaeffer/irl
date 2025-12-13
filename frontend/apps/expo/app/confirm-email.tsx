import React, { useMemo } from 'react';
import ScreenDescription from '@app-launch-kit/components/common/ScreenDescription';
import { Button, ButtonText } from '@app-launch-kit/components/primitives/button';
import { useRouter } from '@unitools/router';
import { useLocalSearchParams } from 'expo-router';
import config from '@app-launch-kit/config';

export default function ConfirmEmail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { routes } = config;

  const message = useMemo(() => {
    const error = typeof params?.error_description === 'string'
      ? params.error_description
      : typeof params?.error === 'string'
        ? params.error
        : null;

    if (error) return `Email confirmation failed: ${error}`;
    return 'Your email has been confirmed. You can now sign in.';
  }, [params]);

  return (
    <>
      <ScreenDescription title="Email confirmed" description={message} />
      <Button
        className="mt-5"
        onPress={() => {
          router.push(routes.signIn.path);
        }}
      >
        <ButtonText>Continue to Sign In</ButtonText>
      </Button>
    </>
  );
}


