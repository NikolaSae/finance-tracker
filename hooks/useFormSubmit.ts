import { toast } from "react-toastify";

export const useFormSubmit = () => {
  const handleFormSubmit = async (newContract: BulkService) => {
    try {
      const response = await fetch("/api/contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContract),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Error during server communication");
    }
  };

  return { handleFormSubmit };
};
