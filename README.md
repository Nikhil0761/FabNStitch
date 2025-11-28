# Bespoke Blazers - Custom Tailoring Website

A comprehensive monolithic web application for a custom blazer tailoring business. The platform manages the complete lifecycle from customer measurements to doorstep delivery.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Express](https://img.shields.io/badge/Express-4.x-blue)
![SQLite](https://img.shields.io/badge/SQLite-3-lightblue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Features

### 🛍️ Customer Portal
- **Browse Fabrics**: Explore premium fabric collection with detailed information
- **Order Tracking**: Real-time order status updates with tracking ID
- **Product Reviews**: View and submit reviews for completed orders
- **Order History**: Complete history of all orders placed
- **Support Tickets**: Create and manage support requests
- **Profile Management**: Update personal information and view measurements

### ✂️ Tailor Dashboard
- **Work Queue**: Orders organized by status for efficient workflow
- **Order Management**: View order details and customer measurements
- **Status Updates**: Update order status (pending → delivered)
- **Measurement Reference**: Access customer measurements for precision tailoring
- **Fabric Information**: View available fabrics and stock levels

### 👨‍💼 Admin Panel
- **Complete Control**: Full administrative privileges
- **Customer Management**: Register customers and record measurements
- **Order Creation**: Generate orders with unique tracking IDs
- **User Management**: Create/manage admin, tailor, and customer accounts
- **Fabric Inventory**: Add, edit, and manage fabric stock
- **Support Management**: Handle customer support tickets
- **Review Moderation**: Approve or reject customer reviews

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: SQLite (with better-sqlite3)
- **Templating**: EJS
- **Session Management**: express-session with SQLite store
- **Authentication**: bcryptjs for password hashing
- **Frontend**: Vanilla JavaScript, Custom CSS

## Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone/Navigate to the project**
   ```bash
   cd tailor-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize the database**
   ```bash
   npm run init-db
   ```
   This creates the SQLite database with tables and sample data.

4. **Start the server**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Main Website: http://localhost:3000
   - Admin Dashboard: http://localhost:3000/admin
   - Tailor Dashboard: http://localhost:3000/tailor
   - Customer Dashboard: http://localhost:3000/customer

## Default Login Credentials

| Role     | Email                        | Password    |
|----------|------------------------------|-------------|
| Admin    | admin@tailorboutique.com     | admin123    |
| Tailor   | tailor@tailorboutique.com    | tailor123   |
| Customer | customer@example.com         | customer123 |

## Project Structure

```
tailor-website/
├── database/               # SQLite database files
├── models/
│   └── database.js        # Database connection
├── public/
│   ├── css/
│   │   ├── style.css      # Main styles
│   │   ├── auth.css       # Authentication pages
│   │   └── dashboard.css  # Dashboard styles
│   └── js/
│       └── main.js        # Client-side JavaScript
├── routes/
│   ├── admin.js           # Admin routes
│   ├── api.js             # API endpoints
│   ├── auth.js            # Authentication routes
│   ├── customer.js        # Customer routes
│   └── tailor.js          # Tailor routes
├── scripts/
│   └── init-db.js         # Database initialization
├── views/
│   ├── admin/             # Admin templates
│   ├── auth/              # Login/Register templates
│   ├── customer/          # Customer templates
│   ├── partials/          # Reusable components
│   ├── tailor/            # Tailor templates
│   ├── error.ejs          # Error page
│   └── home.ejs           # Homepage
├── package.json
├── server.js              # Application entry point
└── README.md
```

## Order Workflow

1. **Customer Registration**: Customer creates an account
2. **Measurement Recording**: Admin records customer's measurements
3. **Order Creation**: Admin creates order and generates tracking ID
4. **Fabric & Tailor Assignment**: Admin assigns fabric and tailor
5. **Production Tracking**: Tailor updates status through stages:
   - Pending → Confirmed → Measuring → Cutting → Stitching → Finishing → Quality Check → Ready
6. **Delivery**: Order shipped and delivered to customer
7. **Review**: Customer can submit review after delivery

## Order Statuses

| Status | Description |
|--------|-------------|
| `pending` | Order created, awaiting confirmation |
| `confirmed` | Order confirmed, ready to start |
| `measuring` | Taking/verifying measurements |
| `cutting` | Fabric being cut |
| `stitching` | Blazer being stitched |
| `finishing` | Final touches and details |
| `quality_check` | Quality inspection |
| `ready` | Ready for delivery |
| `shipped` | Out for delivery |
| `delivered` | Delivered to customer |
| `cancelled` | Order cancelled |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fabrics` | List available fabrics |
| GET | `/api/fabrics/:id` | Get fabric details |
| GET | `/api/orders/:orderId/status` | Get order status |
| GET | `/api/customers/:id/measurements` | Get customer measurements |

## Environment Variables

Create a `.env` file for custom configuration:

```env
PORT=3000
SESSION_SECRET=your-secret-key
```

## Development

```bash
# Install dependencies
npm install

# Initialize database with sample data
npm run init-db

# Start development server with nodemon
npm run dev
```

## Sample Fabrics Included

- Italian Wool (Charcoal Grey)
- English Tweed (Brown, Herringbone)
- Silk Blend (Navy Blue)
- Linen Cotton (Beige)
- Velvet (Burgundy)
- Cashmere Wool (Black)
- Prince of Wales Check (Grey)
- Pinstripe (Dark Navy)

## License

MIT License - feel free to use for your own projects!

## Support

For questions or issues, please create a support ticket through the application or contact the development team.

---

Built with ❤️ for bespoke tailoring

