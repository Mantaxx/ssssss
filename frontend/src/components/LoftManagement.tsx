import React, { useState, useEffect } from 'react';
import { useMap } from '../hooks/useMap';

interface Loft {
  id: number;
  address: string;
  latitude: number;
  longitude: number;
  is_verified: boolean;
  fancierName?: string;
}

interface LoftManagementProps {
  map: any;
}

export const LoftManagement: React.FC<LoftManagementProps> = ({ map }) => {
  const [lofts, setLofts] = useState<Loft[]>([]);
  const [selectedLoft, setSelectedLoft] = useState<Loft | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');

  const handleMapClick = (e: any) => {
    if (!isAdding) return;
    
    const { lng, lat } = e.lngLat;
    const newLoft: Loft = {
      id: Date.now(),
      address: searchAddress || `Gołębnik ${lng.toFixed(4)}, ${lat.toFixed(4)}`,
      latitude: lat,
      longitude: lng,
      is_verified: false,
    };
    
    setLofts(prev => [...prev, newLoft]);
    setIsAdding(false);
    setSearchAddress('');
  };

  const handleVerifyLoft = (loftId: number) => {
    setLofts(prev => prev.map(loft => 
      loft.id === loftId ? { ...loft, is_verified: true } : loft
    ));
  };

  const handleDeleteLoft = (loftId: number) => {
    setLofts(prev => prev.filter(loft => loft.id !== loftId));
  };

  useEffect(() => {
    if (!map) return;
    
    map.on('click', handleMapClick);
    
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, isAdding, searchAddress]);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-medium mb-4">Zarządzanie gołębnikami</h3>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Wyszukaj adres..."
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-2"
        />
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`px-4 py-2 rounded-md ${
            isAdding 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isAdding ? 'Anuluj dodawanie' : 'Dodaj gołębnik'}
        </button>
        {isAdding && (
          <p className="text-sm text-gray-600 mt-2">
            Kliknij na mapie, aby umieścić gołębnik
          </p>
        )}
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {lofts.map((loft) => (
          <div
            key={loft.id}
            className={`p-3 border rounded-md ${
              loft.is_verified ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{loft.address}</p>
                <p className="text-sm text-gray-600">
                  {loft.latitude.toFixed(4)}, {loft.longitude.toFixed(4)}
                </p>
                <span className={`text-xs px-2 py-1 rounded ${
                  loft.is_verified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {loft.is_verified ? 'Zweryfikowany' : 'Do weryfikacji'}
                </span>
              </div>
              <div className="flex gap-1">
                {!loft.is_verified && (
                  <button
                    onClick={() => handleVerifyLoft(loft.id)}
                    className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    ✓
                  </button>
                )}
                <button
                  onClick={() => handleDeleteLoft(loft.id)}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {lofts.length === 0 && (
        <p className="text-gray-500 text-center py-4">
          Brak gołębników. Dodaj pierwszy gołębnik klikając na mapie.
        </p>
      )}
    </div>
  );
};
