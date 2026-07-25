# Sharuu Universal Commerce V5 — Full-Stack JavaScript

React + JavaScript storefront and admin panel with a Node.js + Express + MySQL backend.

## V5 improvements

- Homepage New Arrivals is now an admin-controlled model/campaign image gallery, not product cards.
- Global route scroll restoration opens product/category/pages at the top.
- Facebook, Instagram and WhatsApp links in desktop footer and mobile menu.
- Admin Settings supports adding, disabling and removing any number of social links.
- Product images can be added either by device upload or direct HTTP/HTTPS image URL.
- Smaller laptop/desktop primary product image with hover zoom.
- Checkout quantity controls and selected Color/Size/Age display.
- Required checkout fields: name, address, phone, shipping area and payment method.
- Store brand/name links to the homepage.
- All active menu categories appear in the desktop menu; mobile drawer includes categories, subcategories and social links.
- Footer content is controlled from Admin Settings.
- Smart printable admin invoice with Print / Save PDF.
- Order tracking accepts either Order Number or Phone Number.

## Stack

- React 18 + JavaScript / JSX
- Vite
- Node.js + Express
- MySQL / MariaDB
- bcrypt admin passwords
- HTTP-only JWT cookie
- Multer image uploads

## Quick start

```bash
npm install
```

Copy `.env.example` to `.env`, import `sharuu-fullstack-v5-complete.sql` in phpMyAdmin, then run:

```bash
npm run dev:all
```

- Website: `http://localhost:5173`
- API: `http://localhost:5000/api`
- Health check: `http://localhost:5000/api/health`
- Admin: `http://localhost:5173/admin-access/store-admin`
- Email: `admin@demo.com`
- Password: `admin123`

## Existing database migration

For an existing Sharuu full-stack database:

```bash
npm run db:migrate:v5
```

This keeps existing products and orders, adds any required V5 order token field, and merges missing footer/social/model-gallery settings.

For a database where the original V5 SQL is already imported, the optional
idempotent SQL upgrade for dynamic social links and image URLs is:

```text
server/sql/2026-07-26-dynamic-socials-product-image-url.sql
```

It does not add or replace tables/columns; both features use the existing JSON
data fields.

## Build verification

```bash
npm run check:server
npm run build
```

## Production note

A Node.js-capable hosting plan is required. Set production environment variables, build the frontend, and start Express:

```bash
npm run build
npm start
```
