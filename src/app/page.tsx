// src/app/page.tsx
import Header from "@/components/Header";
import TileGrid from "@/components/TileGrid";
import ProtectedRoute from "@/lib/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gradient-to-br from-gray-25 via-blue-50/30 to-purple-50/20">
      <Header />
      <main>
        <TileGrid />
      </main>
      
      {/* Sophisticated Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-100 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="text-gray-600 text-sm">HIDDEN Platform © 2025</span>
            </div>
            <div className="flex space-x-6">
              {['Confidentialité', 'Conditions', 'Support', 'API'].map((item) => (
                <button key={item} className="text-gray-500 hover:text-gray-700 text-sm transition-colors duration-200">
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
    </ProtectedRoute>
  );
}