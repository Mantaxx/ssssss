import Map from './components/Map';

function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-900 text-white">
      <header className="absolute top-0 left-0 z-10 w-full p-4 bg-black bg-opacity-50 backdrop-blur-sm">
        <h1 className="text-2xl font-bold">Columba - Platforma Wyścigów Gołębi</h1>
        <p className="text-sm text-gray-300">Wizualizacja lotów i analiza pogodowa</p>
      </header>

      <main className="w-full h-full">
        <Map />
      </main>

      <aside className="absolute top-1/4 left-4 z-10 p-4 bg-black bg-opacity-70 rounded-lg w-80 backdrop-blur-sm">
        <h2 className="text-lg font-semibold mb-2">Panel Sterowania</h2>
        <p className="text-gray-400 text-sm">
          Tutaj znajdą się opcje do sterowania wizualizacją, wyboru lotów, itp.
        </p>
        {/* Placeholder for controls */}
      </aside>
    </div>
  );
}

export default App;
