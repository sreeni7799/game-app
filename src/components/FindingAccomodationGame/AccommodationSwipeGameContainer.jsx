import React, { useState } from 'react';
import AccommodationSwipeGame from './AccommodationSwipeGame';
import LanguageLevelSelector from '../LanguageLevelSelector';

const AccommodationSwipeGameContainer = ({ onBackToGameSelection }) => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [accommodationData, setAccommodationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  // Comprehensive fallback data based on real German accommodation scenarios
  const fallbackAccommodationData = [
    {
      id: 1,
      title: "Modern Studio near University",
      location: "Near Otto-von-Guericke University",
      price: "€450/month",
      deposit: "€900",
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500",
      description: "Fully furnished studio apartment, 25m². Wi-Fi included. Available from September 1st.",
      isScam: false,
      redFlags: [],
      greenFlags: ["Reasonable deposit (2x rent)", "Near university", "Furnished", "Normal price range"]
    },
    {
      id: 2,
      title: "AMAZING LUXURY PENTHOUSE!!!",
      location: "City Center",
      price: "€200/month",
      deposit: "€3000",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500",
      description: "INCREDIBLE DEAL! Must transfer money NOW! No viewing needed! Best apartment in Magdeburg!!!",
      isScam: true,
      redFlags: ["Price too good to be true", "Urgent payment required", "No viewing allowed", "Multiple exclamation marks", "High deposit vs low rent"],
      greenFlags: []
    },
    {
      id: 3,
      title: "Shared Room in Student House",
      location: "Cracau District",
      price: "€320/month",
      deposit: "€640",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500",
      description: "Nice room in 4-person WG. Friendly international roommates. Close to tram line.",
      isScam: false,
      redFlags: [],
      greenFlags: ["Fair pricing", "Student-friendly area", "Good transport connections", "Shared accommodation"]
    },
    {
      id: 4,
      title: "Cheap Apartment - Send Money First!",
      location: "Unknown Location",
      price: "€150/month",
      deposit: "€2000",
      image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500",
      description: "Perfect apartment! Send deposit immediately via Western Union! Owner is traveling abroad.",
      isScam: true,
      redFlags: ["Suspiciously low rent", "Immediate payment demand", "Untraceable payment method", "Owner abroad excuse", "No proper viewing"],
      greenFlags: []
    },
    {
      id: 5,
      title: "Cozy 1-Room Apartment",
      location: "Stadtfeld District",
      price: "€380/month",
      deposit: "€760",
      image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500",
      description: "Well-maintained apartment. Landlord speaks English. Viewing possible on weekends.",
      isScam: false,
      redFlags: [],
      greenFlags: ["Fair pricing", "Professional communication", "Viewing offered", "English-speaking landlord"]
    },
    {
      id: 6,
      title: "Luxury Villa - Only €100/month!!!",
      location: "Exclusive Area",
      price: "€100/month",
      deposit: "€5000",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500",
      description: "Amazing villa with pool! Contact via WhatsApp only! Pay deposit to secure immediately!",
      isScam: true,
      redFlags: ["Unrealistic price", "Villa for student price", "WhatsApp only contact", "Immediate deposit demand", "No legitimate contact info"],
      greenFlags: []
    },
    {
      id: 7,
      title: "Student Dormitory Room",
      location: "University Campus",
      price: "€280/month",
      deposit: "€280",
      image: "https://images.unsplash.com/photo-1555854877-bab0e55b0ceb?w=500",
      description: "Official university dormitory. Single room with shared kitchen and bathroom. Contract through university.",
      isScam: false,
      redFlags: [],
      greenFlags: ["Official university housing", "Reasonable price", "Low deposit", "Legitimate contract"],
      
    },
    {
      id: 8,
      title: "Perfect Apartment - Act Fast!",
      location: "Magdeburg Center",
      price: "€180/month",
      deposit: "€1800",
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500",
      description: "Beautiful apartment! Many people interested! Send money today or you'll lose it! Cash only!",
      isScam: true,
      redFlags: ["Pressure tactics", "Below market price", "Cash only payment", "Creating false urgency", "No proper verification"],
      greenFlags: []
    },
    {
      id: 9,
      title: "Shared Flat with German Students",
      location: "Sudenburg",
      price: "€350/month",
      deposit: "€700",
      image: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=500",
      description: "Room in 3-person WG with German students. Good for practicing German. Includes utilities.",
      isScam: false,
      redFlags: [],
      greenFlags: ["Cultural exchange opportunity", "Utilities included", "Normal deposit amount", "Specific location given"]
    },
    {
      id: 10,
      title: "FREE Apartment - Just Pay Fees!",
      location: "Magdeburg",
      price: "€0/month",
      deposit: "€3000",
      image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500",
      description: "Free accommodation! Just pay processing fees and deposits! Limited time offer! Contact immediately!",
      isScam: true,
      redFlags: ["Nothing is free", "High fees for 'free' apartment", "Processing fee scam", "Limited time pressure", "Vague contact info"],
      greenFlags: []
    }
  ];

  const handleLevelSelect = async (level) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedLevel(level);

      // Try to fetch from your MiniGame API
      const response = await fetch('https://gamedev-2jld.onrender.com/api/minigames');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        // Format data from backend
        const formattedData = data.map((item, index) => ({
          id: item._id || index,
          title: item.title,
          location: item.location,
          price: item.price,
          deposit: item.deposit,
          image: item.image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500',
          description: item.description,
          isScam: item.isScam,
          redFlags: item.redFlags || [],
          greenFlags: item.greenFlags || []
        }));
        
        setAccommodationData(formattedData);
      } else {
        // Use fallback data if backend is empty
        console.log('No backend data found, using fallback accommodation data');
        setAccommodationData(fallbackAccommodationData);
      }
      
      setGameStarted(true);
      
    } catch (err) {
      console.error('Error loading accommodation data:', err);
      console.log('Using fallback accommodation data due to error');
      // Use fallback data on any error
      setAccommodationData(fallbackAccommodationData);
      setGameStarted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGameComplete = (success, score) => {
    setGameCompleted(true);
    setGameResult({ success, score });
  };

  const handleRestart = () => {
    setGameCompleted(false);
    setGameResult(null);
    if (selectedLevel) {
      handleLevelSelect(selectedLevel);
    }
  };

  const handleBackToLevels = () => {
    setError(null);
    setGameStarted(false);
    setGameCompleted(false);
    setSelectedLevel(null);
    setAccommodationData(null);
    setGameResult(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">🏠</div>
          <div className="text-xl font-semibold text-orange-800">
            Loading accommodation listings...
          </div>
        </div>
      </div>
    );
  }

  // Game completion screen
  if (gameCompleted && gameResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <h2 className="text-3xl font-bold mb-4 text-orange-600">🏠 Game Complete!</h2>
          <div className="text-6xl mb-4">{gameResult.success ? '🎉' : '📚'}</div>
          <p className="text-xl mb-4">
            {gameResult.success 
              ? "Alex found safe accommodation thanks to you!" 
              : "Alex needs more help avoiding scams. Try again!"
            }
          </p>
          <p className="text-lg mb-6">
            Score: <span className="font-bold text-blue-600">{gameResult.score}%</span>
          </p>
          <div className="space-y-3">
            <button
              onClick={handleRestart}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onBackToGameSelection}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Back to Games
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game started
  if (gameStarted && accommodationData) {
    return (
      <AccommodationSwipeGame
        accommodationData={accommodationData}
        level={selectedLevel}
        onComplete={handleGameComplete}
        onBack={onBackToGameSelection}
      />
    );
  }

  // Default: Start screen (no level selector needed for this game)
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-orange-600 mb-6">🏠 Accommodation Hunter</h1>
        <div className="text-6xl mb-6">🏠</div>
        <p className="text-gray-700 mb-8 leading-relaxed">
          Help Alex find safe accommodation in Magdeburg! Learn to identify rental scams and make smart housing choices. 
          <br/><br/>
          <strong>How to play:</strong> Swipe right to accept listings, left to reject suspected scams.
        </p>
        <button
          onClick={() => handleLevelSelect('general')}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors mb-4"
        >
          Start Apartment Hunt
        </button>
        <button
          onClick={onBackToGameSelection}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          Back to Games
        </button>
      </div>
    </div>
  );
};

export default AccommodationSwipeGameContainer;
