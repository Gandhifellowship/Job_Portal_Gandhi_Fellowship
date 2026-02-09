import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, ArrowRight, Shield, Microscope } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-secondary-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-accent-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-32 right-20 w-32 h-32 bg-secondary-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-accent-300/20 rounded-full blur-3xl"></div>
        
        <div className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white shadow-2xl">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header with Logo and Admin Button */}
            <div className="flex items-center justify-between mb-8 md:mb-16 gap-4">
              {/* Logo */}
              <Link to="/" className="group flex-shrink-0">
                <div className="bg-white rounded-lg px-2 py-2 md:px-4 md:py-3 shadow-md">
                  <img 
                    src="/gandhi-fellowship-logo.png" 
                    alt="Gandhi Fellowship Logo" 
                    className="h-12 md:h-20 lg:h-24 group-hover:scale-105 transition-transform duration-200"
                    style={{ aspectRatio: 'auto' }}
                  />
                </div>
              </Link>
              
              {/* Admin Button */}
              <Link 
                to="/admin/login" 
                className="flex items-center space-x-1 md:space-x-2 text-white/90 hover:text-white transition-colors duration-200 flex-shrink-0"
              >
                <Shield className="h-4 w-4 md:h-5 md:w-5" />
                <span className="text-sm md:text-lg font-medium hidden sm:inline">Admin</span>
              </Link>
            </div>
            
            <div className="text-center max-w-5xl mx-auto">
              <h1 className="text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
                Career Support
              </h1>
              <p className="text-xl opacity-95 mb-10 max-w-3xl mx-auto leading-relaxed">
                Take your first step to kick start your impact journey
              </p>
              
              <div className="flex justify-center">
                <Button asChild size="lg" className="bg-accent hover:bg-accent-600 text-white font-semibold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <Link to="/jobs">
                    <Briefcase className="h-6 w-6 mr-3" />
                    View Open Positions
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-primary-700">
            Crossroad Support
          </h2>
          <p className="text-xl text-primary-600 max-w-2xl mx-auto">
            Powered by NEST, this platform supports Gandhi Fellowship community  in exploring opportunities, applying to on-boarded organizations, and navigating the career support process with clarity and confidence.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Card className="group hover:shadow-2xl transition-all duration-300 border border-primary-200 bg-white">
            <CardHeader className="pb-6">
              <div className="h-16 w-16 bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-primary-700 mb-3">How Does The Portal Works</CardTitle>
              <CardDescription className="text-primary-600 leading-relaxed">
                Familiarize yourself with the tech-enabled career support process for a smooth and efficient experience.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-300 border border-secondary-200 bg-white">
            <CardHeader className="pb-6">
              <div className="h-16 w-16 bg-gradient-to-br from-secondary-500 to-secondary-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-primary-700 mb-3">Placement Guidelines</CardTitle>
              <CardDescription className="text-primary-600 leading-relaxed">
                Placement guidelines co-developed by NEST and the Fellow Placement Committee ensure a clear and structured process.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-300 border border-accent-200 bg-white">
            <CardHeader className="pb-6">
              <div className="h-16 w-16 bg-gradient-to-br from-accent-500 to-accent-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <ArrowRight className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-primary-700 mb-3">Roles & Support System</CardTitle>
              <CardDescription className="text-primary-600 leading-relaxed">
                To ensure the fellows don't feel left out or confused, we have developed a support sytem that will help them during the job application process.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600 text-white overflow-hidden shadow-2xl">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-brand-accent rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                <Microscope className="h-10 w-10 text-white" />
              </div>
            </div>
            
            <h2 className="text-4xl font-bold mb-6 text-white drop-shadow-lg">
              Frequently Asked Questions
            </h2>
            <p className="text-xl opacity-95 mb-10 leading-relaxed">
              Find quick answers to common questions about the career support process and platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-accent hover:bg-accent-600 text-white font-semibold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <Link to="/jobs">
                  <Briefcase className="h-6 w-6 mr-3" />
                  Find Answers
                  <ArrowRight className="h-6 w-6 ml-3" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
