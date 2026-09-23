import VerifyEmailClient from './VerifyEmailClient';

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: {
    token?: string;
    email?: string;
    code?: string;
  };
}) {
  return (
    <VerifyEmailClient
      token={searchParams.token || ''}
      email={searchParams.email || ''}
      code={searchParams.code || ''}
    />
  );
}