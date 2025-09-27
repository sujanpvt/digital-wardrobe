# Error Fixes for Digital Wardrobe

## 1. MongoDB Connection Error

### Option A: Install and Start MongoDB Locally
```bash
# On macOS with Homebrew
brew install mongodb-community
brew services start mongodb-community

# On Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongodb

# On Windows
# Download from https://www.mongodb.com/try/download/community
```

### Option B: Use MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get connection string
5. Update .env file:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/digital-wardrobe
```

## 2. Lucide React Import Errors

The `Shoe` icon doesn't exist in lucide-react. Let's fix the imports.

## 3. Missing Dependencies

Some packages might be missing or need updates.

## Quick Fix Commands:

```bash
# Fix MongoDB (Option A - Local)
brew install mongodb-community
brew services start mongodb-community

# Fix MongoDB (Option B - Cloud)
# Just update your .env with MongoDB Atlas connection string

# Fix frontend dependencies
cd frontend
npm install lucide-react@latest

# Fix backend dependencies
npm install
```
