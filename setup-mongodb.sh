#!/bin/bash

echo "🗄️  MongoDB Atlas Setup for Digital Wardrobe"
echo "=============================================="
echo ""

echo "📋 Step-by-step instructions:"
echo ""
echo "1. 🌐 Open https://www.mongodb.com/cloud/atlas"
echo "2. 📝 Sign up for a free account"
echo "3. 🆓 Create a FREE M0 cluster"
echo "4. 👤 Create database user:"
echo "   - Username: wardrobe-user"
echo "   - Password: wardrobe123"
echo "5. 🌍 Allow access from anywhere (for demo)"
echo "6. 📋 Copy the connection string"
echo ""

echo "🔗 Quick Links:"
echo "   Atlas Dashboard: https://cloud.mongodb.com/"
echo "   Free Tier: https://www.mongodb.com/cloud/atlas/free"
echo ""

echo "📝 After getting your connection string:"
echo "   1. Open .env file in this directory"
echo "   2. Replace MONGODB_URI with your Atlas connection string"
echo "   3. Restart the backend server"
echo ""

echo "✅ Example connection string format:"
echo "   MONGODB_URI=mongodb+srv://wardrobe-user:wardrobe123@cluster0.xxxxx.mongodb.net/digital-wardrobe?retryWrites=true&w=majority"
echo ""

echo "🚀 Once configured, your Digital Wardrobe will have full database functionality!"
echo "   - User registration/login"
echo "   - Clothing item storage"
echo "   - Outfit management"
echo "   - Laundry tracking"
echo "   - AI-powered features"
echo ""

echo "Need help? Check mongodb-setup.md for detailed instructions."

