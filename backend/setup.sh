#!/bin/bash

# BitGlow Backend Setup Script
# This script helps you quickly set up the backend for development

echo "================================================"
echo "  BitGlow Backend Setup"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo "✓ npm version: $(npm --version)"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit the .env file and add your email settings!"
    echo ""
else
    echo "✓ .env file already exists"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed successfully"
    echo ""
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check if .env has been configured
if grep -q "your-email@gmail.com" .env; then
    echo "⚠️  WARNING: .env file still has default values!"
    echo ""
    echo "Please edit .env and update:"
    echo "  - SMTP_USER (your email)"
    echo "  - SMTP_PASS (your email password or app password)"
    echo "  - CONTACT_EMAIL (where to receive messages)"
    echo ""
fi

echo "================================================"
echo "  Setup Complete! 🚀"
echo "================================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Edit .env file with your email settings:"
echo "   nano .env"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. Test the backend:"
echo "   curl http://localhost:3000/health"
echo ""
echo "For deployment to Hostinger, see:"
echo "   HOSTINGER_DEPLOYMENT.md"
echo ""
echo "================================================"
