# TASKS

Source: `doc/PLANS.md`

Checked against current admin app implementation on `2026-03-21`.

## Phase 1 - Core Admin (Order & Payment Ready)

Goal: Enable admins to manage users, cars, orders, and payments so the platform can launch and generate revenue.

### 1. Authentication & Roles

- [x] Implement secure admin login
- [x] Implement role-based access for Super Admin and Operations Admin
- [ ] Implement password reset and session management

### 2. Admin Dashboard

- [x] Show total users
- [x] Show total cars across API and manual sources
- [x] Show total orders
- [x] Show total revenue
- [x] Show pending orders
- [x] Show recent activity log

### 3. User Management

- [x] View users
- [x] Search users
- [x] View user profiles
- [x] View user order history
- [x] Activate users
- [x] Deactivate users

### 4. Car Listings Management

#### API-Based Listings

- [x] View API cars
- [x] Search API cars
- [x] Filter API cars
- [x] Feature listings
- [ ] Hide listings

#### Manual Car Listings

- [x] Add cars manually
- [ ] Edit existing cars
- [x] Upload images
- [x] Set price
- [x] Set condition
- [x] Set location
- [x] Set availability
- [x] Feature cars
- [x] Deactivate cars

### 5. Order Management

- [x] View all orders
- [x] Support order statuses: Pending, Paid, Cancelled
- [x] Cancel orders
- [x] Add internal admin notes

### 6. Payment Management

- [x] View transactions
- [x] Track payment status
- [x] Initiate refunds

### 7. Basic Notifications

- [ ] Send email on order placed
- [ ] Send email on payment confirmation

## Notes

- Notification sending is backend-owned. The admin app currently provides notification listing and pagination, but not the outbound email delivery flow itself.
- Vehicle editing and hide/unhide remain blocked by the current seller-vehicle endpoint shape exposed in `lib/api/endpoints.ts`.
- Password reset/session management UI is still not implemented in the app.
