# 🚀 Vouchiqo | Verified Deals. Real Savings.

Vouchiqo is a high-performance, verified coupon marketplace and merchant growth platform. It bridges the gap between bargain-seeking customers and partner brands by guaranteeing **100% active, fraud-proof promotions** and delivering real-time checkout conversion metrics.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Core Framework** | Next.js 16.2 (Turbopack) | Server-Side Rendering (SSR) & optimized API Route endpoints. |
| **UI Library** | React 19 & Tailwind CSS v4 | Declarative components and modern styling system. |
| **Authentication** | Better Auth v1.6 | Cryptographically secure OTP authentication, sign-ins, and Role-Based Access Control (RBAC). |
| **Database** | MongoDB & Mongoose | Document store for coupons, merchant profiles, claims, and redemptions. |
| **Caching / Locks** | Redis & ioredis | Cache storage (stale-time optimizations) & lock manager for anti-fraud control. |
| **Task Queue** | BullMQ | Asynchronous, decoupled background tasks (e.g. tracking analytics views, sending Resend emails). |
| **Email Service** | Email (Resend) | OTP codes and transactional account communication. |
| **Media Host** | Cloudinary | Asset delivery (merchant brand logos, campaign headers). |
| **Linter / Formatter** | Biome v2 | Fast code formatting, syntax checking, and package audits. |

---

## 📂 Directory Structure

The project follows a modular architecture separating public routes, domain features, schema services, and background workers:

```
Vouchiqo/
├── app/                      # Next.js App Router (Pages, layouts, and API endpoints)
│   ├── (coupons)/            # Public Deals listing & Single Coupon detail pages
│   ├── (public)/             # Landing page, revival campaigns page
│   ├── admin/                # Admin Moderator views (Merchant approvals, featured, banners)
│   ├── api/                  # Server API endpoints (claims, auth, coupons, redemptions, banners)
│   ├── auth/                 # Account forms (Login, Register, OTP verification)
│   ├── customer/             # Customer dashboard (Saved deals, savings metrics, wallet)
│   └── merchant/             # Merchant portal (Coupons creation, live analytics, settings)
├── components/               # Shared global UI elements (Navbar, Footer, CouponCard)
│   └── ui/                   # Radix-based UI components (Accordion, dialog, inputs, buttons)
├── features/                 # Domain-specific logic & custom hooks
├── hooks/                    # Global React hooks (location, interests)
├── lib/                      # Core singleton setups (mongodb, redis, better-auth, logger)
├── modules/                  # Schema definition and database service layer
│   ├── claim/                # User Claims services & MongoDB aggregations
│   ├── coupon/               # Coupon lifecycle models and service files
│   ├── merchant/             # Merchant registration and profile management
│   ├── redemption/           # Double-redemption locking and calculated savings
│   └── user/                 # User settings and profile tables
├── scripts/                  # Seeding & Diagnostic files
├── utils/                    # Global constants, helpers, and schemas
└── workers/                  # BullMQ background workers (e.g. analytics processor)
```

---

## 🔄 Core Flows

### 1. Merchant Registration & Onboarding Lifecycle

Merchants go through a multi-step onboarding wizard to register their business. Until they are fully approved by an Admin, their system role is constrained to safeguard the platform.

```mermaid
sequenceDiagram
    autonumber
    actor Merchant
    participant Frontend as Profile Wizard (/merchant/profile)
    participant API as Onboarding API
    participant DB as MongoDB Collections
    participant Admin as Admin Panel

    Merchant->>Frontend: Fills Step 1: Legal Identity & Brand Name
    Merchant->>Frontend: Fills Step 2: Location, Google Maps Link, Upload Logo & Banner (Cloudinary)
    Merchant->>Frontend: Fills Step 3: PAN, GSTIN / Declarations
    Merchant->>Frontend: Fills Step 4: Bank Account Typology & Upload Cancelled Cheque
    Merchant->>Frontend: Submit Profile Form
    Frontend->>API: PUT /api/merchant/onboard
    API->>DB: Save Merchant details (status = "pending", isVerified = false)
    API->>DB: Force User collection role to "customer" (restricted)
    API-->>Frontend: Onboarding complete. Redirect to wait screen
    Note over Merchant: Merchant views "Account Under Review" screen. Cannot list coupons.

    Admin->>AdminPanel: View approvals at /admin/approvals/merchants
    Admin->>AdminPanel: Approve Merchant
    AdminPanel->>API: PUT /api/admin/merchants/approve
    API->>DB: Update Merchant status -> "approved", isVerified -> true
    API->>DB: Promote User collection role -> "merchant" (unlock dashboard)
    API-->>AdminPanel: Done
```

*   **Role Downgrade Guard:** If an approved merchant updates their statutory details, the system resets their profile status to `"pending"`, updates `isVerified` to `false`, and demotes their user account role back to `"customer"` to trigger re-verification.

---

### 2. Premium Subscription Plan Gating

The features available to merchants are determined by their active subscription plan:

```mermaid
flowchart TD
    subgraph Subscription Plans
        Plan[Active Plan] -->|Starter| Starter[Starter Plan]
        Plan -->|Growth| Growth[Growth Plan]
        Plan -->|Pro| Pro[Pro Plan]
        Plan -->|Enterprise| Enterprise[Enterprise Plan]
    end

    subgraph Limits & Gating
        Starter -->|Limit: 3 Active Coupons| Gate1[No Campaign Manager Access]
        Growth -->|Limit: 10 Active Coupons| Gate2[Campaign Manager Unlocked]
        Pro -->|Unlimited Coupons| Gate3[Auto Featured Placements + analytics]
        Enterprise -->|Unlimited Coupons| Gate4[Premium Homepage Slider Slot Boosts]
    end
```

---

### 3. Customer Feed, Claim & Redemption Flow

Customers browse offers customized to their interests and redeem them securely:

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Frontend as Homepage / Deals Feed
    participant API as Claims / Redemptions API
    participant Redis as Redis lock
    participant DB as MongoDB Collections

    Note over Customer: Location-based filtering (e.g. Ranchi / online) & Interest Tags (Confetti celebrations)
    Customer->>Frontend: Click "Claim Voucher"
    Frontend->>API: POST /api/claims
    API->>DB: Verify Coupon is active, verified, and not expired
    API->>DB: Create Claim record & increment totalClaims counter
    API-->>Frontend: Return Unique Claim ID & Promo Code
    Frontend-->>Customer: Display Code in Modal

    Customer->>Frontend: Click "Redeem Coupon" (checkout)
    Frontend->>API: POST /api/redemptions
    API->>Redis: Acquire Lock: claim_lock:{userId}:{couponId} (Anti-Fraud)
    alt Lock Acquired
        Redis-->>API: Success
        API->>DB: Calculate Savings & create Redemption record
        API->>DB: Update Claim status to "REDEEMED"
        API->>DB: Increment totalRedemptions & Add to User Lifetime Savings
        API->>Redis: Release Lock
        API-->>Frontend: Return success
        Frontend-->>Customer: Apply discount & trigger Confetti Milestones
    else Lock Failed
        Redis-->>API: Conflict (Redemption in progress)
        API-->>Frontend: Error: 409 Conflict
        Frontend-->>Customer: Toast: "Redemption in progress. Please wait."
    end
```

---

### 4. Dynamic Homepage Banner Curation Flow

Homepage slides (Left Hero Carousel and Right Promo Cards) are fully database-driven and cached in Redis.

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant Panel as Admin Banners (/admin/banners)
    participant API as Admin Banners API
    participant Redis as Redis Cache
    participant DB as MongoDB (promo_banners)
    participant User as Visitor Browser

    Admin->>Panel: Fills banner form (Title, Image, Link, Slot, isPaid)
    Admin->>Panel: Click "Add Banner"
    Panel->>API: POST /api/admin/banners
    API->>DB: Insert new PromoBanner document
    API->>Redis: DEL key "home:banners" (Invalidate Cache)
    API-->>Panel: Success reload

    User->>UserBrowser: Loads homepage
    UserBrowser->>API: GET /api/banners
    API->>Redis: Check key "home:banners"
    alt Cache Miss
        Redis-->>API: Miss
        API->>DB: Query active/scheduled banners sorted by priority
        DB-->>API: Banners array
        API->>Redis: Setex "home:banners" (300s TTL)
    else Cache Hit
        Redis-->>API: Return cached banners
    end
    API-->>UserBrowser: Return Banners Array
    Note over UserBrowser: If banners array is empty, fallback to default static slides.<br/>If banner has isPaid: true, overlay a "Sponsored" tag.
```

---

### 5. Async Analytics view-tracking (BullMQ)

To prevent tracking lookups from blocking API response times, analytics view counts are executed in the background.

```mermaid
flowchart LR
    A[Customer Views Coupon] --> B(API Endpoint)
    B -->|Return Coupon Details| C[Customer Screen]
    B -->|Decoupled Dispatch| D(BullMQ analyticsQueue)
    D -.-> E[Redis Queue Buffer]
    E -.-> F[analytics.worker.js]
    F -->|findByIdAndUpdate $inc: viewCount| G[(MongoDB)]
```

---

## 🔒 Fraud Protection & Locks

To prevent concurrent API requests from claiming/redeeming a coupon multiple times (e.g. race conditions), Vouchiqo employs **Redis locks**:
* Before performing redemptions, the API runs `acquireLock` via Redis.
* If a duplicate request arrives before the first db transaction completes, it is instantly blocked with a `409 Conflict` response.
* Locks automatically expire after 10 seconds to avoid deadlocks.

---

## 🚀 Advanced Database Optimizations

We bypass standard Mongoose populated objects for high-frequency user endpoints, eliminating the **N+1 query problem**:
* **Aggregation Pipelines**: List endpoints (like `/api/claims` and `/api/redemptions`) use native MongoDB `$lookup` stages to join related `coupons` and `merchants` directly on the database cluster, returning joined payloads in a single roundtrip.
* **Lean Queries**: Queries leverage Mongoose `.lean()` to load raw, lightweight JSON documents instead of heavy hydrated model instances, boosting read performance.

---

## 💻 Local Development Setup

### 1. Environment Configuration
Create a `.env` file in the project root:

```ini
# Server
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (MongoDB)
MONGODB_URI=mongodb://username:password@your-shard.mongodb.net:27017/vouchiqo?ssl=true&replicaSet=atlas-shard-0&authSource=admin

# Redis
REDIS_URL=redis://default:password@your-redis-host.io:12860

# Better Auth
BETTER_AUTH_SECRET=your_32_character_hex_secret
BETTER_AUTH_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Resend (Email)
RESEND_API_KEY=re_your_api_key
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Seeding
To populate your database with approved merchants, categories, and test coupons, run the seeder (it imports a custom ESM resolver for paths aliases):
```bash
node --import ./scripts/alias-register.mjs scripts/seed.mjs
```

### 4. Running the App
Start both your development server and the background analytics worker:

```bash
# Terminal 1: Next.js dev server
npm run dev

# Terminal 2: BullMQ background consumer
node workers/analytics.worker.js
```

---

## 🔑 Test Credentials (Seeded Accounts)

| Role | Email Address | Password | Key Actions to Test |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@vouchiqo.com` | `Admin@123!` | Moderate merchants at `/admin/approvals/merchants`<br>Moderate revival requests at `/admin/revivals`<br>Manage featured deals at `/admin/featured`<br>Manage users at `/admin/users`<br>Configure Dynamic Carousels at `/admin/banners` |
| **Merchant** | `merchant@vouchiqo.com` | `Merchant@123!` | Create a new coupon at `/merchant/coupons/new`<br>View sales analytics at `/merchant/dashboard` and `/merchant/analytics` |
| **Customer** | `customer@vouchiqo.com` | `Password123!` | Filter deals by keyword or location ("Arrah", "Patna", "Delhi") at `/deals`<br>Claim coupons and view saving summaries in `/customer/dashboard` |
"# vouchiqo-new" 
