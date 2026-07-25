# Sharuu V5 — A থেকে Z রান ও আপডেট গাইড

## নতুন project হিসেবে চালানো

### ১. প্রয়োজনীয় software

- Node.js 20+
- XAMPP
- VS Code

```powershell
node -v
npm -v
```

### ২. XAMPP চালু

```text
Apache → Start
MySQL → Start
```

### ৩. phpMyAdmin import

খুলুন:

```text
http://localhost/phpmyadmin
```

Import করুন:

```text
sharuu-fullstack-v5-complete.sql
```

Database:

```text
sharuu_universal_store
```

### ৪. `.env` তৈরি

```powershell
Copy-Item .env.example .env
```

Default local values:

```env
VITE_API_URL=http://localhost:5000/api
PORT=5000
CLIENT_URL=http://localhost:5173,http://127.0.0.1:5173
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=sharuu_universal_store
DB_USER=root
DB_PASSWORD=
JWT_SECRET=replace-with-a-long-random-secret
COOKIE_SECURE=false
UPLOAD_BASE_URL=http://localhost:5000/uploads
NODE_ENV=development
```

### ৫. install ও run

```powershell
npm install
npm run dev:all
```

```text
Website: http://localhost:5173
API: http://localhost:5000
Health: http://localhost:5000/api/health
```

Admin:

```text
URL: http://localhost:5173/admin-access/store-admin
Email: admin@demo.com
Password: admin123
```

---

## আগের full-stack project update করা

1. পুরোনো project ও database backup রাখুন।
2. নতুন ZIP-এর files নতুন folder-এ extract করা সবচেয়ে নিরাপদ।
3. পুরোনো `.env` থেকে DB credentials নতুন `.env`-এ বসান।
4. Existing database-এর জন্য full SQL পুনরায় import করবেন না।
5. চালান:

```powershell
npm install
npm run db:migrate:v5
npm run dev:all
```

`db:migrate:v5` existing product/order delete করে না। Missing V5 settings merge করে।

---

## Admin-এ নতুন control কোথায়

### Model New Arrivals

```text
Admin → Settings → Homepage → New Arrivals Model Gallery
```

Title, subtitle, image URL/upload এবং active status edit করা যাবে। Product এখানে দেখাবে না।

### Footer

```text
Admin → Settings → Footer
```

- Footer description
- Shop column title
- Information column title
- Contact title
- Copyright
- Bottom text
- Invoice note

### Social media

```text
Admin → Settings → Social
```

- Facebook URL
- Instagram URL
- WhatsApp number

এগুলো footer এবং mobile menu—দুই জায়গায় দেখাবে।

### Invoice

```text
Admin → Orders → Invoice
```

Invoice page-এ:

```text
Print / Save PDF
```

Browser print dialog থেকে printer বা `Save as PDF` select করুন।

### Order tracking

Public page:

```text
/track-order
```

একটি field-এ Order Number বা Phone Number দিন।

---

## Build check

```powershell
npm run check:server
npm run build
```

## Production

```env
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
COOKIE_SECURE=true
VITE_API_URL=https://yourdomain.com/api
UPLOAD_BASE_URL=https://yourdomain.com/uploads
```

```bash
npm install
npm run build
npm start
```

Node.js support আছে এমন hosting প্রয়োজন।
