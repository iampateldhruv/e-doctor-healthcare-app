import { KMeans } from 'ml-kmeans';
import { Matrix } from 'ml-matrix';
import { euclidean } from 'ml-distance-euclidean';

// This file implements a symptom checker using ML techniques
// It uses K-means clustering to group symptoms and identify potential diseases

// Define symptom names and their corresponding indices in the symptom vector
export const symptoms = [
  'fever', 'cough', 'shortness_of_breath', 'fatigue', 'headache',
  'sore_throat', 'muscle_pain', 'loss_of_taste_or_smell', 'chest_pain',
  'runny_nose', 'nausea', 'vomiting', 'diarrhea', 'rash', 'joint_pain',
  'abdominal_pain', 'dizziness', 'chills', 'weight_loss', 'night_sweats',
  'blurred_vision', 'increased_thirst', 'frequent_urination', 'irregular_heartbeat',
  'swollen_lymph_nodes', 'blood_in_stool', 'blood_in_urine', 'ear_pain', 'eye_pain',
  'back_pain'
];

// Define disease names and their corresponding symptom patterns
export const diseases = [
  {
    name: 'Common Cold',
    specialty: 'General Practitioner',
    symptoms: ['fever', 'cough', 'sore_throat', 'runny_nose', 'headache']
  },
  {
    name: 'Influenza (Flu)',
    specialty: 'General Practitioner',
    symptoms: ['fever', 'cough', 'fatigue', 'muscle_pain', 'headache', 'chills']
  },
  {
    name: 'COVID-19',
    specialty: 'Infectious Disease',
    symptoms: ['fever', 'cough', 'shortness_of_breath', 'fatigue', 'loss_of_taste_or_smell', 'sore_throat']
  },
  {
    name: 'Pneumonia',
    specialty: 'Pulmonologist',
    symptoms: ['fever', 'cough', 'shortness_of_breath', 'chest_pain', 'fatigue']
  },
  {
    name: 'Asthma',
    specialty: 'Pulmonologist',
    symptoms: ['shortness_of_breath', 'chest_pain', 'cough']
  },
  {
    name: 'Heart Disease',
    specialty: 'Cardiologist',
    symptoms: ['chest_pain', 'shortness_of_breath', 'fatigue', 'irregular_heartbeat']
  },
  {
    name: 'Gastroenteritis',
    specialty: 'Gastroenterologist',
    symptoms: ['nausea', 'vomiting', 'diarrhea', 'abdominal_pain']
  },
  {
    name: 'Irritable Bowel Syndrome (IBS)',
    specialty: 'Gastroenterologist',
    symptoms: ['abdominal_pain', 'diarrhea', 'bloating']
  },
  {
    name: 'Urinary Tract Infection (UTI)',
    specialty: 'Urologist',
    symptoms: ['frequent_urination', 'blood_in_urine', 'abdominal_pain']
  },
  {
    name: 'Migraine',
    specialty: 'Neurologist',
    symptoms: ['headache', 'blurred_vision', 'nausea']
  },
  {
    name: 'Diabetes Type 2',
    specialty: 'Endocrinologist',
    symptoms: ['increased_thirst', 'frequent_urination', 'fatigue', 'weight_loss']
  },
  {
    name: 'Allergic Rhinitis',
    specialty: 'Allergist',
    symptoms: ['runny_nose', 'sneezing', 'itchy_eyes']
  },
  {
    name: 'Osteoarthritis',
    specialty: 'Rheumatologist',
    symptoms: ['joint_pain', 'stiffness', 'swelling']
  },
  {
    name: 'Rheumatoid Arthritis',
    specialty: 'Rheumatologist',
    symptoms: ['joint_pain', 'joint_swelling', 'fatigue', 'fever']
  },
  {
    name: 'Depression',
    specialty: 'Psychiatrist',
    symptoms: ['fatigue', 'loss_of_interest', 'weight_changes', 'sleep_disturbances']
  },
  {
    name: 'Anxiety Disorder',
    specialty: 'Psychiatrist',
    symptoms: ['excessive_worry', 'restlessness', 'fatigue', 'muscle_tension']
  }
];

// Convert symptom names to a binary feature vector
function symptomsToFeatureVector(userSymptoms: string[]): number[] {
  return symptoms.map(symptom => userSymptoms.includes(symptom) ? 1 : 0);
}

// Convert disease symptom patterns to feature vectors for training
function createTrainingData(): number[][] {
  return diseases.map(disease => 
    symptomsToFeatureVector(disease.symptoms)
  );
}

// Find the most similar disease based on symptoms
export function identifyDisease(userSymptoms: string[]): { 
  disease: string, 
  specialty: string,
  confidence: number
} {
  // Check if user provided any symptoms
  if (!userSymptoms || userSymptoms.length === 0) {
    return { 
      disease: 'Unknown', 
      specialty: 'General Practitioner',
      confidence: 0 
    };
  }

  // Convert user symptoms to feature vector
  const userFeatureVector = symptomsToFeatureVector(userSymptoms);
  
  // Get training data from diseases
  const trainingData = createTrainingData();
  
  // Calculate similarity (using Euclidean distance) between user symptoms and all diseases
  const similarities = trainingData.map((diseaseVector, index) => {
    const distance = euclidean(userFeatureVector, diseaseVector);
    // Convert distance to similarity score (higher is better)
    // We use 1/(1+distance) to get a score between 0 and 1
    const similarity = 1 / (1 + distance);
    return { 
      index, 
      similarity 
    };
  });
  
  // Sort diseases by similarity (highest first)
  similarities.sort((a, b) => b.similarity - a.similarity);
  
  // Get the most similar disease
  const topMatch = similarities[0];
  const matchedDisease = diseases[topMatch.index];
  
  return {
    disease: matchedDisease.name,
    specialty: matchedDisease.specialty,
    confidence: topMatch.similarity
  };
}

// Recommend a list of possible diseases and specialists based on symptoms
export function recommendSpecialists(userSymptoms: string[]): {
  possibleDiseases: { name: string, confidence: number }[],
  recommendedSpecialists: string[]
} {
  // Check if user provided any symptoms
  if (!userSymptoms || userSymptoms.length === 0) {
    return { 
      possibleDiseases: [],
      recommendedSpecialists: ['General Practitioner']
    };
  }

  // Convert user symptoms to feature vector
  const userFeatureVector = symptomsToFeatureVector(userSymptoms);
  
  // Get training data from diseases
  const trainingData = createTrainingData();
  
  // Calculate similarity between user symptoms and all diseases
  const similarities = trainingData.map((diseaseVector, index) => {
    const distance = euclidean(userFeatureVector, diseaseVector);
    // Convert distance to similarity score (higher is better)
    const similarity = 1 / (1 + distance);
    return { 
      index, 
      similarity, 
      name: diseases[index].name,
      specialty: diseases[index].specialty
    };
  });
  
  // Sort diseases by similarity (highest first)
  similarities.sort((a, b) => b.similarity - a.similarity);
  
  // Get the top 3 matches as possible diseases
  const topMatches = similarities.slice(0, 3);
  
  // Extract unique specialists from top matches
  const specialistSet = new Set<string>();
  topMatches.forEach(match => {
    specialistSet.add(diseases[match.index].specialty);
  });
  
  return {
    possibleDiseases: topMatches.map(match => ({
      name: match.name,
      confidence: match.similarity
    })),
    recommendedSpecialists: Array.from(specialistSet)
  };
}