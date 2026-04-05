import fs from 'fs';

const sourcePath = 'd:\\codes\\Udyok\\udyok\\openapi.yaml';
const targetPath = 'd:\\codes\\Udyok\\udyok-backend\\core-service\\openapi.yaml';

let content = fs.readFileSync(sourcePath, 'utf-8');

const pathsIndex = content.indexOf('paths:\n');
if (pathsIndex !== -1) {
    let before = content.substring(0, pathsIndex + 7);
    let after = content.substring(pathsIndex + 7);

    // Replace top-level paths by prefixing them with /api
    after = after.replace(/^  \/([a-zA-Z{}])/gm, '  /api/$1');
    content = before + after;
}

// Inject new endpoints right before /api/auth/login
const injectIndex = content.indexOf('  /api/auth/login:');
const newEndpoints = `
  /api/auth/google:
    post:
      tags:
        - Authentication
      summary: User login with Google
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - idToken
              properties:
                idToken:
                  type: string
      responses:
        '200':
          description: Google login successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '400':
          description: Invalid Google token

  /api/auth/verify-email:
    post:
      tags:
        - Authentication
      summary: Verify email via OTP
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - otp
              properties:
                email:
                  type: string
                  format: email
                otp:
                  type: string
      responses:
        '200':
          description: Email verified successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '400':
          description: Invalid OTP or Email

`;

content = content.substring(0, injectIndex) + newEndpoints + content.substring(injectIndex);

fs.writeFileSync(targetPath, content, 'utf-8');
console.log('Successfully wrote updated openapi.yaml to core-service');
