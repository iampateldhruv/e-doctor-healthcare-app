import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Medicine } from "@/lib/types";
import { useParams, useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";

const MedicineDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [_, setLocation] = useLocation();

  const { data: medicine, isLoading } = useQuery<Medicine>({
    queryKey: [`/api/medicines/${id}`],
    queryFn: async () => {
      const res = await fetch(`/api/medicines/${id}`);
      if (!res.ok) throw new Error("Failed to fetch medicine details");
      return res.json();
    },
  });

  // Redirect if not found
  useEffect(() => {
    if (!isLoading && !medicine) {
      setLocation("/pharmacy");
    }
  }, [medicine, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded w-1/3"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-24 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (!medicine) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/pharmacy">
          <a className="text-primary hover:text-blue-700 flex items-center">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Pharmacy
          </a>
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="bg-white border rounded-lg p-4 flex items-center justify-center mb-4">
              <img
                src={medicine.image || "https://via.placeholder.com/400"}
                alt={medicine.name}
                className="max-h-96 object-contain"
              />
            </div>

            {medicine.thumbnails && medicine.thumbnails.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {medicine.thumbnails.map((thumbnail, index) => (
                  <img
                    key={index}
                    className="border rounded cursor-pointer object-contain h-20"
                    src={thumbnail}
                    alt={`${medicine.name} thumbnail ${index}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center">
              <Badge
                className={`${medicine.requiredPrescription ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"} mr-2`}
              >
                {medicine.requiredPrescription
                  ? "Prescription Required"
                  : "Over-the-counter"}
              </Badge>
              <span className="text-sm text-gray-500">SKU: {medicine.id}</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {medicine.name}
            </h1>
            {medicine.genericName && (
              <p className="text-lg text-gray-600 mb-4">
                Generic Name: {medicine.genericName}
              </p>
            )}

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500">
                Manufacturer
              </h4>
              <p className="font-medium text-gray-900">
                {medicine.manufacturer}
              </p>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500">Dosage</h4>
              <p className="font-medium text-gray-900">
                {medicine.dosage} | {medicine.count}
              </p>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500">Price</h4>
              <p className="text-3xl font-bold text-gray-900">
                {medicine.price}
              </p>
              <p className="text-sm text-gray-500">
                Insurance may cover part or all of this cost
              </p>
            </div>

            <div className="flex items-center mb-6">
              <label
                htmlFor="quantity"
                className="mr-3 text-sm font-medium text-gray-500"
              >
                Quantity:
              </label>
              <div className="flex border border-gray-300 rounded">
                <button className="px-3 py-1 border-r border-gray-300">
                  -
                </button>
                <input
                  type="text"
                  id="quantity"
                  value="1"
                  readOnly
                  className="w-12 text-center"
                />
                <button className="px-3 py-1 border-l border-gray-300">
                  +
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <Button className="w-full bg-primary text-white py-3 text-lg">
                
                <Link href="/cart">ADD TO CART</Link>
              </Button>
              {medicine.requiredPrescription && (
                <Button
                  variant="outline"
                  className="w-full border-primary text-primary py-3 text-lg"
                >
                  Upload Prescription
                </Button>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="description" className="mt-8">
          <TabsList className="border-b border-gray-200 w-full">
            <TabsTrigger value="description" className="text-base">
              Description
            </TabsTrigger>
            <TabsTrigger value="usage" className="text-base">
              Usage Information
            </TabsTrigger>
            <TabsTrigger value="sideEffects" className="text-base">
              Side Effects
            </TabsTrigger>
            <TabsTrigger value="storage" className="text-base">
              Storage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              About {medicine.name}
            </h3>
            <p className="text-gray-600">{medicine.description}</p>
          </TabsContent>

          <TabsContent value="usage" className="py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              How It Works
            </h3>
            <p className="text-gray-600">{medicine.usage}</p>
          </TabsContent>

          <TabsContent value="sideEffects" className="py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Side Effects
            </h3>
            <p className="text-gray-600">
              {medicine.sideEffects || "Information not available"}
            </p>
          </TabsContent>

          <TabsContent value="storage" className="py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Storage Instructions
            </h3>
            <p className="text-gray-600">
              {medicine.storage ||
                "Store at room temperature away from moisture and heat."}
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MedicineDetailPage;
