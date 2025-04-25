import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader } from 'lucide-react';
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
 * Symptom Checker Component
 * 
 * This component allows users to select symptoms and get potential diagnosis
 * and specialist recommendations using machine learning.
 */
const SymptomChecker = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

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

  return (
    <div className="symptom-checker max-w-5xl mx-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Symptom Checker</CardTitle>
          <CardDescription>
            Select your symptoms and our AI will help identify possible conditions and recommend specialists
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingSymptoms ? (
            <div className="flex justify-center items-center p-8">
              <Loader className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading symptoms...</span>
            </div>
          ) : symptomsError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Failed to load symptoms. Please try again later.</AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Select your symptoms:</h3>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">
                      Choose all symptoms you are experiencing currently
                    </p>
                  </div>
                  <ScrollArea className="h-[350px] rounded-md border p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {symptoms.map((symptom: string) => (
                        <div key={symptom} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`symptom-${symptom}`} 
                            checked={selectedSymptoms.includes(symptom)}
                            onCheckedChange={() => handleSymptomToggle(symptom)}
                          />
                          <Label 
                            htmlFor={`symptom-${symptom}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {formatSymptomName(symptom)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button type="button" variant="outline" onClick={handleReset}>
                  Reset
                </Button>
                <Button type="submit" disabled={selectedSymptoms.length === 0 || isCheckingSymptoms}>
                  {isCheckingSymptoms ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing
                    </>
                  ) : (
                    'Check Symptoms'
                  )}
                </Button>
              </div>
            </form>
          )}

          {showResults && results && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-xl font-semibold mb-4">Results</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium mb-2">Possible Conditions:</h4>
                  <div className="space-y-3">
                    {results.possibleDiseases.map((disease) => (
                      <div key={disease.name} className="p-3 bg-secondary/20 rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{disease.name}</span>
                          <span className="text-sm">
                            Confidence: {Math.round(disease.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium mb-2">Recommended Specialists:</h4>
                  {results.recommendedSpecialists.map((specialist) => (
                    <div key={specialist} className="p-3 bg-primary/10 rounded-md mb-3">
                      <span className="font-medium">{specialist}</span>
                    </div>
                  ))}
                </div>

                {results.doctorsBySpecialty && results.doctorsBySpecialty.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium mb-2">Available Doctors:</h4>
                    {results.doctorsBySpecialty.map((item) => (
                      <div key={item.specialty} className="mb-4">
                        <h5 className="text-md font-medium mb-2">{item.specialty}:</h5>
                        <div className="space-y-2">
                          {item.doctors.map((doctor) => (
                            <Card key={doctor.id} className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex">
                                  {doctor.user.profileImage && (
                                    <img 
                                      src={doctor.user.profileImage} 
                                      alt={doctor.user.fullName} 
                                      className="w-12 h-12 rounded-full mr-3"
                                    />
                                  )}
                                  <div>
                                    <div className="font-medium text-lg">{doctor.user.fullName}</div>
                                    <div className="text-sm text-muted-foreground mb-1">
                                      {doctor.hospital} • {doctor.experience}
                                    </div>
                                    <div className="flex items-center text-sm">
                                      <span className="text-amber-500 mr-1">★</span> 
                                      <span className="font-medium">{doctor.rating}</span>
                                      <span className="mx-1 text-muted-foreground">({doctor.reviewCount} reviews)</span>
                                      <span className="ml-2 text-green-600 font-medium">Next: {doctor.nextAvailable}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col space-y-2">
                                  <Button 
                                    size="sm" 
                                    className="w-full"
                                    onClick={() => window.location.href = `/doctors/${doctor.id}`}
                                  >
                                    View Profile
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="w-full"
                                    onClick={() => window.location.href = `/appointment/new?doctorId=${doctor.id}`}
                                  >
                                    Book Appointment
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Medical Disclaimer</AlertTitle>
                  <AlertDescription>
                    This tool provides general information only and should not be used as a substitute for professional medical advice.
                    Always consult with a qualified healthcare provider for diagnosis and treatment.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}

          {/* Show error if symptoms check fails */}
          {checkError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {checkError.message || 'Failed to analyze symptoms. Please try again later.'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-start text-sm text-muted-foreground">
          <p>This symptom checker uses machine learning algorithms to help identify potential health concerns.</p>
          <p>Your health information is never stored or shared.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SymptomChecker;