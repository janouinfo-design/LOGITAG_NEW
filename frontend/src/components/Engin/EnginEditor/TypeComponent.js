import React, { useState } from 'react';

const TypeComponent = ({ enginID, types, onAddType, onRemoveType }) => {
  const [isAddingType, setAddingType] = useState(false);
  const [newType, setNewType] = useState('');

  const handleAddType = () => {
    if (newType.trim() !== '') {
      onAddType(enginID, { type: newType });
      setNewType('');
      setAddingType(false);
    }
  };

  const handleRemoveType = (typeToRemove) => {
    onRemoveType(enginID, typeToRemove);
  };

  return (
    <div className="type-component">
      {isAddingType ? (
        <div>
          <input
            type="text"
            placeholder="Type"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
          />
          <button onClick={handleAddType}>Add</button>
          <button onClick={() => setAddingType(false)}>Cancel</button>
        </div>
      ) : (
        <div>
          {types?.map((type, index) => (
            <div key={index}>
              {type.type}
              <button onClick={() => handleRemoveType(type)}>Remove</button>
            </div>
          ))}
          <button onClick={() => setAddingType(true)}>Add Type</button>
        </div>
      )}
    </div>
  );
};

export default TypeComponent;
