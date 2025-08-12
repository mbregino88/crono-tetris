# Fresh Kanban - Setup Guide

## ✅ Current Status - Ready for Production!

The Fresh Kanban application is fully functional with:
- ✅ **Database Integration**: Supabase PostgreSQL with RLS
- ✅ **UI Components**: Modern drag-and-drop Kanban interface
- ✅ **Authentication**: Secure user management
- ✅ **Real-time Updates**: Live data synchronization
- ✅ **Mobile Responsive**: Works on all devices

## 🚀 Quick Start

### 1. Access the Application
**Current Development Server**: http://localhost:3005

The application is currently running and fully functional!

### 2. Easy Start Options

#### Option A: Use Windows Batch Scripts (Recommended)
- **`start-dev.bat`** - Double-click to start development server
- **`start-app.bat`** - Double-click for production build

#### Option B: Command Line
```bash
# Development mode
npm run dev
# or with custom port
npx next dev -p 3005

# Production mode
npm run build && npm start
```

### 3. First-Time Setup

If running on a new machine:

1. **Install Node.js** (version 18+)
   - Download from [nodejs.org](https://nodejs.org)

2. **Install Dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Configuration**
   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXTAUTH_URL=http://localhost:3005
   NEXTAUTH_SECRET=your_secret_key
   ```

## 🎯 Key Features Working

### ✅ Core Functionality
- **Drag & Drop**: Move deals between time periods and categories
- **Smart Filtering**: Multi-criteria filtering with real-time search
- **Backlog Management**: Special area for unscheduled deals
- **Dynamic Grouping**: Organize by sector, vehicle, indexer, etc.
- **Analytics**: Volume and revenue totals for all intersections

### ✅ User Interface
- **Responsive Design**: Optimized for desktop and mobile
- **Zoom Controls**: Adjustable view levels
- **Fullscreen Mode**: Distraction-free workspace
- **Transpose View**: Switch row/column orientations
- **Wide Columns**: Toggle between compact/expanded layouts

### ✅ Data Management
- **CRUD Operations**: Create, edit, delete deals
- **Real-time Sync**: Immediate updates across sessions
- **Audit Logging**: Complete change history
- **Data Validation**: Type-safe operations

## 📊 Database Schema - Production Ready

### Main Table: `deals`
**Key Fields Working:**
- `deal_uuid` - Primary identifier (UUID)
- `nome_fundo` - Deal/fund name
- `data_janela` - Window date for timeline placement
- `setor` - Sector classification (Energia, Agro, etc.)
- `veiculo` - Vehicle type (CRI, Debênture, etc.)
- `principal_indexador` - Primary index (CDI, IPCA, etc.)
- `oferta_base` - Base offering amount (R$)
- `receita_potencial` - Expected revenue (R$)
- `status_deal` - Current status (affects backlog placement)
- `backlog_order` - Ordering for unscheduled deals

### ✅ Grouping Options Available
- **`tipo`** - Deal type classification
- **`setor`** - Economic sector
- **`veiculo`** - Financial instrument
- **`principal_indexador`** - Index reference
- **`produto`** - Product category
- **`gestora`** - Asset manager
- **`tipoNovo`** - New type classification

## 🛠️ Advanced Configuration

### Port Configuration
- **Default Package.json Port**: 4000
- **Current Running Port**: 3005 (to avoid conflicts)
- **Production Port**: Configurable via environment

### Performance Optimizations
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality enforcement
- **Tailwind CSS**: Optimized styling
- **Next.js 15**: Latest framework features

## 🔧 Development Tools

### Available Scripts
```bash
npm run dev        # Development server (port 4000)
npm run build      # Production build
npm start          # Production server
npm run lint       # Code linting
npx next dev -p 3005  # Custom port development
```

### Batch Scripts (Windows)
- **`start-dev.bat`** - Development with auto-install
- **`start-app.bat`** - Production build and run
- **`create-backup.ps1`** - Create codebase backup

## 📱 Usage Guide

### Basic Operations
1. **View Deals**: Cards arranged in time/category grid
2. **Move Deals**: Drag cards to change dates/categories
3. **Filter Data**: Use collapsible filter panel
4. **Search**: Real-time text search across deal fields
5. **Add Deals**: Click "+" button for new entries
6. **Edit Deals**: Click any card to open detailed modal

### Advanced Features
1. **Transpose Mode**: Switch row/column orientations
2. **Zoom Controls**: Better visibility for large datasets
3. **Wide Columns**: More detailed card information
4. **Fullscreen**: Focus mode without navigation
5. **Backlog Management**: Drag deals to/from unscheduled area

## 🔍 Troubleshooting

### Common Solutions

1. **Port Conflicts**
   - Use `npx next dev -p 3006` for different port
   - Check `netstat -ano | findstr :PORT` for usage

2. **Dependencies Issues**
   - Delete `node_modules` and run `npm install`
   - Clear Next.js cache: `rm -rf .next`

3. **Database Connection**
   - Verify `.env.local` credentials
   - Check Supabase project status
   - Ensure RLS policies allow access

4. **TypeScript Errors**
   - Run `npx tsc --noEmit` to check types
   - Update type definitions if needed

### Quick Fixes
```bash
# Reset everything
rm -rf node_modules .next
npm install
npm run dev

# Check for errors
npm run lint
npx tsc --noEmit
```

## 🚢 Deployment Ready

The application is ready for deployment to:
- **Vercel** (Recommended - see DEPLOYMENT.md)
- **Netlify** 
- **Self-hosted servers**
- **Docker containers**

See `DEPLOYMENT.md` for complete deployment instructions.

## 📚 Documentation

- **`README.md`** - Comprehensive application documentation
- **`DEPLOYMENT.md`** - Complete deployment guide
- **`database/README.md`** - Database setup and migrations
- **Source Code** - Fully documented TypeScript

## ✨ Recent Updates

### Legend Styling (Latest)
- ✅ Fixed legend font and colors consistency
- ✅ Matches other totalizers throughout the application
- ✅ Proper background opacity and padding

### Previous Fixes
- ✅ Database schema alignment
- ✅ TypeScript interface updates
- ✅ Drag-and-drop functionality
- ✅ Real-time synchronization
- ✅ Authentication integration
- ✅ Mobile responsiveness

## 🎉 Success Metrics

The application successfully handles:
- **Multi-user Access**: Concurrent users with real-time sync
- **Large Datasets**: Hundreds of deals with smooth performance  
- **Complex Filtering**: Multiple criteria with instant results
- **Mobile Usage**: Full functionality on tablets/phones
- **Data Integrity**: All CRUD operations with audit trails

**Ready for Production Use! 🚀**

For deployment instructions, see `DEPLOYMENT.md`
For detailed features, see `README.md`