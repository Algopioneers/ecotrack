# EcoTrack - Smart Waste Management Platform

EcoTrack is a high-end, modern SaaS platform for smart waste management. The platform connects households & businesses with reliable waste collectors using technology.

## 🚀 Features

### User Features
- **Account Management**: Sign up, login, and profile management
- **Schedule Pickup**: Request waste collection with flexible scheduling
- **Real-time Tracking**: Track collector location in real-time
- **Digital Payments**: Pay with card, bank transfer, wallet, or USSD
- **Notifications**: Receive alerts for pickup status and reminders
- **Rewards System**: Earn points for eco-friendly actions

### Collector Features
- **Job Management**: Accept and manage pickup requests
- **Navigation**: Integrated Google Maps for routing
- **Earnings Dashboard**: Track daily and monthly earnings
- **Real-time Location**: Share location with users

### Admin Features
- **Dashboard Analytics**: View platform metrics and trends
- **User Management**: Manage users and collectors
- **Revenue Tracking**: Monitor platform revenue
- **Performance Metrics**: Track collector performance
- **Feature Management**: Create and manage landing page features/CTAs

### Digital Economy & Rewards
- **Cashback System**: Earn up to 10% cashback on payments based on tier
- **Refer & Earn**: Share referral codes, earn bonus points
- **Reward Tiers**: Bronze, Silver, Gold, Platinum with increasing benefits
- **Easy Redemption**: Convert points to airtime, wallet credit, or discounts
- **Admin Controls**: Configure tiers, cashback rates, referral bonuses

### AI Support Chatbot
- **24/7 Automated Support**: Instant responses to common questions
- **Smart Routing**: Automatically escalate to human agents when needed
- **Contextual Suggestions**: Quick reply buttons for common queries
- **Conversation History**: Track support interactions
- **Rating System**: Users can rate their support experience

### PWA Features
- **Install Prompt**: Smart banner encouraging app installation
- **Offline Support**: Service worker caches essential assets
- **Push Notifications**: Real-time alerts for pickups and updates
- **Home Screen Icon**: Prominent EcoTrack branding
- **App Shortcuts**: Quick access to key features

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite (dev) / PostgreSQL (production)
- **ORM**: Prisma
- **Real-time**: Socket.IO
- **Validation**: Zod
- **Authentication**: JWT

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React Hooks
- **Real-time**: Socket.IO Client

### External Services
- **Payments**: Paystack / Flutterwave
- **Maps**: Google Maps API
- **Notifications**: Firebase Cloud Messaging

## 📁 Project Structure

```
ecotrack/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── src/
│   │   ├── controllers/        # Route controllers
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utilities
│   │   └── server.ts          # Entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js app router
│   │   │   ├── user/          # User dashboard
│   │   │   └── admin/         # Admin dashboard
│   │   ├── components/       # React components
│   │   ├── styles/            # Global styles
│   │   ├── hooks/             # Custom hooks
│   │   └── lib/               # Utilities
│   ├── package.json
│   └── tailwind.config.js
└── docs/                      # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- SQLite (built-in) or PostgreSQL

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Generate Prisma client:
```bash
npm run prisma:generate
```

5. Run database migrations:
```bash
npm run prisma:migrate
```

6. Start development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open http://localhost:3000

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile

### Pickups
- `POST /api/pickups` - Create pickup request
- `GET /api/pickups` - Get user's pickups
- `GET /api/pickups/:id` - Get pickup details
- `PATCH /api/pickups/:id` - Update pickup

### Payments
- `POST /api/payments/initialize` - Initialize payment
- `GET /api/payments/verify` - Verify payment
- `POST /api/payments/wallet/topup` - Top up wallet
- `GET /api/payments/wallet` - Get wallet balance
- `GET /api/payments/history` - Payment history

### Tracking
- `GET /api/tracking/collector/:id/location` - Get collector location
- `GET /api/tracking/route` - Get route between points

### Admin
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/analytics/revenue` - Revenue analytics
- `GET /api/admin/users` - User management

## 💰 Pricing

### Household
- Basic pickup: ₦1,000 - ₦2,000
- Bulk pickup: ₦3,000 - ₦10,000

### Business
- Small business: ₦10,000 - ₦30,000/month
- Medium business: ₦50,000 - ₦150,000/month
- Large business: ₦300,000+/month

## 🎯 Revenue Model

- **Subscription Plans**: Monthly/annual subscriptions
- **Per-Pickup Commission**: Platform fee per transaction
- **Premium Services**: Priority scheduling, special handling
- **Corporate Licensing**: B2B software licensing

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on sensitive endpoints
- Input validation with Zod
- Helmet.js security headers
- CORS configuration

## 📱 Environment Variables

### Backend (.env)
```
DATABASE_URL=file:./dev.db
JWT_SECRET=your-secret-key
PAYSTACK_SECRET_KEY=your-paystack-key
GOOGLE_MAPS_API_KEY=your-maps-key
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## 📄 License

MIT License - See LICENSE file for details.

## 👥 Authors

EcoTrack Team

## 🙏 Acknowledgments

- Next.js Team
- Prisma Team
- Tailwind CSS
- Paystack
- Flutterwave
