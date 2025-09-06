import { useState } from 'react';
import { WindLayer } from '../layers/WindLayer';

const ALTITUDES = ['10m', '100m', '250m', '500m', '850hPa', '700hPa'] as const;
type Altitude = (typeof ALTITUDES)[number];

export const LayerControl = () => {
  const [showWind, setShowWind] = useState(false);
  const [selectedAltitude, setSelectedAltitude] = useState<Altitude>('10m');

  return (
    <div className="absolute top-4 right-4 bg-gray-800 bg-opacity-70 text-white p-4 rounded-lg shadow-lg z-10 w-64">
      <h3 className="text-lg font-bold mb-2">Warstwy</h3>
      <div className="flex items-center justify-between">
        <label htmlFor="wind-checkbox" className="text-sm font-medium">
          Animacja wiatru
        </label>
        <input
          id="wind-checkbox"
          type="checkbox"
          checked={showWind}
          onChange={(e) => setShowWind(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-600 ring-offset-gray-800 focus:ring-2"
        />
      </div>
      {showWind && (
        <div className="mt-4">
          <label
            htmlFor="altitude-select"
            className="block text-sm font-medium mb-1"
          >
            Wysokość
          </label>
          <select
            id="altitude-select"
            value={selectedAltitude}
            onChange={(e) => setSelectedAltitude(e.target.value as Altitude)}
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          >
            {ALTITUDES.map((alt) => (
              <option key={alt} value={alt}>
                {alt}
              </option>
            ))}
          </select>
        </div>
      )}
      {showWind && <WindLayer altitude={selectedAltitude} />}
    </div>
  );
};

