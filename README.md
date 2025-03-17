# Modern Clothing Store with WhatsApp Integration

A modern, mobile-first clothing store website with comprehensive admin management and WhatsApp integration for seamless product listing and customer interaction.

## Features

- 📱 Responsive mobile-first design
- 🛍️ Dynamic product catalog with filtering
- 🆕 New collection showcase
- 📞 WhatsApp integration for customer inquiries
- 👔 Size and color options for products
- 🎨 Modern, professional UI design
- 📊 Admin panel for product management

## Tech Stack

- **Frontend:**
  - React with TypeScript
  - TanStack Query for data fetching
  - Wouter for routing
  - Shadcn UI components
  - Tailwind CSS for styling

- **Backend:**
  - Express.js server
  - In-memory storage (can be extended to use PostgreSQL)
  - Multer for file uploads
  - Zod for validation

## Prerequisites

- Node.js (v20+ recommended)
- npm or yarn package manager

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd clothing-store
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# WhatsApp Integration
WHATSAPP_PHONE_NUMBER=your_whatsapp_number

# Optional: Database Configuration (if using PostgreSQL)
DATABASE_URL=your_database_url
```

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/          # Utility functions and API client
│   │   └── pages/        # Page components
├── server/                # Backend Express application
│   ├── routes.ts         # API routes
│   └── storage.ts        # Data storage interface
└── shared/               # Shared TypeScript types and schemas
    └── schema.ts         # Data models and validation
```

## Available Routes

- `/` - Home page with product listing
- `/new-collection` - New collection showcase
- `/contact` - Contact information
- `/admin` - Admin panel for product management

## Admin Panel Features

The admin panel allows you to:
- Add new products with multiple images
- Set product details (name, description, category)
- Configure available sizes and colors
- Mark items as part of the new collection
- Manage existing products

### Adding Products

1. Navigate to `/admin`
2. Fill in the product details:
   - Name and description
   - Select category
   - Choose available sizes
   - Select available colors
   - Upload product images (up to 5)
   - Toggle "New Collection" if applicable
3. Click "Add Product" to save

## WhatsApp Integration

The application includes WhatsApp integration for customer inquiries. When customers click the "Inquire on WhatsApp" button on a product:
- A pre-formatted message is generated with product details
- The WhatsApp chat window opens with the store's number
- Customers can easily ask about availability and sizing

## Development Guidelines

- Run tests: `npm test`
- Build for production: `npm run build`
- Start production server: `npm start`

## Style Customization

The application uses a theme configuration in `theme.json`:
- Modify primary colors
- Adjust the theme variant
- Change the appearance mode
- Customize border radius

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
