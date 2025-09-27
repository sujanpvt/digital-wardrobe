# MongoDB Atlas Setup Guide

## Quick Setup (5 minutes)

### 1. Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free" 
3. Sign up with your email or Google account

### 2. Create a Free Cluster
1. Choose "M0 Sandbox" (Free tier)
2. Select a region close to you
3. Name your cluster (e.g., "digital-wardrobe")
4. Click "Create Cluster"

### 3. Set Up Database Access
1. Go to "Database Access" in the left menu
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username: `wardrobe-user`
5. Create password: `wardrobe123` (or your choice)
6. Set privileges to "Read and write to any database"
7. Click "Add User"

### 4. Set Up Network Access
1. Go to "Network Access" in the left menu
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for hackathon demo)
4. Click "Confirm"

### 5. Get Connection String
1. Go to "Database" in the left menu
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `digital-wardrobe`

### 6. Update Your .env File
Replace the MONGODB_URI in your .env file with the connection string from step 5.

Example:
```
MONGODB_URI=mongodb+srv://wardrobe-user:wardrobe123@cluster0.xxxxx.mongodb.net/digital-wardrobe?retryWrites=true&w=majority
```

## Alternative: Use MongoDB Compass (Desktop App)
1. Download MongoDB Compass from https://www.mongodb.com/products/compass
2. Use the connection string to connect
3. Create database "digital-wardrobe"

## Benefits of Atlas:
- ✅ No installation needed
- ✅ Works on any device
- ✅ Professional setup
- ✅ Free tier (512MB storage)
- ✅ Automatic backups
- ✅ Global availability

