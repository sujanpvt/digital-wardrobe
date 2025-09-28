import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Shirt, 
  Palette, 
  Heart, 
  Droplets, 
  Sparkles, 
  Camera,
  Brain,
  TrendingUp
} from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Camera,
      title: 'Smart Upload',
      description: 'Upload your clothing items with AI-powered categorization and color analysis'
    },
    {
      icon: Brain,
      title: 'AI Outfit Matching',
      description: 'Get intelligent outfit suggestions based on your style preferences and occasion'
    },
    {
      icon: Palette,
      title: 'Virtual Dress-Up',
      description: 'Try on different combinations with our interactive avatar system'
    },
    {
      icon: Heart,
      title: 'Outfit Management',
      description: 'Save, rate, and organize your favorite outfit combinations'
    },
    {
      icon: Droplets,
      title: 'Laundry Tracking',
      description: 'Keep track of items in wash and never forget what\'s being cleaned'
    },
    {
      icon: TrendingUp,
      title: 'Style Analytics',
      description: 'Get insights into your wardrobe usage and style preferences'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Your Digital Wardrobe
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            Organize, style, and discover your perfect outfits with AI-powered fashion assistance
          </p>
          {user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/wardrobe" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                <Shirt className="w-5 h-5 mr-2" />
                View Wardrobe
              </Link>
              <Link to="/dress-up" className="btn-secondary bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600">
                <Palette className="w-5 h-5 mr-2" />
                Start Dressing Up
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                Get Started
              </Link>
              <Link to="/login" className="btn-secondary bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Everything You Need for Your Wardrobe
            </h2>
            <p className="text-xl text-gray-600">
              From organization to styling, we've got you covered
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                    <feature.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in just a few simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Upload Your Clothes
              </h3>
              <p className="text-gray-600">
                Take photos of your clothing items and let our AI categorize them automatically
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Create Outfits
              </h3>
              <p className="text-gray-600">
                Use our dress-up feature or get AI suggestions for perfect outfit combinations
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Organize & Track
              </h3>
              <p className="text-gray-600">
                Save your favorite outfits, track laundry, and get style insights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 bg-primary-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Transform Your Wardrobe?
            </h2>
            <p className="text-xl mb-8 text-primary-100">
              Join thousands of users who are already organizing their style with AI
            </p>
            <Link to="/register" className="btn-primary bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3">
              <Sparkles className="w-5 h-5 mr-2" />
              Start Your Journey
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
