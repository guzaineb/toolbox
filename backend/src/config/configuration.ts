// config/configuration.ts
export default () => {
  const mailHost = process.env.MAIL_HOST;
  const mailPort = process.env.MAIL_PORT;
  const mailUser = process.env.MAIL_USER;
  const mailPass = process.env.MAIL_PASS;

  if (!mailHost || !mailPort || !mailUser || !mailPass) {
    throw new Error('Missing required email environment variables');
  }

  return {
    mail: {
      host: mailHost,
      port: parseInt(mailPort, 10),
      secure: process.env.MAIL_SECURE === 'true',
      user: mailUser,
      pass: mailPass,
      from: process.env.MAIL_FROM,
    },
    frontendUrl: process.env.FRONTEND_URL,
  };
};
