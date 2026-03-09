import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const InputDialog = ({ visible, onHide, onSave }) => {
  const [inputValues, setInputValues] = useState(['']);
  const [newInput, setNewInput] = useState('');

  const handleInputChange = (index, value) => {
    const updatedInputs = [...inputValues];
    updatedInputs[index] = value;
    setInputValues(updatedInputs);
  };

  const handleAddInput = () => {
    setInputValues([...inputValues, newInput]);
    setNewInput('');
  };

  const handleRemoveInput = (index) => {
    const updatedInputs = [...inputValues];
    updatedInputs.splice(index, 1);
    setInputValues(updatedInputs);
  };

  const handleSave = () => {
    onSave(inputValues);
    onHide();
  };

  return (
    <Dialog
      header="Input Details"
      visible={visible}
      style={{ width: '50vw' }}
      onHide={onHide}
    >
      <div className="p-fluid">
        {inputValues.map((value, index) => (
          <div key={index} className="p-field p-grid">
            <label className="p-col-fixed" style={{ width: '100px' }}>Input {index + 1}:</label>
            <div className="p-col">
              <InputText
                value={value}
                onChange={(e) => handleInputChange(index, e.target.value)}
              />
            </div>
            <div className="p-col-fixed">
              <Button icon="pi pi-minus" onClick={() => handleRemoveInput(index)} />
            </div>
          </div>
        ))}

        <div className="p-field p-grid">
          <label className="p-col-fixed" style={{ width: '100px' }}>New Input:</label>
          <div className="p-col">
            <InputText
              value={newInput}
              onChange={(e) => setNewInput(e.target.value)}
            />
          </div>
          <div className="p-col-fixed">
            <Button icon="pi pi-plus" onClick={handleAddInput} />
          </div>
        </div>
      </div>

      <div className="p-d-flex p-jc-end">
        <Button label="Save" icon="pi pi-check" onClick={handleSave} />
      </div>
    </Dialog>
  );
};

export default InputDialog;
