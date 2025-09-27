# Digital Wardrobe - AI-Powered Fashion Assistant

A comprehensive digital wardrobe application that helps users organize their clothing, create outfits, and get AI-powered style suggestions.

## Features

### 🧥 **Wardrobe Management**
- Upload and categorize clothing items with AI-powered analysis
- Smart image processing with color extraction
- Advanced filtering and search capabilities
- Item tracking with wear count and last worn dates

### 🎨 **Dress-Up System**
- Interactive outfit creation with drag-and-drop interface
- Real-time outfit visualization
- Category-based item selection
- Random outfit generator

### 🤖 **AI-Powered Features**
- Intelligent outfit suggestions based on occasion, weather, and style
- Color harmony analysis
- Style compatibility scoring
- Personalized recommendations

### 👗 **Outfit Management**
- Save and organize favorite outfits
- Tag and categorize outfits by occasion
- Track outfit usage and ratings
- AI-generated outfit suggestions

### 🧺 **Laundry Tracking**
- Monitor items in wash
- Track wash cycles and expected return dates
- Overdue item alerts
- Wash type categorization

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Cloudinary** for image storage and processing
- **OpenAI API** for AI-powered features
- **JWT** for authentication
- **Multer** for file uploads

### Frontend
- **React.js** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Framer Motion** for animations
- **React Dropzone** for file uploads
- **Axios** for API communication

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account
- OpenAI API key

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/digital-wardrobe

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Database Setup

Make sure MongoDB is running locally or configure MongoDB Atlas connection string.

### 4. Start the Application

```bash
# Start backend server
npm run dev

# Start frontend (in a new terminal)
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/preferences` - Update user preferences

### Clothing Items
- `POST /api/items/upload` - Upload clothing item
- `GET /api/items/user/:userId` - Get user's items
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `PUT /api/items/:id/wash-status` - Update wash status

### Outfits
- `POST /api/outfits/create` - Create outfit
- `GET /api/outfits/user/:userId` - Get user's outfits
- `PUT /api/outfits/:id` - Update outfit
- `DELETE /api/outfits/:id` - Delete outfit
- `POST /api/outfits/:id/wear` - Mark as worn

### Laundry
- `POST /api/laundry/add-items` - Add items to laundry
- `GET /api/laundry/user/:userId` - Get laundry entries
- `PUT /api/laundry/:id/status` - Update status
- `DELETE /api/laundry/:id` - Delete entry

### AI Features
- `POST /api/ai/suggest-outfits` - Get AI outfit suggestions
- `POST /api/ai/analyze-outfit` - Analyze outfit compatibility
- `GET /api/ai/style-recommendations` - Get style recommendations

## Key Features Implementation

### 1. Image Upload & Processing
- Automatic image optimization with Cloudinary
- Color extraction and analysis
- Smart categorization based on image content

### 2. AI Outfit Matching
- OpenAI GPT-4 integration for intelligent suggestions
- Color harmony analysis
- Style compatibility scoring
- Occasion-appropriate recommendations

### 3. Interactive Dress-Up
- Real-time outfit visualization
- Category-based item selection
- Drag-and-drop interface
- Outfit saving and management

### 4. Laundry Tracking
- Item status management
- Wash cycle tracking
- Overdue notifications
- Return date monitoring

## Database Schema

### User
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  preferences: {
    style: String,
    colors: [String],
    occasions: [String]
  }
}
```

### ClothingItem
```javascript
{
  userId: ObjectId,
  name: String,
  category: String,
  subcategory: String,
  color: String,
  imageUrl: String,
  tags: [String],
  isInWash: Boolean,
  wearCount: Number,
  style: String,
  season: String
}
```

### Outfit
```javascript
{
  userId: ObjectId,
  name: String,
  items: [ObjectId],
  occasion: String,
  rating: Number,
  isFavorite: Boolean,
  isAIGenerated: Boolean
}
```

### Laundry
```javascript
{
  userId: ObjectId,
  items: [ObjectId],
  washDate: Date,
  expectedReturnDate: Date,
  status: String,
  washType: String
}
```

## Development

### Project Structure
```
digital-wardrobe/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   └── services/    # API services
│   └── public/
└── uploads/             # Temporary file storage
```

### Adding New Features

1. **Backend**: Add new routes in `/routes/` directory
2. **Frontend**: Create components in `/src/components/`
3. **Database**: Update models in `/models/` directory
4. **API**: Add new endpoints following RESTful conventions

## Deployment

### Backend Deployment (Heroku/Railway)
1. Set environment variables in deployment platform
2. Ensure MongoDB Atlas connection
3. Configure Cloudinary credentials
4. Deploy with `git push heroku main`

### Frontend Deployment (Vercel/Netlify)
1. Build the React app: `npm run build`
2. Deploy to Vercel or Netlify
3. Set environment variables for API URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or support, please open an issue in the GitHub repository.

---

**Built with ❤️ for the hackathon**
