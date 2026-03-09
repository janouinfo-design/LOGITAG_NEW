import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import ButtonComponent from '../../shared/ButtonComponent';

const DialogContent = ({ dataTb, selectedRow, onChangeSelection, dataKey, rowClick, rowActions, ...props }) => {

  const actionTemplate = (rowData) => {
    return (
      <Dropdown
        options={rowActions}
        onChange={(e) => e.value.command({ item: rowData })}
        placeholder="Action"
        className="w-full"
      />
    );
  };

  return (
    <div>
      <div>
        <DataTable
          value={dataTb}
          selectionMode='single'
          selection={selectedRow}
          onSelectionChange={(e) => onChangeSelection(e.value)}
          dataKey={dataKey}
          showGridlines
          onRowClick={rowClick}
        >
          <Column selectionMode='single' headerStyle={{ width: '3rem' }} />
          {props.columns.map((col, index) => (
            <Column key={index} field={col.field} header={col.header} />
          ))}
          <Column body={actionTemplate} header="Actions" />
        </DataTable>
      </div>
      <div className='flex justify-content-end mt-5'>
        {props?.addBtn !== false && (
          <ButtonComponent
            label={props.label || 'Ajouter'}
            icon={props.icon || 'pi pi-plus-circle'}
            onClick={props.onAddButtonClick}
          />
        )}
      </div>
    </div>
  );
}

export default DialogContent;