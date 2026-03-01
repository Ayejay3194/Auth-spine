# Nginx SSL Certificate Directory

This directory is for SSL/TLS certificates in production.

## Development

For development, nginx is not required. Access services directly:
- Business App: http://localhost:3000
- Auth Server: http://localhost:4000

## Production

For production deployments with HTTPS:

### Option 1: Let's Encrypt (Recommended)

```bash
# Install certbot
apt-get install certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certificates will be placed in /etc/letsencrypt/live/yourdomain.com/
# Create symlinks:
ln -s /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./fullchain.pem
ln -s /etc/letsencrypt/live/yourdomain.com/privkey.pem ./privkey.pem
```

### Option 2: Self-Signed (Development/Testing Only)

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./privkey.pem \
  -out ./fullchain.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

### Option 3: Commercial Certificate

Purchase from a Certificate Authority and place:
- `fullchain.pem` - Full certificate chain
- `privkey.pem` - Private key

## Security

- Never commit private keys to version control
- Set proper file permissions: `chmod 600 privkey.pem`
- Rotate certificates before expiration
- Use strong cipher suites (already configured in nginx.conf)
