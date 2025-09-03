import React, { useState } from 'react';

interface WeatherControlsProps {
  onAltitudeChange: (altitude: string) => void;
  onTimeChange: (time: string) => void;
}

const altitudes = ['10m', '100m', '250m', '500m', '850hPa', '700hPa'] as const;

export const WeatherControls: React.FC<WeatherControlsProps> = ({ onAltitudeChange, onTimeChange }) => {
  const [selectedAltitude, setSelectedAltitude] = useState<string>('10m');
  const [selectedTime, setSelectedTime] = useState<string>('now');

  const handleAltitudeChange = (alt: string) => {
    setSelectedAltitude(alt);
    onAltitudeChange(alt);
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    onTimeChange(time);
  };

  return (
    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
      <h3 className="text-lg font-medium mb-3">Kontrola warstw pogodowych</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wysokość
          </label>
          <select
            value={selectedAltitude}
            onChange={(e) => handleAltitudeChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {altitudes.map((alt) => (
              <option key={alt} value={alt}>{alt}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Czas
          </label>
          <input
            type="datetime-local"
            value={selectedTime === 'now' ? new Date().toISOString().slice(0, 16) : selectedTime}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => handleTimeChange('now')}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Teraz
        </button>
        <button
          onClick={() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            handleTimeChange(tomorrow.toISOString().slice(0, 16));
          }}
          className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Jutro
        </button>
      </div>
    </div>
  );
};
