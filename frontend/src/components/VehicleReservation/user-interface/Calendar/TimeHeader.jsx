
export const TimeHeader = () => {
  return (
    <div className="flex border-bottom-1">
      <div className="w-12rem flex-shrink-0 border-right-1 p-2 font-medium">
        Véhicules
      </div>
      <div className="flex flex-1 overflow-x-auto">
        {Array.from({ length: 24 }, (_, i) => (
          <div 
            key={i} 
            className="flex-shrink-0 w-5rem border-right-1 px-2 py-2 text-xs text-500 text-center"
          >
            {`${i}:00`}
          </div>
        ))}
      </div>
    </div>
  );
};
