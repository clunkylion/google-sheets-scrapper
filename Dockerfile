FROM ghcr.io/puppeteer/puppeteer:22.10.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    CONTABILIUM_URL=https://app.contabilium.cl \
    CONTABILIUM_EMAIL=MARTINRIOJA@GMAIL.COM \
    CONTABILIUM_PASSWORD=APIcontabilum2 \
    EMAIL_USER=scrapper.motoroil@gmail.com \
    EMAIL_PASSWORD="syup eaqu ggpw viyv" \
    TEST_DOCUMENT_ID=1Rn2HBMAlw4C3gGW-5PSn1xdUAr1gYqeC61sFWyuvtqw \
    DOCUMENT_ID=1_IwJEODeSZnu3_ZrZsw6moZBOaAhgwRb92eec5cRh3A \
    PORT=3000 \
    EMAIL_RECIPIENTS=["cote99salamanca@gmail.com"] \
    TYPE=service_account \
    PROJECT_ID=global-ace-420114 \
    PRIVATE_KEY_ID=0a0e6c86d0cc9a3a2960e12fca2604918db5fac1 \
    PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDHmXGRIKOCLRMw\nVzWCgrOIf/Ee2Rsvc1F1NKv+1LPnPKEgeHzc+mWW28uv+NBwwGozkJTmn6cAmHlT\nNx39X+5NLvtGgt4xe+9Dvrc2BJ2sV07+7KGxdh2O0FdvdQetWfYEizNCmKriJ3SL\ni9d+mslms3II0vsX6rECbFGH4a99IoW7AH+BX9bGBpxlnTstdQWNP2IZxNf+XHzy\nMXIgu/6ruo3C9VknK0kiRfuV/+INlHyK9dqGZSM0ZFXTvsbUCrhnxT6J+fHcrTNz\nlwc6DGbIYJUo4OrX5V0tbSh8PsqsAxv9KY62INFrV+h8DNR0dMPF8mUIcHSBOFau\n+ioN1XBNAgMBAAECggEADTYHCgnMwL4+haXUDRwdCXUcbsQEdF7P3q/ajX6jHLRK\n3uUSsKajKDnKkM5pb3kQ3nJcpKofCd9NsngUtFNP6MxqBcf+MGzJUKTUKA9kp0ZN\nHHrpld8hRDVegCpRFIR+j9ztyuPjdZ4SbPUX0ZGpsHJCozphs7rNNgGY4ONLc/8B\nxUJfA4ZdEJiPwc//V2Hn5Z7qAHhVp2putO48XAMXVkD9yxmQveg0YzaT8ECpSMzA\nj4swSsQYpsgoOeFfuPcDlIv11HgdC4n6nkBuBPWW/ZQHau3RlYz+PgzntlWtYezj\nJCBhIMjabDbTzIuS5mC1pMS187X7AHbJjz9nnhdgKQKBgQDqKIoZls3zrFAe1W23\n36Ld2jC++DWzZO1ctWDsT16FqK9Ex3zpsLNZLBWm2ZSpT7XHan33M0B7VeL+w2gs\njChk8pYh562Fqe7EA/avULSyTwiY4RPqZJ5qhvLAr6MHa27kLbf8pg6ygW1+kyvE\npwD5jehSV2Ep4uBsMBAgHarAdQKBgQDaN6vsyl5jwmejU56PAtrjSF2ynXWzDRKF\neWJG67vZdFY/lBidw1dMZst6Jdx1OK6DiQgEQkGX9OJGUMsgDUQ3qEK6OkjpCgkg\nYlwHvmbFn4qImGdb/jZ6yOBP2pKLE7XWwaWyZPAhLpEio8Nk7+WaPVR3JI899nQB\nr/HK8B91eQKBgBYetEUMkPIW8g6nnNDE6I7KoNY5fmEvBJlAbSKFsOkxcTUvHya4\nUYj3+Cel4DxKUmK/NZ0Xk1zTVTk53mpu5xX6MKKNT0AUOID92tze4+MAQlCm2onG\n7YwkqWP4c48s3/HgO8Q7L6I/RceyQW03VYk9lZfJt10MmKS/uZY/FzVNAoGAR113\nm4wfTG7SqAZ7z3d2kGglRHnceT8oNICbFGiZ2acDYe2UE1xEG5duqjbhn3B3Gkth\nVMs6WnDa43YeyA+upKkhkXfoSlZe37lrMZkiUTU5AC0feGVt+b/iJBtuW4+Jo39X\nKj16js+E5Zg7GbKfG089ZW2Obww/qiGZaO4Yy7kCgYEA5tdUZXznI0nFFRyz0jgD\nlNbVF5WZp2imK74Cje5LfNvzy8Sv/5g1qrygxQ3jzzesA9RKeWEwe8TPq0HFUyV9\nacfvwuFt1WXswDWN8tPhwpx9fwPX3BUJN+qj0OESb0lq0u7nIIJpkO3IMEZ3R8Gt\ni1bi3sxijjotpOlfN5Z4RKI=-----END PRIVATE KEY-----" \
    CLIENT_EMAIL=nodejs-google-sheets@global-ace-420114.iam.gserviceaccount.com \
    CLIENT_ID=114281143020440293849 \
    AUTH_URI=https://accounts.google.com/o/oauth2/auth \
    TOKEN_URI=https://oauth2.googleapis.com/token \
    AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs \
    CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/nodejs-google-sheets%40global-ace-420114.iam.gserviceaccount.com \
    UNIVERSE_DOMAIN=googleapis.com \
    NODE_ENV=PRODUCTION

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . . 

RUN ls -la /usr/src/app
CMD [ "node", "src/index.js" ]