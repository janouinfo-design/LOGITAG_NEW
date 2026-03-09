import { Button } from "primereact/button";
export const OperatorButton = ({ icon: Icon, label, onClick }) => {
  return (
    <Button
      variant="ghost"
      className="w-full h-12 bg-white hover:bg-violet-50 border border-gray-200 transition-all duration-200 ease-in-out"
      onClick={onClick}
    >
      {label}
    </Button>
  );
};