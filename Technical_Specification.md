# EcoTrack: Technical Specification & Architecture

## 1. System Architecture Overview
The EcoTrack platform utilizes a robust split infrastructure to decouple the high-performance user interface from the complex real-time computational backend. It follows an N-Tier architecture integrating a client-side module, a RESTful/WebSocket processing server, and an immutable data persistence layer.

## 2. Technology Stack Breakdown
*   **Frontend Ecosystem**: 
    *   **Next.js 14 (App Router)**: Orchestrates server-side rendered (SSR) React components optimizing SEO and initial load times.
    *   **Tailwind CSS**: Executes a highly standardized B2B Corporate aesthetic (Navy/Green palettes) through atomic utility classes, strictly adhering to an enterprise glassmorphic design token format.
    *   **TypeScript**: Instills strict typings across the client to mitigate runtime anomalies.
*   **Backend Engine**: 
    *   **Node.js & Express.js**: Handles intense transactional I/O operations and API endpoints.
    *   **Socket.IO**: Maintains persistent, low-latency duplex channels to transmit real-time geolocation coordinates from collectors to clients.
*   **Data & Persistence**:
    *   **PostgreSQL**: Primary transactional database engineered for complex spatial queries and high-concurrency wallet locking.
    *   **Prisma ORM**: Modern database mapping facilitating strictly typed SQL migrations and query validation.

## 3. Core Modules
1.  **Authentication & Security Matrix**:
    *   Stateless JWT (JSON Web Tokens) handling distinct role-based access controls (`USER`, `COLLECTOR`, `ADMIN`).
2.  **Dispatch & Routing Engine**:
    *   Intertwines with **Google Maps API** for automated reverse-geocoding, pickup routing, and immediate ETA calculations for active transit pickups.
3.  **Financial / Wallet Ecosystem**:
    *   Native digital wallet integration leveraging **Paystack/Flutterwave** infrastructure. Employs localized immutable ledgers limiting floating anomalies during cash-ins, dispatch settlements, and refunds.
4.  **Reward & Gamification Pipeline**:
    *   Algorithmic generation of `RewardPoints` triggered post-completion. Interfaces natively with third-party telco APIs for data/airtime redemption operations.
5.  **Dynamic CMS (Headless Integration)**:
    *   A strictly decoupled Admin CMS that feeds rich corporate schema directly into frontend server components, bridging marketing efforts with zero codebase redeployments.

## 4. Infrastructure & Deployment Topology
*   **Client Node**: Deployed natively globally via **Vercel** Edge Networks.
*   **Application Server**: Orchestrated on persistent computing structures (**Render / Railway**) protecting WebSocket longevity and preventing cold-start failures.
*   **Storage**: Managed PostgreSQL deployments via **Supabase/Neon** with daily automated snapshot rollbacks.
