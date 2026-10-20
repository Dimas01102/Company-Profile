# PT Batam Konektra Jaya — API Backend

Laravel API consumed by the [`frontend`](../frontend) TanStack Start app.
Visitors have no account; the only authenticated role is **Admin**
(bearer-token auth via Laravel Sanctum).

## Status

**Backend Phase 1 — done:** project skeleton, environment/database config,
API routing structure, admin authentication (login/logout/me/profile/
password), authorization guard, validation, centralized error handling,
and the standard API response envelope (`App\Support\ApiResponse`).

Later phases (Company Profile, Catalog, News, Gallery/Banners, Inquiries,
Settings/Activity Logs, integration/security hardening) are not built yet
— see `routes/api.php` for where each one will register its routes.

## Setup

This code was written by hand in a sandboxed environment with **no access
to Packagist**, so `composer install` has not been run here and the app
has not been booted or tested end-to-end. Do this on your own machine or
CI:

```sh
composer install
cp .env.example .env
php artisan key:generate

# Point .env at a real MySQL database, then:
php artisan migrate --seed
php artisan storage:link

php artisan serve
```

Default seeded admin account (**change the password immediately** after
your first real deploy):

- Email: `admin@batamkonektrajaya.co.id`
- Password: `Konektra#2026`

## Conventions

- Every response is JSON in one envelope shape — see `App\Support\ApiResponse`.
- Integer (not bigint) primary/foreign keys throughout — see `database/README.md`.
- No Super Admin, no customer accounts — Admin is the only authenticated role.
- Draft/Archived content must never be returned from a public (non-`/admin`)
  endpoint — enforced per-controller as each content module is built.
