import { MapProvider } from './MapContext';
import { MapCanvas } from './MapCanvas';
import { LayerControl } from './ui/LayerControl';

const Map = () => {
  return (
    <MapProvider>
      <div className="relative w-full h-full">
        <LayerControl />
        <MapCanvas />
      </div>
    </MapProvider>
  );
};

export default Map;