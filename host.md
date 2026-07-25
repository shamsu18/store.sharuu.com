# Sharuu Universal Commerce V5 — Hosting Guide

Complete step-by-step instructions for deploying this project to production.

---

## Table of contents

1. [How this app is built](#1-how-this-app-is-built)
2. [Hosting requirements](#2-hosting-requirements)
3. [What you must change before going live](#3-what-you-must-change-before-going-live)
4. [Environment variables reference](#4-environment-variables-reference)
5. [Database setup](#5-database-setup)
6. [Build the project](#6-build-the-project)
7. [Deployment option A — Single Node server (recommended)](#7-deployment-option-a--single-node-server-recommended)
8. [Deployment option B — cPanel / shared hosting (split frontend + API)](#8-deployment-option-b--cpanel--shared-hosting-split-frontend--api)
9. [Reverse proxy examples (Nginx / Apache)](#9-reverse-proxy-examples-nginx--apache)
10. [SSL / HTTPS checklist](#10-ssl--https-checklist)
11. [Admin login URL after deployment](#11-admin-login-url-after-deployment)
12. [File uploads & permissions](#12-file-uploads--permissions)
13. [Post-deployment verification](#13-post-deployment-verification)
14. [Troubleshooting](#14-troubleshooting)
15. [Quick reference — files & settings map](#15-quick-reference--files--settings-map)

---

## 1. How this app is built

This is a **full-stack** application:

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React + Vite | Storefront + admin panel UI |
| Backend | Node.js + Express | REST API, auth, uploads |
| Database | MySQL / MariaDB | Products, orders, settings |

In **production**, the backend can:

- Serve the API at `/api/*`
- Serve uploaded images at `/uploads/*`
- Serve the built frontend from the `dist/` folder (single-server setup)

> **Important:** Netlify / Vercel configs in this repo (`netlify.toml`, `vercel.json`) only deploy the **frontend**. They **cannot** run the Node API or MySQL database by themselves. Use a Node-capable host (VPS, cloud VM, or cPanel with Node.js support).

---

## 2. Hosting requirements

Minimum production requirements:

- **Node.js 20+**
- **MySQL 8+** or **MariaDB 10.6+**
- **512 MB+ RAM** (1 GB recommended)
- **HTTPS** (strongly recommended for admin login cookies)
- Writable folder for uploads: `server/uploads/products/`

Supported deployment styles:

| Style | Best for |
|-------|----------|
| **Option A — Single Node server** | VPS, DigitalOcean, AWS EC2, Railway, Render |
| **Option B — cPanel split deploy** | Shared hosting with Node.js Selector + MySQL |

---

## 3. What you must change before going live

### 3.1 Create your production `.env` file

Copy the example file:

```bash
cp .env.example .env
```

Edit `.env` on the server (never commit this file). Replace every placeholder with your real domain and credentials.

**Example for domain `store.sharuu.com`:**

```env
NODE_ENV=production

VITE_API_URL=https://store.sharuu.com/api
VITE_SERVER_URL=https://store.sharuu.com
PORT=5000

CLIENT_URL=https://store.sharuu.com,https://www.store.sharuu.com

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password

JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
COOKIE_SECURE=true

UPLOAD_BASE_URL=https://store.sharuu.com/uploads
```

### 3.2 Critical rules

| Rule | Why |
|------|-----|
| Set `NODE_ENV=production` | Enables production static file serving and logging |
| Set `COOKIE_SECURE=true` when using HTTPS | Admin login cookies require this on HTTPS sites |
| Use a strong random `JWT_SECRET` | Protects admin sessions |
| Rebuild frontend after changing `VITE_*` vars | Vite bakes `VITE_API_URL` into the build at compile time |
| Use `https://` in all production URLs | Avoid mixed-content and cookie issues |

### 3.3 Where each setting is used

| Variable | Read by | Effect |
|----------|---------|--------|
| `VITE_API_URL` | `src/services/api.js` (at **build** time) | All frontend API calls |
| `VITE_SERVER_URL` | Available for future use / reference | Should match your public site URL |
| `PORT` | `server/config/env.js` → `server/src.js` | Port Express listens on |
| `CLIENT_URL` | `server/config/env.js` → CORS in `server/src.js` | Allowed browser origins for API requests |
| `DB_*` | `server/config/db.js` | MySQL connection |
| `JWT_SECRET` | `server/middleware/auth.js` | Admin JWT signing |
| `COOKIE_SECURE` | `server/middleware/auth.js` | Secure flag on auth cookie |
| `UPLOAD_BASE_URL` | `server/routes/admin.js` | Public URL returned after image upload |

**You normally do NOT edit code** for these — only `.env`.

---

## 4. Environment variables reference

### `VITE_API_URL`

- **File affected at runtime:** `src/services/api.js`
- **Production value:** `https://yourdomain.com/api`
- **When to change:** Before running `npm run build`
- **After change:** Run `npm run build` again

### `CLIENT_URL`

- **File affected:** `server/src.js` (CORS)
- **Production value:** Comma-separated list of allowed frontend origins
- **Example:** `https://store.sharuu.com,https://www.store.sharuu.com`
- **Must include** the exact URL users open in the browser (scheme + domain + port)

### `UPLOAD_BASE_URL`

- **File affected:** `server/routes/admin.js`
- **Production value:** `https://yourdomain.com/uploads`
- **Why:** Product images uploaded in admin get this URL stored in the database

### `JWT_SECRET`

- **File affected:** `server/middleware/auth.js`, `server/routes/auth.js`
- Generate a random string (32+ characters). Example:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### `COOKIE_SECURE`

- **File affected:** `server/middleware/auth.js`
- `true` → cookies only sent over HTTPS (required in production with SSL)
- `false` → only for local HTTP development

---

## 5. Database setup

### Option 1 — Fresh install (recommended for new sites)

1. Create a MySQL database and user in your hosting panel (cPanel → MySQL Databases).
2. Import the full SQL dump via phpMyAdmin:

   **File to import:** `sharuu-fullstack-v5-complete.sql` (project root)

   Or the copy in: `server/sql/sharuu-fullstack-v5-complete.sql`

3. Update `.env` with your database name, user, and password.

4. Default admin credentials after import:

   | Field | Value |
   |-------|-------|
   | Email | `admin@demo.com` |
   | Password | `admin123` |

   **Change these immediately** in Admin → Settings → admin.

### Option 2 — Command-line setup (VPS)

```bash
# Edit .env first, then:
npm run db:setup   # Creates schema from server/sql/sharuu-fullstack-v5.sql
npm run db:seed    # Inserts demo data
```

### Option 3 — Upgrading an existing Sharuu database

```bash
npm run db:migrate:v5
```

This preserves existing products and orders.

---

## 6. Build the project

Run on your local machine or on the server:

```bash
npm install
npm run build
```

This creates the `dist/` folder with the production frontend.

Verify the server starts without syntax errors:

```bash
npm run check:server
```

Start production server locally to test:

```bash
# Ensure .env has NODE_ENV=production
npm start
```

Then open:

- Site: `http://localhost:5000`
- Health: `http://localhost:5000/api/health`

---

## 7. Deployment option A — Single Node server (recommended)

Best for VPS, cloud VMs, Railway, Render, etc.

### Step 1 — Upload project files

Upload the entire project to your server (Git clone or SFTP):

```
sharuu.com/
├── dist/              ← created by npm run build
├── server/
├── node_modules/      ← or run npm install --omit=dev on server
├── package.json
├── .env               ← create on server, never commit
└── ...
```

### Step 2 — Install dependencies on server

```bash
cd /path/to/sharuu.com
npm install --omit=dev
```

### Step 3 — Configure `.env`

Use the production template from [Section 3.1](#31-create-your-production-env-file).

### Step 4 — Import database

Import `sharuu-fullstack-v5-complete.sql` into MySQL.

### Step 5 — Build frontend (if not built yet)

```bash
npm run build
```

> Build on the server **after** setting production `VITE_API_URL` in `.env`, or build locally with production env vars and upload `dist/`.

### Step 6 — Create uploads directory

```bash
mkdir -p server/uploads/products
chmod 755 server/uploads/products
```

### Step 7 — Start the app

```bash
npm start
```

Express listens on `PORT` (default `5000`) and serves:

- `/api/*` — API
- `/uploads/*` — uploaded images
- `/*` — React SPA from `dist/`

### Step 8 — Keep the app running (PM2)

Install PM2:

```bash
npm install -g pm2
pm2 start server/src.js --name sharuu-store
pm2 save
pm2 startup
```

### Step 9 — Point your domain (Nginx reverse proxy)

See [Section 9](#9-reverse-proxy-examples-nginx--apache) for Nginx config.

---

## 8. Deployment option B — cPanel / shared hosting (split frontend + API)

Use this when your host runs the Node API via **CloudLinux Passenger** and serves the frontend from `public_html`.

Example layout (based on `store.sharuu.com`):

| Component | Location | URL |
|-----------|----------|-----|
| Frontend (static) | `public_html/` or `store.sharuu.com/` | `https://store.sharuu.com` |
| Backend (Node) | `store.sharuu.com_backend/` | `https://store.sharuu.com/api` |

### Step 1 — Create MySQL database

In cPanel → **MySQL Databases**:

1. Create database (e.g. `sharuuco_sharuu_universal_store`)
2. Create user and assign ALL PRIVILEGES
3. Import `sharuu-fullstack-v5-complete.sql` via phpMyAdmin

### Step 2 — Deploy the backend

1. Upload the `server/` folder and root `package.json`, `package-lock.json` to your Node app directory (e.g. `/home/username/store.sharuu.com_backend/`).

2. In cPanel → **Setup Node.js App**:
   - Node.js version: **20+**
   - Application root: `/home/username/store.sharuu.com_backend`
   - Application URL: `/api` (or your API path)
   - Startup file: `src.js` (relative to `server/` — adjust based on your host)

3. Create `.env` in the backend root with production values:

```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://store.sharuu.com
DB_HOST=localhost
DB_NAME=sharuuco_sharuu_universal_store
DB_USER=sharuuco_dbuser
DB_PASSWORD=your_password
JWT_SECRET=your-long-random-secret
COOKIE_SECURE=true
UPLOAD_BASE_URL=https://store.sharuu.com/uploads
```

4. Install dependencies:

```bash
cd ~/store.sharuu.com_backend
npm install --omit=dev
```

5. Ensure uploads folder exists and is writable:

```bash
mkdir -p server/uploads/products
chmod 755 server/uploads/products
```

6. Configure Passenger (example from this project):

**File:** `.htaccess` in the backend/API directory

```apache
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION BEGIN
PassengerAppRoot "/home/sharuuco/store.sharuu.com_backend"
PassengerBaseURI "/api"
PassengerNodejs "/home/sharuuco/nodevenv/store.sharuu.com_backend/24/bin/node"
PassengerAppType node
PassengerStartupFile src.js
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION END
```

> Update paths to match your cPanel username and Node version.

### Step 3 — Build and deploy the frontend

On your local machine (with production `VITE_API_URL` set):

```bash
# In .env before building:
# VITE_API_URL=https://store.sharuu.com/api

npm run build
```

Upload **everything inside** `dist/` to your domain's `public_html/` folder.

### Step 4 — SPA routing for React Router

Create or edit `.htaccess` in `public_html/`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

This ensures routes like `/shop`, `/sharu` (admin login), and `/product/slug` work on refresh.

### Step 5 — Serve uploads

Option A — Express serves uploads (if your Node app also handles `/uploads`):

Ensure `UPLOAD_BASE_URL=https://store.sharuu.com/uploads` and Passenger/proxy forwards `/uploads` to Node.

Option B — Symlink or copy uploads to web root:

```bash
ln -s /home/username/store.sharuu.com_backend/server/uploads /home/username/public_html/uploads
```

---

## 9. Reverse proxy examples (Nginx / Apache)

### Nginx (Option A — single Node server on port 5000)

**File:** `/etc/nginx/sites-available/store.sharuu.com`

```nginx
server {
    listen 80;
    server_name store.sharuu.com www.store.sharuu.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name store.sharuu.com www.store.sharuu.com;

    ssl_certificate     /etc/letsencrypt/live/store.sharuu.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/store.sharuu.com/privkey.pem;

    client_max_body_size 12M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/store.sharuu.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Apache reverse proxy (alternative)

```apache
<VirtualHost *:443>
    ServerName store.sharuu.com

    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem

    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:5000/
    ProxyPassReverse / http://127.0.0.1:5000/
</VirtualHost>
```

---

## 10. SSL / HTTPS checklist

When HTTPS is enabled:

- [ ] All URLs in `.env` use `https://`
- [ ] `COOKIE_SECURE=true`
- [ ] `CLIENT_URL` uses `https://yourdomain.com`
- [ ] `VITE_API_URL` uses `https://yourdomain.com/api`
- [ ] `UPLOAD_BASE_URL` uses `https://yourdomain.com/uploads`
- [ ] Rebuild frontend: `npm run build`
- [ ] Restart Node app / PM2

Without HTTPS + `COOKIE_SECURE=true`, admin login may fail silently in production.

---

## 11. Admin login URL after deployment

Admin login is **not** at `/admin` or `/admin/login`.

It uses a custom slug set in:

**Admin → Settings → admin → Admin Login URL Slug**

| Setting value | Login URL |
|---------------|-----------|
| `sharu` | `https://yourdomain.com/sharu` |
| `store-admin` (default) | `https://yourdomain.com/store-admin` |

After deployment:

1. Log in using your custom URL
2. Change the default admin email and password in Settings → admin
3. Set a unique login slug (avoid reserved words: `shop`, `cart`, `admin`, etc.)

Unauthenticated visits to `/admin` redirect to the homepage — this is intentional.

---

## 12. File uploads & permissions

| Path | Purpose | Permission |
|------|---------|------------|
| `server/uploads/products/` | Product images uploaded via admin | Writable by Node process (755 or 775) |

If image uploads fail in production:

1. Check folder exists
2. Check write permissions
3. Check `UPLOAD_BASE_URL` matches your public domain
4. Check reverse proxy `client_max_body_size` (Nginx) allows uploads up to 5 MB

---

## 13. Post-deployment verification

Run through this checklist:

### API health

```bash
curl https://yourdomain.com/api/health
```

Expected:

```json
{"success":true,"data":{"status":"ok","database":"connected"}}
```

### Storefront

- [ ] Homepage loads
- [ ] Shop page loads
- [ ] Product detail pages work
- [ ] Cart and checkout work
- [ ] Order tracking works

### Admin

- [ ] Custom login URL opens login page (e.g. `/sharu`)
- [ ] Login works with admin credentials
- [ ] Dashboard loads at `/admin`
- [ ] Image upload works in product editor
- [ ] Settings save correctly

### Security

- [ ] Default password changed
- [ ] `JWT_SECRET` is unique
- [ ] `.env` is not publicly accessible
- [ ] HTTPS enabled

---

## 14. Troubleshooting

### Blank page after deployment

- Rebuild with correct `VITE_API_URL`: `npm run build`
- Check browser console for API/CORS errors
- Verify SPA `.htaccess` rewrite rules (Option B)

### CORS error: "Origin is not allowed"

- Add your exact site URL to `CLIENT_URL` in `.env`
- Include both `https://domain.com` and `https://www.domain.com` if needed
- Restart Node after changing `.env`

### Admin login fails / session not saved

- Set `COOKIE_SECURE=true` when using HTTPS
- Ensure `CLIENT_URL` matches the URL in the browser
- Ensure API and frontend are on the same domain (or CORS + credentials configured)

### API returns 404 on refresh (shop/product pages)

- Missing SPA rewrite rules — add `.htaccess` or Nginx `try_files` / proxy to `index.html`

### Database connection error

- Verify `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` in `.env`
- On cPanel, use `localhost` for `DB_HOST`
- Confirm user has privileges on the database

### Uploaded images broken

- Check `UPLOAD_BASE_URL` in `.env`
- Verify `/uploads` is reachable in browser
- Check folder permissions on `server/uploads/products/`

### Wrong API URL in network tab

- `VITE_API_URL` is embedded at build time
- Change `.env` → run `npm run build` → redeploy `dist/`

---

## 15. Quick reference — files & settings map

| What | Where to change | When |
|------|-----------------|------|
| API URL for frontend | `.env` → `VITE_API_URL` | Before `npm run build` |
| CORS allowed origins | `.env` → `CLIENT_URL` | Before starting server |
| Database credentials | `.env` → `DB_*` | Before starting server |
| Admin session secret | `.env` → `JWT_SECRET` | Before starting server |
| HTTPS cookies | `.env` → `COOKIE_SECURE=true` | When SSL is active |
| Image public URL | `.env` → `UPLOAD_BASE_URL` | Before starting server |
| Server port | `.env` → `PORT` | Before starting server |
| Admin login slug | Admin panel → Settings → admin | After first login |
| Admin email/password | Admin panel → Settings → admin | After first login |
| Database schema/data | Import `sharuu-fullstack-v5-complete.sql` | Once, before launch |
| Production static files | `npm run build` → `dist/` | Each frontend deploy |
| Node production entry | `npm start` → `server/src.js` | Server start |
| Env loader | `server/config/env.js` | No edit needed |
| API client | `src/services/api.js` | No edit needed (uses env var) |
| Auth cookies | `server/middleware/auth.js` | No edit needed (uses env var) |
| SPA routes (shared host) | `public_html/.htaccess` | Option B deploy |
| Node app (cPanel) | Backend `.htaccess` (Passenger) | Option B deploy |
| Process manager | PM2 / cPanel Node selector | Keep app running |

---

## Deployment command summary

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with production values

# 2. Install
npm install

# 3. Database (choose one)
# Import sharuu-fullstack-v5-complete.sql in phpMyAdmin
# OR: npm run db:setup && npm run db:seed

# 4. Build frontend (VITE_API_URL must be correct first)
npm run build

# 5. Verify
npm run check:server
curl http://localhost:5000/api/health

# 6. Start (Option A)
npm start
# OR with PM2:
pm2 start server/src.js --name sharuu-store
```

---

## Default credentials (change immediately)

| | |
|---|---|
| **Admin email** | `admin@demo.com` |
| **Admin password** | `admin123` |
| **Default login slug** | `store-admin` → `https://yourdomain.com/store-admin` |

---

*Last updated for Sharuu Universal Commerce V5 with custom admin login slug routing.*
