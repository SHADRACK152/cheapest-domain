````markdown
# Laravel & PHP Rebuild Guide for Cheapest Domain App

## 1. Project Structure & Main Features

### A. Core Features
- User authentication (login, signup, logout, session)
- Domain search, registration, transfer, and pricing
- Blog (posts, slugs, admin management)
- Chatbot integration
- Cart and checkout
- Admin dashboard (analytics, users, orders, domains)
- Static pages (about, contact, privacy, terms)
- UI components (navbar, footer, sections, buttons, etc.)

### B. Folder Structure (Next.js → Laravel Mapping)
- `/src/app` → `/resources/views` (Blade templates) + `/routes/web.php` (routes)
- `/src/components` → `/resources/views/components` (Blade components) + `/app/View/Components`
- `/src/contexts` → Service Providers, Middleware, or custom classes in `/app`
- `/src/lib` → `/app/Services` or `/app/Helpers`
- `/src/types` → PHP classes/interfaces in `/app/Models` or `/app/DTOs`
- `/data` → Database tables (migrations, seeders)
- `/public/uploads` → `/public/uploads` (same for assets)

---

## 2. Authentication
- Use Laravel Breeze, Jetstream, or Fortify for user authentication (login, signup, logout, session).
- Protect routes with middleware (`auth`).
- Store user info in the `users` table.

---

## 3. Domain Management
- **Domain Search:** Controller to handle domain search logic (API calls to domain providers).
- **Domain Registration:** Controller for registering domains (API integration).
- **Domain Transfer:** Controller for domain transfer (API integration).
- **Pricing:** Controller/model for domain pricing (fetch from API or store in DB).

---

## 4. Blog System
- **Posts:** `posts` table, Eloquent model, CRUD controllers.
- **Slugs:** Use Laravel route model binding for `/blog/{slug}`.
- **Admin Blog Management:** Admin-only routes for creating/editing/deleting posts.

---

## 5. Chatbot Integration
- Create a chat widget Blade component.
- Backend controller for chat API integration (could use Laravel events, queues for async).

---

## 6. Cart & Checkout
- **Cart:** Store cart in session or DB, manage via controller.
- **Checkout:** Controller for order processing, payment integration if needed.
- **Orders:** `orders` table, Eloquent model, admin management.

---

## 7. Admin Dashboard
- **Analytics:** Controller to gather stats (users, orders, domains).
- **Users:** User management (CRUD).
- **Orders:** Order management.
- **Domains:** Domain management.

---

## 8. Static Pages
- Create Blade views for about, contact, privacy, terms, etc.
- Define routes in `web.php`.

---

## 9. UI Components
- Use Blade components for reusable UI (navbar, footer, buttons, sections).
- Use Laravel Mix/Vite for CSS (Tailwind) and JS assets.

---

## 10. API Integrations
- Use Guzzle HTTP client for external API calls (domain search, registration, etc.).
- Store API credentials in `.env`.

---

## 11. Database
- Use migrations for tables: users, posts, orders, domains, etc.
- Use seeders for initial data (blog posts, pricing).

---

## 12. Environment & Config
- Store API keys, DB credentials, etc. in `.env`.
- Use Laravel config files for app settings.

---

## 13. Routing
- Use `routes/web.php` for web routes.
- Use `routes/api.php` for API endpoints (if needed).

---

## 14. Middleware
- Use middleware for authentication, admin checks, etc.

---

## 15. Validation & Security
- Use Laravel validation for forms.
- CSRF protection is built-in.
- Use policies/gates for authorization.

---

## 16. Deployment
- Use Laravel’s built-in server for development.
- Deploy with Apache/Nginx + PHP-FPM for production.

---

## 17. Additional Notes
- For file uploads (blog images, etc.), use Laravel’s storage system.
- For rich text editing, integrate a JS editor (e.g., Trix, CKEditor) in Blade views.
- For analytics, use Laravel’s query builder/Eloquent to aggregate data.

---

## 18. Step-by-Step Guide

1. Install Laravel:  
   composer create-project laravel/laravel cheapest-domain

2. Set up authentication:  
   php artisan breeze:install  
   php artisan migrate

3. Create models, migrations, controllers for:  
- Users  
- Posts  
- Orders  
- Domains

4. Build Blade views for all pages and components.

5. Implement domain API integration in services/controllers.

6. Set up admin routes and middleware.

7. Implement cart and checkout logic.

8. Integrate chatbot (JS widget + backend endpoint).

9. Add static pages.

10. Style with Tailwind CSS (install via Laravel Mix/Vite).

11. Test all flows: auth, domain search/register/transfer, blog, cart, checkout, admin.

---

If you want a more detailed step-by-step for any specific feature (e.g., domain search, blog, admin dashboard), let me know!
