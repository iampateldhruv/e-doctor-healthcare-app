import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Upload, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface PrescriptionUploadProps {
  userId: number;
}

const PrescriptionUpload = ({ userId }: PrescriptionUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUrgent, setIsUrgent] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setFileError("File size should not exceed 10MB");
        setSelectedFile(null);
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setFileError("Only JPG, PNG, GIF, and PDF files are allowed");
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
      setFileError(null);
    }
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error("No file selected");
      
      const formData = new FormData();
      formData.append('prescription', selectedFile);
      formData.append('userId', userId.toString());
      formData.append('isUrgent', isUrgent.toString());
      
      const response = await fetch('/api/prescriptions/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error("Failed to upload prescription");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Prescription uploaded successfully",
        description: "We'll notify you when your prescription has been processed.",
        variant: "default",
      });
      setSelectedFile(null);
      setIsUrgent(false);
      queryClient.invalidateQueries({ queryKey: ['/api/prescriptions', userId] });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setFileError("Please select a file");
      return;
    }
    uploadMutation.mutate();
  };

  return (
    <div className="bg-blue-50 rounded-lg p-6 mb-8">
      <div className="md:flex items-center">
        <div className="md:w-1/2 mb-6 md:mb-0 md:pr-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Your Prescription</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload your prescription and our pharmacists will process it for you. 
            We'll notify you when your medication is ready for pickup or delivery.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div 
              className={`border-2 border-dashed ${
                fileError ? 'border-red-300' : selectedFile ? 'border-green-300' : 'border-gray-300'
              } rounded-lg p-6 text-center cursor-pointer relative`}
              onClick={() => document.getElementById("prescription")?.click()}
            >
              <Input 
                type="file" 
                id="prescription" 
                name="prescription" 
                className="hidden" 
                accept="image/*, application/pdf" 
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center justify-center">
                {selectedFile ? (
                  <>
                    <Check className="text-4xl text-green-500 mb-3" />
                    <p className="text-sm text-gray-700 mb-1">File selected: {selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="text-4xl text-gray-400 mb-3" />
                    <p className="text-sm text-gray-700 mb-1">
                      Drag and drop your prescription here or click to browse
                    </p>
                    <p className="text-xs text-gray-500">
                      Accepted formats: JPG, PNG, PDF (Max: 10MB)
                    </p>
                  </>
                )}
              </div>
            </div>
            
            {fileError && (
              <p className="text-sm text-red-500 mt-1">{fileError}</p>
            )}
            
            <div className="mt-4">
              <div className="flex items-start">
                <Checkbox 
                  id="urgent" 
                  checked={isUrgent} 
                  onCheckedChange={(checked) => setIsUrgent(checked as boolean)}
                  className="h-4 w-4 mt-1"
                />
                <div className="ml-3 text-sm">
                  <Label htmlFor="urgent" className="font-medium text-gray-700">
                    Mark as urgent
                  </Label>
                  <p className="text-gray-500">We'll prioritize processing your prescription</p>
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="mt-4 w-full"
              disabled={!selectedFile || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Prescription"
              )}
            </Button>
          </form>
        </div>
        
        <div className="md:w-1/2 md:pl-6 md:border-l border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">How It Works</h3>
          <ul className="space-y-4">
            <li className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white text-sm font-bold">
                  1
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Upload Prescription</p>
                <p className="text-sm text-gray-500">
                  Take a clear photo or scan of your prescription
                </p>
              </div>
            </li>
            <li className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white text-sm font-bold">
                  2
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Pharmacist Review</p>
                <p className="text-sm text-gray-500">
                  Our licensed pharmacists verify your prescription
                </p>
              </div>
            </li>
            <li className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white text-sm font-bold">
                  3
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Payment & Delivery</p>
                <p className="text-sm text-gray-500">
                  Choose delivery or pickup options and complete payment
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionUpload;
