# Mattter - Fashion Catalyst & Seeker Matching Platform

## 🎯 What is Mattter?

**Mattter** is a revolutionary platform that connects people seeking personal styling and wardrobe transformation (**Seekers**) with professional fashion consultants and stylists (**Catalysts**). Think of it as "Uber for Personal Styling" - a location-based matching service that makes professional fashion consulting accessible, convenient, and personalized.

### The Problem We're Solving

Many people struggle with:
- Finding their personal style and confidence in their appearance
- Not knowing where to start with wardrobe management
- Limited access to affordable, professional styling services
- Difficulty finding stylists who understand their specific needs and budget
- Lack of transparency in pricing and services

For professional stylists:
- Hard to reach potential clients beyond word-of-mouth
- Difficulty showcasing their expertise and portfolio
- Managing bookings and client preferences manually
- Limited visibility in their local market

### The Solution

Mattter bridges this gap by providing:
- **For Seekers**: Easy discovery of nearby catalysts, transparent pricing, preference-based matching, and secure booking system
- **For Catalysts**: Professional profile management, portfolio showcase, booking management, and access to motivated clients

## 💡 Core Concept

### Platform Philosophy

The name "Mattter" reflects our belief that how you present yourself **matters**. We're not just about clothes - we're about confidence, self-expression, and transformation. Every seeker deserves access to professional guidance, and every talented stylist deserves to be discovered.

### Two-Sided Marketplace

#### Seekers (Clients)
People looking for styling help can:
1. **Create a profile** with their preferences, budget, and styling goals
2. **Search for catalysts** based on location, specialization, and price
3. **View detailed profiles** including portfolios, reviews, and expertise
4. **Book sessions** with transparent pricing
5. **Manage their matched catalysts** and track consultation history

#### Catalysts (Stylists)
Professional stylists can:
1. **Build comprehensive profiles** showcasing their expertise
2. **Upload portfolio images** demonstrating their work
3. **Set their rates** and availability
4. **Receive booking requests** from interested seekers
5. **Manage client relationships** through the dashboard
6. **View seeker preferences** to prepare for consultations

## ✨ Key Features

### 🔐 Authentication & User Management
- **Dual Role System**: Users register as either Seekers or Catalysts
- **Secure Authentication**: Token-based authentication with Django REST Framework
- **Profile Management**: Rich profiles with customizable information
- **Gender & Age**: Demographics for better matching (Male/Female/Others)

### 🗺️ Location-Based Discovery
- **Geolocation Integration**: Automatic location detection using browser geolocation API
- **Interactive Map**: Leaflet-powered map showing user location and nearby catalysts
- **Distance Calculation**: Real-time distance calculation using Haversine formula
- **Radius Filtering**: Customizable search radius (default 10km)
- **Visual Markers**: Color-coded markers (blue for user, violet for catalysts)

### 🎨 Catalyst Profiles
Catalysts can create rich, professional profiles featuring:
- **Bio & Tagline**: Short and detailed descriptions
- **Specializations**: Multiple expertise areas (Contemporary Fashion, Saree Styling, Fusion Wear, Office Wear, etc.)
- **Portfolio Gallery**: Up to 5 images showcasing their work
- **Pricing**: Transparent hourly/session rates in ₹ (Rupees)
- **Location**: Address and map coordinates
- **Active Status**: Toggle availability for new bookings

### 📋 Seeker Preferences System
Seekers complete a comprehensive onboarding questionnaire to specify:

**Consultation Preferences**:
- **Type**: Physical meetings, Online consultations, or Both
- **Service Scope**: 
  - Complete Rebranding (full transformation including fitness, hair, skincare, etc.)
  - Wardrobe Only (focused on clothing and styling)

**Service Selection**:
- Body & Fitness
- Hair Styling
- Skincare
- Nails & Grooming
- Hygiene & Self-care
- Wardrobe Management

**Budget Ranges**:
- **Catalyst Fee**: Free, ₹200-500, ₹500-1000, ₹1000-2000, ₹2000-5000, ₹5000+
- **Personal Shopping**: ₹200-1000, ₹1000-3000, ₹3000-5000, ₹5000-10000, ₹10000+

**Editable Preferences**: Seekers can update their preferences anytime from their dashboard

### 📅 Booking & Matching System

**Request Flow**:
1. **Seeker Initiates**: Seeker finds a catalyst and sends a booking request
2. **Catalyst Reviews**: Catalyst views seeker details, preferences, and requirements
3. **Accept/Reject**: Catalyst can accept or decline the request
4. **Match Created**: Accepted requests become "matched seekers"
5. **Status Management**: Track status (Requested → Confirmed → Completed)

**Catalyst Dashboard Features**:
- **Incoming Requests**: View all pending booking requests with full seeker details
- **Seeker Detail Modal**: Comprehensive view including:
  - Contact information (username, email, gender, age)
  - Seeker preferences (consultation type, services, budget)
  - Booking details and notes
  - Accept/Reject actions
- **Matched Seekers**: Manage confirmed and completed bookings
- **Matched Seeker Detail Modal**: View complete information and manage booking status
- **Actions Available**:
  - View Messages (placeholder for future messaging system)
  - Mark as Completed (for confirmed bookings)
  - Reopen Booking (for completed bookings)
  - Remove Seeker (cancel relationship)

**Seeker Dashboard Features**:
- **Your Catalysts**: View all matched catalysts
- **See More Catalysts**: Navigate to search page
- **Preferences Editor**: Update consultation preferences anytime

### 🎯 Smart Search & Filtering
- **Search Bar**: Filter by name, bio, or specialization
- **Real-time Results**: Instant filtering as you type
- **Distance-based Sorting**: Results sorted by proximity
- **Visual Feedback**: Click hints and hover effects for better UX

### 🌙 Premium Dark Theme UI
- **Modern Aesthetics**: Sleek dark theme with gradient accents
- **Color Palette**:
  - Purple (`#8B5CF6`) - Primary accent
  - Pink (`#EC4899`) - Secondary accent
  - Gold (`#F59E0B`) - Highlights
- **Responsive Design**: Mobile-first approach, works on all screen sizes
- **Smooth Animations**: Transitions, hover effects, and micro-interactions
- **Glassmorphism**: Backdrop blur effects for modern look

### 📱 Responsive & Mobile-Optimized
- **Mobile Controls**: Delete buttons visible on mobile (no hover required)
- **Touch-Friendly**: Large tap targets and swipe-friendly interfaces
- **Adaptive Layouts**: Grid systems that adapt to screen size
- **Modal Optimization**: Scrollable modals for long content on small screens

## 🏗️ Technical Architecture

### Backend (Django)
```
mattter_backend/
├── api/                          # Core application
│   ├── models.py                # Data models
│   │   ├── User (Custom user model)
│   │   ├── Profile (Seeker/Catalyst profiles)
│   │   ├── Booking (Request/Match system)
│   │   ├── Service (Catalyst services)
│   │   ├── WardrobeItem (Future feature)
│   │   └── Message (Future messaging)
│   ├── views.py                 # API endpoints
│   │   ├── ProfileViewSet
│   │   ├── BookingViewSet
│   │   └── Custom actions
│   ├── serializers.py           # Data serialization
│   ├── urls.py                  # API routing
│   └── migrations/              # Database migrations
├── mattter_backend/             # Project settings
│   ├── settings.py             # Django configuration
│   ├── urls.py                 # Root URL configuration
│   ├── asgi.py                 # ASGI for Channels
│   └── wsgi.py                 # WSGI for deployment
└── db.sqlite3                  # SQLite database (dev)
```

**Key Technologies**:
- **Django 5.0**: Modern Python web framework
- **Django REST Framework**: RESTful API development
- **Token Authentication**: Secure API access
- **Django Channels**: WebSocket support (for future real-time features)
- **Daphne**: ASGI server
- **SQLite**: Development database (PostgreSQL ready)

### Frontend (React)
```
mattter-frontend/
├── src/
│   ├── components/              # Reusable components
│   │   ├── Layout.jsx          # Main layout with navbar
│   │   ├── ProtectedRoute.jsx  # Auth guard
│   │   └── PreferencesEditor.jsx # Preference management
│   ├── pages/                   # Page components
│   │   ├── LandingPage.jsx     # Home with map
│   │   ├── Login.jsx           # Authentication
│   │   ├── Register.jsx        # New user signup
│   │   ├── SeekerOnboarding.jsx # Preference questionnaire
│   │   ├── SeekerDashboard.jsx  # Seeker home
│   │   ├── CatalystDashboard.jsx # Catalyst home
│   │   ├── CatalystSearch.jsx   # Search with map
│   │   └── CatalystProfile.jsx  # Public profile view
│   ├── context/                 # State management
│   │   └── AuthContext.jsx     # Authentication state
│   ├── App.jsx                  # Main app & routing
│   └── main.jsx                 # Entry point
├── public/                      # Static assets
└── index.html                   # HTML template
```

**Key Technologies**:
- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first styling
- **Leaflet**: Interactive maps
- **Axios**: HTTP client
- **Lucide React**: Icon library

## 🔄 User Journeys

### Seeker Journey

1. **Registration**
   - Visit landing page
   - Click "Get Started" or "Register"
   - Choose "Seeker" role
   - Fill in details (username, email, password, name, gender, age)
   - Submit registration

2. **Onboarding**
   - Complete preference questionnaire
   - Select consultation type (physical/online)
   - Choose service scope (complete rebranding/wardrobe only)
   - Pick interested services
   - Set budget ranges
   - Submit preferences

3. **Discovery**
   - View seeker dashboard
   - Click "See More Catalysts"
   - Allow location access
   - Browse nearby catalysts on map
   - Use search to filter by name/specialization
   - Click on catalyst cards or map markers

4. **Booking** (Future feature - placeholder)
   - View catalyst profile
   - Review portfolio and pricing
   - Send booking request
   - Wait for catalyst response

5. **Management**
   - View matched catalysts in dashboard
   - Update preferences anytime
   - Track booking status

### Catalyst Journey

1. **Registration**
   - Visit landing page
   - Register as "Catalyst"
   - Provide basic information
   - Submit registration

2. **Profile Setup**
   - Access catalyst dashboard
   - Add short bio/tagline
   - Write detailed bio
   - Select specializations from dropdown
   - Upload portfolio images (up to 5)
   - Set service fee per seeker
   - Add address (location auto-detected)
   - Save profile

3. **Discovery**
   - Toggle "Active" status to accept requests
   - Profile appears in search results
   - Seekers can find and view profile

4. **Managing Requests**
   - View incoming requests in dashboard
   - Click on request to see seeker details
   - Review seeker preferences and budget
   - Accept or reject request
   - Accepted requests move to "Matched Seekers"

5. **Client Management**
   - View all matched seekers
   - Click to see detailed information
   - Mark bookings as completed
   - Reopen completed bookings if needed
   - Remove seekers from matches
   - (Future) Message seekers directly

## 🚀 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Django 5.0 | Web framework |
| Django REST Framework | API development |
| Token Authentication | Security |
| Django Channels | WebSocket support |
| SQLite / PostgreSQL | Database |
| Python Dotenv | Environment configuration |
| CORS Headers | Cross-origin requests |

### Frontend  
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite | Build tool |
| React Router | Routing |
| Tailwind CSS | Styling |
| Leaflet | Maps |
| Axios | API calls |
| Lucide Icons | Icons |

## 📡 API Endpoints

### Authentication
- `POST /api/register/` - Create new user account
- `POST /api/login/` - Authenticate and get token
- `POST /api/logout/` - Invalidate token

### Profiles
- `GET /api/profiles/` - List profiles (supports filtering)
  - Query params: `role`, `lat`, `lon`, `radius`
- `GET /api/profiles/me/` - Get current user profile
- `PATCH /api/profiles/me/` - Update current user profile
- `GET /api/profiles/{id}/` - Get specific profile
- `GET /api/profiles/get_preferences/` - Get seeker preferences
- `PUT /api/profiles/update_preferences/` - Update seeker preferences
- `GET /api/profiles/nearby_catalysts/` - Find nearby catalysts

### Bookings
- `GET /api/bookings/` - List bookings (supports status filtering)
  - Query params: `status` (REQUESTED, CONFIRMED, COMPLETED, CANCELLED)
- `POST /api/bookings/` - Create booking request
- `GET /api/bookings/{id}/` - Get booking details
- `PATCH /api/bookings/{id}/` - Update booking
- `POST /api/bookings/{id}/accept_request/` - Accept request (catalyst only)
- `POST /api/bookings/{id}/reject_request/` - Reject request (catalyst only)
- `DELETE /api/bookings/{id}/delete_booking/` - Remove booking (catalyst only)

## 🛠️ Setup Instructions

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher
- npm or yarn
- Modern web browser with geolocation support

### Quick Start

**1. Clone the repository**
```bash
git clone <your-repo-url>
cd Mattter
```

**2. Backend Setup**
```bash
cd mattter_backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
copy .env.example .env  # Edit and add SECRET_KEY

python manage.py migrate
python manage.py createsuperuser  # Optional
python manage.py runserver
```

**3. Frontend Setup** (in new terminal)
```bash
cd mattter-frontend
npm install
copy .env.example .env  # Edit if needed
npm run dev
```

**4. Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin

## 🎨 Design Philosophy

### Dark Theme
The entire platform uses a premium dark theme to:
- Reduce eye strain during extended use
- Create a modern, sophisticated aesthetic
- Make content (especially images) pop
- Provide better focus on key information

### Color Psychology
- **Purple**: Creativity, luxury, transformation
- **Pink**: Approachability, warmth, style
- **Gold**: Premium quality, success, confidence

### UX Principles
- **Clarity**: Clear information hierarchy
- **Feedback**: Visual confirmation for all actions
- **Accessibility**: Readable text, proper contrast
- **Efficiency**: Minimal clicks to complete tasks
- **Delight**: Smooth animations and transitions

## 🔮 Future Enhancements

### Planned Features
- [ ] **Real-time Messaging**: Chat system between seekers and catalysts
- [ ] **Reviews & Ratings**: Seeker reviews for catalysts
- [ ] **Booking Calendar**: Schedule management with time slots
- [ ] **Payment Integration**: Secure payment processing
- [ ] **Portfolio Management**: Advanced image management for catalysts
- [ ] **Notifications**: Email and push notifications
- [ ] **Advanced Search**: Filters for price, rating, availability
- [ ] **Video Consultations**: Integrated video calling
- [ ] **Wardrobe Management**: Digital wardrobe for seekers
- [ ] **AI Recommendations**: ML-based catalyst suggestions
- [ ] **Social Features**: Share transformations, follow catalysts

### Technical Improvements
- [ ] **PostgreSQL**: Migration from SQLite for production
- [ ] **Redis**: Caching for better performance
- [ ] **S3 Storage**: Cloud storage for images
- [ ] **CI/CD Pipeline**: Automated testing and deployment
- [ ] **Docker**: Containerization for easy deployment
- [ ] **Load Balancing**: Horizontal scaling support

## 📊 Database Schema

### Key Models

**User** (Custom Django User)
- username, email, password
- first_name, last_name
- gender, age

**Profile**
- user (OneToOne)
- role (SEEKER/CATALYST)
- bio, bio_short
- specializations (JSONField)
- portfolio_images (JSONField)
- hourly_rate, address
- latitude, longitude
- preferences (JSONField for seekers)
- is_active

**Booking**
- seeker (ForeignKey to User)
- catalyst (ForeignKey to User)
- status (REQUESTED/CONFIRMED/COMPLETED/CANCELLED)
- scheduled_time
- created_at, updated_at
- notes
- seeker_preferences (JSONField snapshot)

## 🚢 Deployment Guide

### Backend Deployment (Django)
1. Set environment variables:
   - `SECRET_KEY`: Strong random string
   - `DEBUG=False`
   - `ALLOWED_HOSTS`: Your domain
   - `DATABASE_URL`: PostgreSQL connection string
2. Collect static files: `python manage.py collectstatic`
3. Use Gunicorn or uWSGI as WSGI server
4. Configure nginx as reverse proxy
5. Set up SSL with Let's Encrypt

### Frontend Deployment (React)
1. Update `.env` with production API URL
2. Build: `npm run build`
3. Serve `dist/` folder with nginx or Netlify/Vercel
4. Configure CORS on backend for production domain

## 🤝 Contributing

We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## 📄 License

This project is proprietary and confidential.

## 🙏 Acknowledgments

- **Leaflet**: For excellent mapping library
- **Tailwind CSS**: For utility-first CSS framework
- **Django Community**: For robust web framework
- **React Team**: For powerful UI library

---

**Built with 💜 for fashion enthusiasts and styling professionals**


A modern platform connecting style seekers with professional catalysts (stylists) for personalized fashion consulting.

## 🚀 Tech Stack

### Backend
- **Framework**: Django 5.0 + Django REST Framework
- **Database**: SQLite (development) / PostgreSQL (production ready)
- **Authentication**: Token-based authentication
- **Real-time**: Django Channels
- **API**: RESTful API

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom dark theme
- **Maps**: Leaflet for location-based features
- **State Management**: React Context API
- **HTTP Client**: Axios

## 📋 Features

- **User Roles**: Seekers (clients) and Catalysts (stylists)
- **Authentication**: Secure login/registration with profile management
- **Location-based Search**: Find catalysts near you with interactive maps
- **Booking System**: Request, accept/reject, and manage styling sessions
- **Preferences**: Customizable seeker preferences (consultation type, budget, services)
- **Dashboard**: Separate dashboards for seekers and catalysts
- **Profile Management**: Rich catalyst profiles with portfolios and specializations
- **Responsive Design**: Mobile-first, works on all devices

## 🛠️ Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd mattter_backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment**
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`

4. **Install dependencies**
   ```bash
   pip install django djangorestframework djangorestframework-simplejwt django-cors-headers python-dotenv channels daphne
   ```

5. **Create .env file**
   ```bash
   copy .env.example .env  # Windows
   cp .env.example .env    # Mac/Linux
   ```

6. **Update .env file** with your settings (generate a new SECRET_KEY)
   ```
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   ```

7. **Run migrations**
   ```bash
   python manage.py migrate
   ```

8. **Create superuser** (optional)
   ```bash
   python manage.py createsuperuser
   ```

9. **Run development server**
   ```bash
   python manage.py runserver
   ```
   Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd mattter-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   copy .env.example .env  # Windows
   cp .env.example .env    # Mac/Linux
   ```

4. **Update .env file** if needed
   ```
   VITE_API_BASE_URL=http://localhost:8000
   VITE_APP_ENV=development
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```
   Frontend will be available at `http://localhost:5173`

## 📁 Project Structure

```
Mattter/
├── mattter_backend/          # Django backend
│   ├── api/                  # Main API app
│   │   ├── models.py        # Database models
│   │   ├── views.py         # API endpoints
│   │   ├── serializers.py   # Data serializers
│   │   └── urls.py          # API routes
│   ├── mattter_backend/      # Project settings
│   │   ├── settings.py      # Django configuration
│   │   ├── urls.py          # Root URLs
│   │   └── asgi.py          # ASGI config
│   ├── .env.example         # Environment template
│   ├── .gitignore
│   └── requirements.txt     # Python dependencies
│
├── mattter-frontend/         # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── context/         # Context providers
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── .env.example         # Environment template
│   ├── .gitignore
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore               # Root gitignore
└── README.md               # This file
```

## 🔑 API Endpoints

### Authentication
- `POST /api/register/` - Register new user
- `POST /api/login/` - Login user
- `POST /api/logout/` - Logout user

### Profiles
- `GET /api/profiles/` - List all profiles (filtered by role, location)
- `GET /api/profiles/me/` - Get current user's profile
- `PATCH /api/profiles/me/` - Update current user's profile
- `GET /api/profiles/{id}/` - Get specific profile

### Bookings
- `GET /api/bookings/` - List bookings (filtered by status)
- `POST /api/bookings/` - Create booking request
- `POST /api/bookings/{id}/accept_request/` - Accept booking
- `POST /api/bookings/{id}/reject_request/` - Reject booking
- `DELETE /api/bookings/{id}/delete_booking/` - Remove booking

## 🎨 User Roles

### Seeker
- Search for catalysts by location
- View catalyst profiles and portfolios
- Set preferences (consultation type, budget, services)
- Request bookings with catalysts
- Manage matched catalysts

### Catalyst
- Create and manage professional profile
- Set specializations and hourly rates
- Upload portfolio images
- Accept/reject booking requests
- View matched seekers with full details
- Manage booking status

## 🚢 Deployment Notes

### Backend (Django)
1. Set `DEBUG=False` in production
2. Generate a strong `SECRET_KEY`
3. Configure `ALLOWED_HOSTS` with your domain
4. Set up PostgreSQL database
5. Configure static files serving
6. Use gunicorn or similar WSGI server

### Frontend (React)
1. Update `VITE_API_BASE_URL` to production API URL
2. Run `npm run build` to create production build
3. Serve the `dist` folder with nginx or similar
4. Configure CORS on backend to allow your frontend domain

## 📝 Environment Variables

### Backend (.env)
```
SECRET_KEY=your-secret-key
DEBUG=True/False
ALLOWED_HOSTS=comma,separated,hosts
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://yourapp.com
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_ENV=development
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and confidential.

## 🐛 Known Issues

- GDAL/GeoDjango features are disabled (using Haversine formula for distance calculations)
- Messaging feature is placeholder (to be implemented)

## 📧 Contact

For questions or support, please create an issue in the repository.
