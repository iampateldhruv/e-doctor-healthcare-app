import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/lib/types";
import PrescriptionUpload from "@/components/pharmacy/PrescriptionUpload";
import MedicineCategories from "@/components/pharmacy/MedicineCategories";
import MedicineList from "@/components/pharmacy/MedicineList";
import MedicineDetail from "@/components/pharmacy/MedicineDetail";

const Pharmacy = () => {
  const [selectedMedicineId, setSelectedMedicineId] = useState<string | null>(null);

  const { data: user } = useQuery<User>({
    queryKey: ['/api/users/current'],
  });

  const handleOpenMedicineDetail = (id: string) => {
    setSelectedMedicineId(id);
  };

  const handleCloseMedicineDetail = () => {
    setSelectedMedicineId(null);
  };

  // Extract medicine ID from URL if present
  if (window.location.hash.startsWith('#/medicine/')) {
    const medicineId = window.location.hash.replace('#/medicine/', '');
    if (medicineId && medicineId !== selectedMedicineId) {
      setSelectedMedicineId(medicineId);
    }
  }

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white shadow-md rounded-lg mt-8">
      <div className="border-b border-gray-200 pb-5 mb-5">
        <h2 className="text-2xl font-bold text-gray-800">Pharmacy</h2>
        <p className="mt-1 text-sm text-gray-500">
          Browse medications or upload your prescription for delivery
        </p>
      </div>
      
      {/* Prescription Upload Section */}
      {user && (
        <PrescriptionUpload userId={user.id} />
      )}
      
      {/* Medicine Categories */}
      <MedicineCategories />
      
      {/* Featured Medications */}
      <MedicineList />
      
      {/* Medicine Detail Modal */}
      {selectedMedicineId && (
        <MedicineDetail 
          medicineId={selectedMedicineId} 
          onClose={handleCloseMedicineDetail} 
        />
      )}
    </section>
  );
};

export default Pharmacy;
