
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import NewBookingForm from "../Bookings/NewBookingForm";
import { useState } from "react";

export const CalendarTimeline = ({ vehicles }) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);

  const openBookingDialog = (hour, vehicle) => {
    setSelectedVehicle(vehicle);
    setSelectedHour(hour);
    setDialogVisible(true);
  };

  const renderBookingDialog = () => {
    return (
      <Dialog
        header="Nouvelle réservation"
        visible={dialogVisible}
        style={{ width: '90vw', height: '90vh' }}
        onHide={() => setDialogVisible(false)}
        maximizable
      >
        <NewBookingForm />
      </Dialog>
    );
  };

  return (
    <div className="overflow-auto">
      {vehicles.map((vehicle) => (
        <div key={vehicle.id} className="flex border-bottom-1">
          <div className="w-12rem flex-shrink-0 border-right-1 p-2">
            <div className="flex align-items-center gap-2">
              <i className="pi pi-car text-500" style={{ fontSize: '1rem' }}></i>
              <div>
                <div className="text-sm font-medium">{vehicle.id}</div>
                <div className="text-xs text-500">{vehicle.name}</div>
              </div>
            </div>
          </div>
          <div className="flex flex-1 relative">
            {Array.from({ length: 24 }, (_, hour) => (
              <Button 
                key={hour}
                className="flex-shrink-0 w-5rem border-right-1 hover:bg-gray-50 transition-colors cursor-pointer h-full"
                text
                onClick={() => openBookingDialog(hour, vehicle)}
              />
            ))}
            {vehicle.id === "A025" && (
              <div 
                className="absolute top-1 left-40rem w-10rem bg-blue-100 border-1 border-blue-200 border-round-sm p-1 text-xs"
                style={{ height: "calc(100% - 8px)" }}
              >
                <div className="font-medium">Réservation</div>
                <div className="text-500">8:00 - 12:00</div>
              </div>
            )}
            {renderBookingDialog()}
          </div>
        </div>
      ))}
    </div>
  );
};
