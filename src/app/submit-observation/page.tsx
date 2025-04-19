// Renamed component import
import { ObservationEntryForm } from "@/components/ObservationEntryForm";

// Renamed page function
export default function SubmitObservationPage() {
  return (
    // Added padding and centered the form
    <div className="container mx-auto px-4 py-12 flex justify-center">
      <ObservationEntryForm />
    </div>
  );
}