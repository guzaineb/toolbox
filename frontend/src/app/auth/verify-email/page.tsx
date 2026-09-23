import VerifyEmailClient from './VerifyEmailClient';

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{
    token?: string;
    email?: string;
    code?: string;
  }>;
}) {
  const { token = '', email = '', code = '' } = await searchParams;
  return (
    <VerifyEmailClient
      token={token}
      email={email}
      code={code}
    />
  );
}