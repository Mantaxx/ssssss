import { useState } from 'react';
import { WindLayer } from '../layers/WindLayer';

export const LayerControl = () => {
  const [showWind, setShowWind] = useState(false);

  return (
    <div className="absolute top-4 right-4 bg-gray-800 bg-opacity-70 text-white p-4 rounded-lg shadow-lg z-10">
      <h3 className="text-lg font-bold mb-2">Warstwy</h3>
      <div className="flex items-center">
        <input
          id="wind-checkbox"
          type="checkbox"
          checked={showWind}
          onChange={(e) => setShowWind(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-600 ring-offset-gray-800 focus:ring-2"
        />
        <label htmlFor="wind-checkbox" className="ml-2 text-sm font-medium">
          Animacja wiatru
        </label>
      </div>
      {showWind && <WindLayer />}
    </div>
  );
};