# Fresh Kanban - Deal Management Platform

A professional Kanban board application for managing financial deals and investment opportunities, built with Next.js 15, TypeScript, and Supabase.

## 🚀 Features

### Core Functionality
- **Interactive Kanban Board** - Drag-and-drop deal cards across time periods and categories
- **Dynamic Grouping** - Organize deals by sector, vehicle type, indexer, product, or other criteria
- **Time-based Columns** - Automatic monthly columns based on deal window dates
- **Backlog Management** - Special area for deals without assigned dates
- **Search & Filtering** - Advanced filtering by multiple criteria with real-time search
- **Deal Analytics** - Volume and revenue totals for rows, columns, and individual cells

### User Interface
- **Responsive Design** - Optimized for desktop and tablet use
- **Zoom Controls** - Adjustable zoom levels for better visibility
- **Fullscreen Mode** - Distraction-free viewing experience
- **Transpose View** - Switch between row/column orientations
- **Wide Columns** - Toggle between compact and expanded card layouts
- **Collapsible Filters** - Expandable filter panels to save screen space

### Data Management
- **Real-time Updates** - Live synchronization with Supabase database
- **Audit Logging** - Track all changes to deals with detailed history
- **CRUD Operations** - Create, read, update, and delete deals through intuitive modals
- **Data Validation** - TypeScript interfaces and Zod schemas for data integrity
- **Error Handling** - Comprehensive error boundaries and user feedback

### Authentication & Security
- **Supabase Auth** - Secure user authentication and session management
- **Row Level Security** - Database-level access controls
- **Environment Variables** - Secure configuration management

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React features and improvements
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **dnd-kit** - Modern drag-and-drop functionality

### Backend & Database
- **Supabase** - PostgreSQL database with real-time features
- **Row Level Security** - Database-level access controls
- **RESTful API** - Auto-generated from database schema

### Development Tools
- **ESLint** - Code linting and quality assurance
- **Prettier** - Code formatting (implied)
- **TypeScript Compiler** - Type checking and compilation

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** (version 18.0 or higher)
- **npm** or **pnpm** package manager
- **Supabase Account** - For database and authentication services
- **Modern Web Browser** - Chrome, Firefox, Safari, or Edge

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone [repository-url]
cd fresh-kanban
```

### 2. Install Dependencies
```bash
# Using npm
npm install

# Using pnpm (recommended)
pnpm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Authentication
NEXTAUTH_URL=http://localhost:3005
NEXTAUTH_SECRET=your_nextauth_secret

# Optional: Custom Port
PORT=3005
```

### 4. Database Setup
1. Create a new Supabase project
2. Run the SQL migrations in the `database/` folder
3. Set up Row Level Security policies (see `database/setup-rls-policies.sql`)
4. Import sample data if available

### 5. Run Development Server
```bash
# Using npm
npm run dev

# Using pnpm
pnpm dev
```

The application will be available at [http://localhost:3005](http://localhost:3005)

## 📊 Database Schema

### Main Tables

#### `deals` Table
Core deal information with the following key fields:
- `deal_uuid` - Primary key (UUID)
- `nome_fundo` - Deal/fund name
- `data_janela` - Window date for timeline placement
- `setor` - Sector classification
- `veiculo` - Vehicle type
- `principal_indexador` - Primary indexer
- `oferta_base` - Base offering amount
- `receita_potencial` - Potential revenue
- `status_deal` - Current deal status
- `backlog_order` - Order in backlog when no date assigned

### Key Relationships
- Deals are organized by time periods (monthly columns)
- Grouping fields determine row organization
- Status determines backlog vs. timeline placement

## 🎯 Usage Guide

### Basic Operations

1. **Viewing Deals**
   - Deals appear as cards in a grid layout
   - Rows represent grouping categories (sector, vehicle, etc.)
   - Columns represent time periods (months)
   - Backlog strip shows deals without dates

2. **Moving Deals**
   - Drag cards between cells to change dates/categories
   - Drop cards on backlog to remove date assignments
   - Reorder deals within the backlog by dragging

3. **Filtering Data**
   - Use the collapsible filter panel
   - Select multiple values for each filter type
   - Search by deal name or other text fields
   - Filters apply in real-time

4. **Changing Views**
   - Group by different fields using the dropdown
   - Toggle transpose mode to switch row/column orientation
   - Adjust zoom level for better visibility
   - Enable wide columns for more detailed cards

### Advanced Features

1. **Deal Management**
   - Click "+" to add new deals
   - Click any card to view/edit details
   - Use the modal forms for comprehensive editing
   - Delete deals with confirmation dialogs

2. **Analytics**
   - View totals at row and column intersections
   - Cell summaries show deal count, volume, and revenue
   - Legend explains the totalizer format
   - All amounts formatted in Brazilian Real (R$)

3. **Performance**
   - Zoom controls for better visibility
   - Fullscreen mode removes navigation elements
   - Responsive design adapts to screen size
   - Optimized drag-and-drop with visual feedback

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `NEXTAUTH_URL` | Application base URL | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret key | Yes |
| `PORT` | Development server port | No (defaults to 4000) |

### Customization Options

1. **Grouping Fields** - Modify `GroupingField` type in `src/lib/types.ts`
2. **Color Schemes** - Update color mappings in `src/lib/colors.ts`
3. **Date Formats** - Adjust date utilities in `src/lib/date-utils.ts`
4. **UI Components** - Customize Radix UI components in `src/components/ui/`

## 🚀 Deployment

### Production Build
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Deployment Options

1. **Vercel** (Recommended)
   - Connect GitHub repository
   - Set environment variables
   - Deploy automatically on push

2. **Netlify**
   - Connect repository
   - Configure build settings
   - Set environment variables

3. **Self-hosted**
   - Build production bundle
   - Use PM2 or similar process manager
   - Configure reverse proxy (Nginx/Apache)

### Environment Configuration
Ensure all environment variables are set in your deployment platform.

## 📝 API Reference

### Supabase Integration

The application uses Supabase's auto-generated REST API:

- **GET** `/rest/v1/deals` - Fetch all deals
- **POST** `/rest/v1/deals` - Create new deal
- **PATCH** `/rest/v1/deals?deal_uuid=eq.[id]` - Update deal
- **DELETE** `/rest/v1/deals?deal_uuid=eq.[id]` - Delete deal

### Authentication Endpoints

- **POST** `/api/auth/login` - User login
- **GET** `/api/auth/callback` - OAuth callback
- **POST** `/api/auth/logout` - User logout

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify Supabase credentials in `.env.local`
   - Check Supabase project status
   - Ensure RLS policies are configured

2. **Authentication Issues**
   - Verify `NEXTAUTH_SECRET` is set
   - Check `NEXTAUTH_URL` matches your domain
   - Clear browser cookies and try again

3. **TypeScript Errors**
   - Run `npm run lint` to identify issues
   - Check for missing dependencies
   - Verify type definitions are up to date

4. **Port Conflicts**
   - Default port is 4000, but script runs on 3005
   - Change port in package.json if needed
   - Use `--port` flag to override

### Performance Issues

- Enable wide columns for better card visibility
- Use search/filters to reduce displayed data
- Zoom out for better overview of large datasets
- Clear browser cache if experiencing loading issues

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Code Standards

- Use TypeScript for all new code
- Follow ESLint configuration
- Add proper error handling
- Include JSDoc comments for functions
- Use semantic commit messages

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For technical support or questions:

1. Check this README and documentation
2. Review the `SETUP.md` file for setup issues
3. Check the browser console for error messages
4. Ensure all dependencies are up to date

## 🔄 Version History

- **v0.1.0** - Initial release with core Kanban functionality
- Features drag-and-drop, filtering, search, and basic CRUD operations
- Integrated with Supabase for data persistence and authentication