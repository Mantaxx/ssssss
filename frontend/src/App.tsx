import React, { useState } from 'react';
import { MapView } from './components/MapView';
import { VoiceCommands } from './components/Voice/VoiceCommands';
import { WeatherControls } from './components/WeatherControls';

export const App: React.FC = () => {
  const [altitude, setAltitude] = useState<string>('10m');
  const [time, setTime] = useState<string>('now');

  const handleVoice = (cmd: { layer?: string; altitude?: string; time?: string }) => {
    if (cmd.altitude) setAltitude(cmd.altitude);
    if (cmd.time) setTime(cmd.time);
    // eslint-disable-next-line no-console
    console.log('voice cmd', cmd);
  };

  const handleAltitudeChange = (alt: string) => {
    setAltitude(alt);
  };

  const handleTimeChange = (t: string) => {
    setTime(t);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <h1 className="text-2xl font-semibold">columba — mapa i analizy</h1>
      <p className="mt-2">placeholder interfejsu mapy (Mapbox GL JS)</p>
      <MapView altitude={altitude} time={time} />
      <WeatherControls 
        onAltitudeChange={handleAltitudeChange}
        onTimeChange={handleTimeChange}
      />
      <VoiceCommands onCommand={handleVoice} />
    </div>
  );
};

