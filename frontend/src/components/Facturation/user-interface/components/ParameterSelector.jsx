//import { Card } from '@/components/ui/card';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
//import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
export const ParameterSelector = ({ onClose }) => {
  const parameters = [
    { name: 'VolumePrestation', unit: 'm³', description: 'Volume des packages liés au prestation' },
    { name: 'PoidsPrestation', unit: 'kg', description: 'Poids des packages liés au prestation' },
    { name: 'PrixPrestation', unit: 'CHF', description: 'Prix de la prestation' },
  ];
  return (
    <Card className="p-6 bg-white/95 backdrop-blur-sm animate-slideIn">
      <div className="flex justify-between items-center mb-6 bg-violet-600 -mx-6 -mt-6 p-4 text-white">
        <h3 className="text-xl font-semibold">Sélection Paramètre</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-violet-700">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid gap-4">
        {parameters.map((param) => (
          <div
            key={param.name}
            className="p-4 border border-gray-100 rounded-lg hover:bg-violet-50 transition-colors cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-800">{param.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{param.description}</p>
              </div>
              <span className="text-sm font-medium text-violet-600">{param.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};