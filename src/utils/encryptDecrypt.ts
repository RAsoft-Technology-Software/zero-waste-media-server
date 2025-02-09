import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const secretKey = crypto.createHash('sha256')
                        .update(String(process.env.SECRET_KEY))
                        .digest('base64')
                        .substr(0, 32); // Ensure 32-byte key

// Helper function to encode Base64 to URL-safe Base64
function encodeBase64UrlSafe(base64: string): string {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '~');
}

// Helper function to decode URL-safe Base64 to standard Base64
function decodeBase64UrlSafe(base64Url: string): string {
    return base64Url.replace(/-/g, '+').replace(/_/g, '/').replace(/~/g, '=');
}

export function encryptData(data: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
    const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
    
    const ivBase64UrlSafe = encodeBase64UrlSafe(iv.toString('base64'));
    const encryptedBase64UrlSafe = encodeBase64UrlSafe(encrypted.toString('base64'));

    return `${ivBase64UrlSafe}|${encryptedBase64UrlSafe}`;
}

export function decryptData(encryptedData: string): string {
    const [ivBase64UrlSafe, encryptedBase64UrlSafe] = encryptedData.split('|');
    if (!ivBase64UrlSafe || !encryptedBase64UrlSafe) {
        throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(decodeBase64UrlSafe(ivBase64UrlSafe), 'base64');
    const encrypted = Buffer.from(decodeBase64UrlSafe(encryptedBase64UrlSafe), 'base64');
    
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    return decrypted.toString('utf8');
}
