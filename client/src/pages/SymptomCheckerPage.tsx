import React from 'react';
import SymptomChecker from '../components/symptomChecker/SymptomChecker';

const SymptomCheckerPage = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          AI-Powered Symptom Checker
        </h1>
        <p className="text-lg mt-2 text-muted-foreground max-w-2xl mx-auto">
          Get insights about your health and find specialists who can help using our advanced symptom assessment tool
        </p>
      </div>
      
      <SymptomChecker />
      
      <div className="mt-12 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border rounded-lg">
            <div className="text-3xl font-bold text-primary mb-2">1</div>
            <h3 className="text-lg font-medium mb-2">Select Symptoms</h3>
            <p className="text-sm text-muted-foreground">
              Choose all symptoms you're currently experiencing from our comprehensive list
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="text-3xl font-bold text-primary mb-2">2</div>
            <h3 className="text-lg font-medium mb-2">Get Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Our AI analyzes your symptoms using advanced machine learning algorithms
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="text-3xl font-bold text-primary mb-2">3</div>
            <h3 className="text-lg font-medium mb-2">Find Specialists</h3>
            <p className="text-sm text-muted-foreground">
              Receive specialist recommendations and connect with doctors through our platform
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>
          Note: This symptom checker is for informational purposes only and does not provide medical advice.
          Always consult with a qualified healthcare provider for medical concerns.
        </p>
      </div>
    </div>
  );
};

export default SymptomCheckerPage;