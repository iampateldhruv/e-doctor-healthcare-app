import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Medicine } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MedicineDetailProps {
  medicineId: string;
  onClose: () => void;
}

const MedicineDetail = ({ medicineId, onClose }: MedicineDetailProps) => {
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState<string | undefined>(undefined);

  const { data: medicine, isLoading } = useQuery<Medicine>({
    queryKey: [`/api/medicines/${medicineId}`],
    queryFn: async () => {
      const res = await fetch(`/api/medicines/${medicineId}`);
      if (!res.ok) throw new Error('Failed to fetch medicine details');
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="h-64 bg-gray-200 rounded mb-4"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!medicine) {
    return null;
  }

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const handleThumbnailClick = (thumbnail: string) => {
    setMainImage(thumbnail);
  };

  const displayedImage = mainImage || medicine.image;
  const thumbnails = medicine.thumbnails || [];

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">{medicine.name}</h3>
          <button className="text-gray-400 hover:text-gray-500" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <img 
                className="w-full object-contain bg-white border rounded-lg" 
                src={displayedImage} 
                alt={medicine.name}
                style={{ maxHeight: '300px' }}
              />
              
              {thumbnails.length > 0 && (
                <div className="mt-6 grid grid-cols-4 gap-2">
                  {thumbnails.map((thumbnail, index) => (
                    <img 
                      key={index}
                      className={`border rounded cursor-pointer ${displayedImage === thumbnail ? 'border-primary' : ''}`} 
                      src={thumbnail} 
                      alt={`${medicine.name} thumbnail ${index}`}
                      onClick={() => handleThumbnailClick(thumbnail)}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <div className="flex items-center mb-4">
                <Badge className={`${medicine.requiredPrescription ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'} mr-2`}>
                  {medicine.requiredPrescription ? 'Prescription Required' : 'Over-the-counter'}
                </Badge>
                <span className="text-sm text-gray-500">SKU: {medicine.id}</span>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500">Manufacturer</h4>
                <p className="font-medium text-gray-900">{medicine.manufacturer}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500">Dosage</h4>
                <p className="font-medium text-gray-900">{medicine.dosage} | {medicine.count}</p>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500">Price</h4>
                <p className="text-2xl font-bold text-gray-900">{medicine.price}</p>
                <p className="text-sm text-gray-500">Insurance may cover part or all of this cost</p>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500">Quantity</h4>
                <div className="flex items-center mt-1">
                  <button 
                    className="border border-gray-300 rounded-l-md px-3 py-1"
                    onClick={handleDecrement}
                  >
                    -
                  </button>
                  <input 
                    type="text" 
                    value={quantity} 
                    readOnly
                    className="w-12 text-center border-t border-b border-gray-300 py-1"
                  />
                  <button 
                    className="border border-gray-300 rounded-r-md px-3 py-1"
                    onClick={handleIncrement}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button className="w-full bg-primary text-white py-2 rounded-md hover:bg-blue-600 transition duration-200">
                  Add to Cart
                </Button>
                {medicine.requiredPrescription && (
                  <Button variant="outline" className="w-full border border-primary text-primary py-2 rounded-md hover:bg-blue-50 transition duration-200">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Prescription
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-10 border-t border-gray-200 pt-6">
            <Tabs defaultValue="description">
              <TabsList className="flex border-b border-gray-200 mb-4">
                <TabsTrigger value="description" className="px-4 py-2 font-medium">
                  Description
                </TabsTrigger>
                <TabsTrigger value="usage" className="px-4 py-2 font-medium">
                  Usage Information
                </TabsTrigger>
                <TabsTrigger value="sideEffects" className="px-4 py-2 font-medium">
                  Side Effects
                </TabsTrigger>
                <TabsTrigger value="storage" className="px-4 py-2 font-medium">
                  Storage
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="py-4">
                <h4 className="text-lg font-medium text-gray-900 mb-2">About {medicine.name}</h4>
                <p className="text-gray-600 mb-4">{medicine.description}</p>
              </TabsContent>
              
              <TabsContent value="usage" className="py-4">
                <h4 className="text-lg font-medium text-gray-900 mb-2">How It Works</h4>
                <p className="text-gray-600 mb-4">{medicine.usage}</p>
              </TabsContent>
              
              <TabsContent value="sideEffects" className="py-4">
                <h4 className="text-lg font-medium text-gray-900 mb-2">Side Effects</h4>
                <p className="text-gray-600 mb-4">{medicine.sideEffects || "Information not available"}</p>
              </TabsContent>
              
              <TabsContent value="storage" className="py-4">
                <h4 className="text-lg font-medium text-gray-900 mb-2">Storage Instructions</h4>
                <p className="text-gray-600">{medicine.storage || "Store at room temperature away from moisture and heat."}</p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineDetail;
