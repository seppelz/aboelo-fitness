import net from 'net';
import tls from 'tls';

const host = process.env.SMTP_TEST_HOST || process.env.EMAIL_HOST || 'v176836.goserver.host';
const starttlsPort = Number(process.env.SMTP_TEST_STARTTLS_PORT || process.env.EMAIL_PORT || 587);
const smtpsPort = Number(process.env.SMTP_TEST_SMTPS_PORT || 465);
const timeoutMs = Number(process.env.SMTP_TEST_TIMEOUT || 15000);

const log = (scope: string, message: string, extra: Record<string, unknown> = {}) => {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({ timestamp, scope, message, ...extra }));
};

const tcpCheck = () =>
  new Promise<void>((resolve) => {
    const socket = net.connect({ host, port: starttlsPort }, () => {
      log('tcpCheck', 'TCP connected', { host, port: starttlsPort });
    });

    socket.setTimeout(timeoutMs);

    socket.on('data', (chunk) => {
      log('tcpCheck', 'Received banner', { banner: chunk.toString('utf8').trim() });
      socket.destroy();
      resolve();
    });

    socket.on('timeout', () => {
      log('tcpCheck', 'Timed out waiting for banner', { timeoutMs });
      socket.destroy();
      resolve();
    });

    socket.on('error', (error) => {
      log('tcpCheck', 'Connection error', { error: error.message });
      resolve();
    });
  });

const tlsCheck = () =>
  new Promise<void>((resolve) => {
    const socket = tls.connect(
      {
        host,
        port: smtpsPort,
        servername: host,
        timeout: timeoutMs,
      },
      () => {
        log('tlsCheck', 'TLS handshake established', {
          authorized: socket.authorized,
          authorizationError: socket.authorizationError,
          cipher: socket.getCipher(),
          protocol: socket.getProtocol(),
        });
        socket.end();
        resolve();
      },
    );

    socket.on('timeout', () => {
      log('tlsCheck', 'Timed out during TLS handshake', { timeoutMs });
      socket.destroy();
      resolve();
    });

    socket.on('error', (error) => {
      log('tlsCheck', 'TLS error', { error: error.message });
      resolve();
    });
  });

(async () => {
  log('runner', 'Starting SMTP connectivity diagnostics', {
    host,
    starttlsPort,
    smtpsPort,
    timeoutMs,
  });

  await tcpCheck();
  await tlsCheck();

  log('runner', 'Diagnostics complete', {});
})();
