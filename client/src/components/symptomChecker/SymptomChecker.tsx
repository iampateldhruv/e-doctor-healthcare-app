import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  AlertCircle, 
  Loader, 
  Upload, 
  X,
  Info,
  CircleCheck
} from 'lucide-react';
import { Doctor } from '@/lib/types';

interface SymptomResult {
  possibleDiseases: Array<{
    name: string;
    confidence: number;
  }>;
  recommendedSpecialists: string[];
  doctorsBySpecialty: Array<{
    specialty: string;
    doctors: Doctor[];
  }>;
}

/**
 * Symptom Checker Component based on reference design
 */
const SymptomChecker = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [, setLocation] = useLocation();

  // Fetch the list of available symptoms
  const { 
    data: symptoms = [], 
    isLoading: isLoadingSymptoms, 
    error: symptomsError 
  } = useQuery<string[]>({
    queryKey: ['/api/symptoms'],
    enabled: true,
  });

  // Mutation to check symptoms and get recommendations
  const { 
    mutate: checkSymptoms, 
    data: results, 
    isPending: isCheckingSymptoms,
    error: checkError 
  } = useMutation<SymptomResult, Error>({
    mutationFn: async () => {
      const response = await fetch('/api/symptom-checker/recommend-specialists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms: selectedSymptoms }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze symptoms');
      }
      
      return response.json();
    },
  });

  // Handle symptom selection
  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => {
      if (prev.includes(symptom)) {
        return prev.filter(s => s !== symptom);
      } else {
        return [...prev, symptom];
      }
    });
  };

  // Remove a selected symptom
  const removeSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => prev.filter(s => s !== symptom));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSymptoms.length === 0) {
      alert('Please select at least one symptom');
      return;
    }
    
    checkSymptoms();
    setShowResults(true);
  };

  // Reset the form
  const handleReset = () => {
    setSelectedSymptoms([]);
    setShowResults(false);
  };

  // Format symptom display name
  const formatSymptomName = (symptom: string): string => {
    return symptom
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Filter symptoms based on search term
  const filteredSymptoms = symptoms.filter(symptom => 
    formatSymptomName(symptom).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel: Symptom Input */}
      <div className={`${showResults && results ? 'lg:block hidden' : ''}`}>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">AI-Powered Symptom Analysis</h2>
          <p className="mt-2 text-gray-600">
            Enter your symptoms or upload your medical reports to get a preliminary analysis of possible conditions.
          </p>
        </div>

        {isLoadingSymptoms ? (
          <div className="flex justify-center items-center p-12">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading symptoms...</span>
          </div>
        ) : symptomsError ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load symptoms. Please try again later.</AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {/* Step 1: Enter Symptoms */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                    1
                  </div>
                  <h3 className="text-xl font-semibold">Enter your symptoms</h3>
                </div>

                {/* Selected Symptoms Pills */}
                {selectedSymptoms.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedSymptoms.map(symptom => (
                      <Badge 
                        key={symptom} 
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
                      >
                        {formatSymptomName(symptom)}
                        <button 
                          onClick={() => removeSymptom(symptom)} 
                          className="ml-2"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Search Input */}
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400 h-5 w-5" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Type your symptoms (e.g., Headache, Fever)..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Symptom Selection */}
                <div className="max-h-60 overflow-y-auto border rounded-md p-3 bg-gray-50">
                  {filteredSymptoms.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">No symptoms match your search</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filteredSymptoms.map((symptom: string) => (
                        <div key={symptom} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                          <Checkbox 
                            id={`symptom-${symptom}`} 
                            checked={selectedSymptoms.includes(symptom)}
                            onCheckedChange={() => handleSymptomToggle(symptom)}
                          />
                          <Label 
                            htmlFor={`symptom-${symptom}`}
                            className="text-sm cursor-pointer w-full"
                          >
                            {formatSymptomName(symptom)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Upload Medical Reports (Optional) */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center mr-3">
                    2
                  </div>
                  <h3 className="text-xl font-semibold">Upload medical reports (optional)</h3>
                </div>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    Drag and drop your files here, or <span className="text-primary">browse files</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Supported formats: PDF, JPG, PNG (max 10MB)
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleReset}
                  disabled={selectedSymptoms.length === 0}
                >
                  Clear All
                </Button>
                <Button 
                  type="submit" 
                  disabled={selectedSymptoms.length === 0 || isCheckingSymptoms}
                  className="px-6"
                >
                  {isCheckingSymptoms ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Symptoms'
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Right Panel: Results */}
      {showResults && results && (
        <div className="bg-primary text-white rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>
            
            <p className="mb-4">
              Based on your symptoms, our AI suggests these potential conditions. 
              Please consult with a doctor for accurate diagnosis.
            </p>

            {/* Diseases with match percentage */}
            <div className="space-y-4">
              {results.possibleDiseases.map((disease, index) => (
                <Card key={disease.name} className="bg-white/10 text-white border-none">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-lg">{disease.name}</h3>
                        <p className="text-sm opacity-90">
                          Specialist: {index < results.recommendedSpecialists.length ? 
                            results.recommendedSpecialists[index] : 'General Practice'}
                        </p>
                      </div>
                      <Badge className="bg-white text-primary font-medium">
                        Match: {Math.round(disease.confidence * 100)}%
                      </Badge>
                    </div>
                    
                    {index === 0 && (
                      <Button 
                        className="mt-3 w-full bg-white text-primary hover:bg-white/90"
                        onClick={() => {
                          // If doctors are available for this condition, use the first doctor
                          const specialty = results.recommendedSpecialists[0];
                          const specialtyDoctors = results.doctorsBySpecialty.find(
                            item => item.specialty.toLowerCase() === specialty.toLowerCase()
                          );
                          
                          const doctorId = specialtyDoctors && specialtyDoctors.doctors.length > 0 
                            ? specialtyDoctors.doctors[0].id 
                            : undefined;
                            
                          if (doctorId) {
                            setLocation(`/appointment/new?doctorId=${doctorId}`);
                          } else {
                            setLocation('/doctors');
                          }
                        }}
                      >
                        Consult a {results.recommendedSpecialists[0] || 'Doctor'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Disclaimer */}
            <div className="mt-6 flex items-start text-sm text-white/80">
              <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <p>
                This analysis is based on the symptoms you provided and is not a medical diagnosis. 
                Always consult with healthcare professionals.
              </p>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="p-4 bg-primary-foreground/10 flex justify-between items-center">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-primary-foreground/20"
              onClick={handleReset}
            >
              Start New Analysis
            </Button>
            <Button 
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => setLocation('/doctors')}
            >
              View All Specialists
            </Button>
          </div>
        </div>
      )}

      {/* Show error if symptoms check fails */}
      {checkError && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {checkError.message || 'Failed to analyze symptoms. Please try again later.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SymptomChecker;