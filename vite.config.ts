import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

function cmuOAuthPlugin() {
  return {
    name: 'cmu-oauth-proxy',
    configureServer(server: any) {
      server.middlewares.use('/api/cmu-oauth/callback', (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: any) => { body += chunk; });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const { code, redirectUri, clientId, clientSecret } = data;

            const cId = clientId || 'MWM9PxVFyADkwn6pTSxbKlVbw4Fq7me2xzOGLqW4';
            const cSec = clientSecret || 'hmYddTEV2GJr5MVXl2UaBIdjxGGpUPxJj86GFzUKgB2YH2Kdimn1vyxFF3UGWkX7HX6GQb9PTBV8FVE8ig7VFxZuWcTZwz8745REIqvaY8OH2tZmQEHhOECfOfx12DsQ';

            const tokenParams = new URLSearchParams({
              code,
              redirect_uri: redirectUri,
              client_id: cId,
              client_secret: cSec,
              grant_type: 'authorization_code',
            });

            // ส่งแลก token กับเซิร์ฟเวอร์ Authentik OAuth ของ CPE CMU (oauth497.cpecmu.com)
            const tokenRes = await fetch('https://oauth497.cpecmu.com/application/o/token/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: tokenParams.toString(),
            });

            if (!tokenRes.ok) {
              const errText = await tokenRes.text();
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({
                success: false,
                error: `Token exchange returned status ${tokenRes.status}: ${errText}`,
              }));
              return;
            }

            const tokenData = await tokenRes.json();
            const accessToken = tokenData.access_token || tokenData.token;

            if (!accessToken) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({
                success: false,
                error: tokenData.message || tokenData.error_description || 'No access token received',
                raw: tokenData,
              }));
              return;
            }

            // ดึงข้อมูลโปรไฟล์ผู้ใช้จาก Authentik Userinfo Endpoint
            const userRes = await fetch('https://oauth497.cpecmu.com/application/o/userinfo/', {
              headers: { Authorization: `Bearer ${accessToken}` },
            });

            let rawUserData: any = {};
            if (userRes.ok) {
              rawUserData = await userRes.json();
            }

            // จัดรูปแบบข้อมูลโปรไฟล์ให้สอดคล้องกับ CMUUserInfo
            const username = rawUserData.preferred_username || rawUserData.nickname || rawUserData.name || 'cmu.student';
            const email = rawUserData.email || `${username}@cmu.ac.th`;
            const nameParts = (rawUserData.name || '').split(' ');
            const firstName = rawUserData.given_name || nameParts[0] || username;
            const lastName = rawUserData.family_name || nameParts.slice(1).join(' ') || '';
            const isStaff = email.includes('admin') || email.includes('staff') || username === 'bimcub12345';

            const userProfile = {
              cmuitaccount_name: username,
              cmuitaccount: email,
              firstname_TH: rawUserData.name_th || firstName,
              firstname_EN: rawUserData.name_en || firstName,
              lastname_TH: rawUserData.surname_th || lastName,
              lastname_EN: rawUserData.surname_en || lastName,
              student_id: username.match(/^\d{9}$/) ? username : (rawUserData.student_id || ''),
              organization_code: '06',
              organization_name_TH: 'ภาควิชาวิศวกรรมคอมพิวเตอร์ มหาวิทยาลัยเชียงใหม่',
              organization_name_EN: 'Department of Computer Engineering, CMU',
              itaccounttype_id: isStaff ? 'StaffAcc' : 'StdAcc',
              itaccounttype_TH: isStaff ? 'บุคลากร' : 'นักศึกษา',
              itaccounttype_EN: isStaff ? 'Staff' : 'Student',
              raw: rawUserData,
            };

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              user: userProfile,
              token: tokenData,
            }));
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({
              success: false,
              error: err?.message || 'Server error exchanging CMU token',
            }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), cmuOAuthPlugin()],
    resolve: {
      alias: {
        'next/navigation': path.resolve(__dirname, './src/lib/next-navigation.ts'),
        '@/hooks': path.resolve(__dirname, './src/hooks'),
        '@/components': path.resolve(__dirname, './src/components'),
        '@/lib': path.resolve(__dirname, './src/lib'),
        '@/contexts': path.resolve(__dirname, './src/contexts'),
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
