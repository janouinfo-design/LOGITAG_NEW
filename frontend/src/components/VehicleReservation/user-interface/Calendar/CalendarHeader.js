
import React from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

export const CalendarHeader = () => {
  return (
    <div className="border-bottom-1 p-4">
      <div className="flex align-items-center gap-4">
        <div className="flex align-items-center gap-2">
          <InputText
            value="17.02.2025 - 23.02.2025"
            className="w-12rem rounded-md"
          />
          <Button icon="pi pi-chevron-left" outlined className="p-button-rounded p-button-sm" />
          <Button icon="pi pi-chevron-right" outlined className="p-button-rounded p-button-sm" />
        </div>
        <div className="flex align-items-center gap-2">
          <Button label="Jour" className="text-sm" />
          <Button label="Semaine" outlined className="text-sm" />
        </div>
      </div>
    </div>
  );
};
