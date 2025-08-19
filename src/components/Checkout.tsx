
import CheckoutStep1 from "../components/CheckoutStep1_Cep";
import CheckoutStep2 from "../components/CheckoutStep2_Pagamento";
import { useState } from "react";



export default function Checkout() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    cep: "",
    endereco: {},
    pagamento: {},
  });

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  const updateFormData = (newData: any) =>
    setFormData((prev) => ({ ...prev, ...newData }));

  return (
    <div>
      {step === 1 && <CheckoutStep1 onNext={handleNext} updateData={updateFormData} />}
      {step === 2 && (
        <CheckoutStep2
          onNext={handleNext}
          onBack={handleBack}
          updateData={updateFormData}
          data={formData} 
        />
      )}
    </div>
  );
}
