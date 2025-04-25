import React from 'react';
import SymptomChecker from '../components/symptomChecker/SymptomChecker';
import { Shield, Star, Zap } from 'lucide-react';

const SymptomCheckerPage = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
          Health Check
        </h1>
        <p className="text-lg mt-2 text-gray-600 max-w-2xl mx-auto">
          Get insights about your health symptoms with our AI-powered analysis tool
        </p>
      </div>
      
      {/* Main Symptom Checker Tool */}
      <SymptomChecker />
      
      {/* Benefits Section */}
      <div className="mt-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center">Why Use Our Health Check?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-blue-50 rounded-xl p-6 shadow-sm">
            <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-4">
              <Zap className="text-primary h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Instant Analysis</h3>
            <p className="text-gray-600">
              Get immediate insights about your symptoms without waiting for an appointment
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-6 shadow-sm">
            <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-4">
              <Star className="text-primary h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
            <p className="text-gray-600">
              Utilizes advanced machine learning to identify patterns and suggest potential conditions
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-6 shadow-sm">
            <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-4">
              <Shield className="text-primary h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
            <p className="text-gray-600">
              Your health information is never stored or shared with third parties
            </p>
          </div>
        </div>
      </div>
      
      {/* How It Works */}
      <div className="mt-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border border-gray-200 rounded-lg relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-lg font-medium mb-2 mt-2 text-center">Enter Symptoms</h3>
            <p className="text-gray-500 text-center">
              Select all symptoms you're currently experiencing from our list or search for specific ones
            </p>
          </div>
          
          <div className="p-6 border border-gray-200 rounded-lg relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-lg font-medium mb-2 mt-2 text-center">Review Analysis</h3>
            <p className="text-gray-500 text-center">
              Our AI system analyzes your symptoms and suggests potential conditions and specialists
            </p>
          </div>
          
          <div className="p-6 border border-gray-200 rounded-lg relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="text-lg font-medium mb-2 mt-2 text-center">Consult a Doctor</h3>
            <p className="text-gray-500 text-center">
              Book an appointment with a recommended specialist directly through our platform
            </p>
          </div>
        </div>
      </div>
      
      {/* Disclaimer */}
      <div className="mt-16 mb-4 max-w-3xl mx-auto bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-center text-amber-800 text-sm">
          <strong>Important:</strong> This symptom checker is for informational purposes only and does not provide medical advice.
          Always consult with a qualified healthcare provider for medical concerns.
        </p>
      </div>
    </div>
  );
};

export default SymptomCheckerPage;