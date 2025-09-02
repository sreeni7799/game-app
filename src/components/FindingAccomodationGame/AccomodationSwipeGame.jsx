import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion';

// Sample accommodation listings (you can replace with real data)
const ACCOMMODATION_LISTINGS = [
  {
    id: 1,
    title: "Modern Studio Apartment",
    location: "Near Otto-von-Guericke University",
    price: "€450/month",
    deposit: "€900",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500",
    description: "Perfect for students. Furnished, Wi-Fi included.",
    isScam: false,
    redFlags: [],
    greenFlags: ["Reasonable deposit", "Near university", "Furnished"]
  },
  {
    id: 2,
    title: "Luxury Penthouse",
    location: "City Center",
    price: "€200/month",
    deposit: "€3000",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500",
    description: "AMAZING DEAL! Must transfer money immediately!",
    isScam: true,
    redFlags: ["Price too good to be true", "Urgent payment required", "No viewing allowed"],
    greenFlags: []
  },
  {
    id: 3,
    title: "Shared Room",
    location: "Student District",
    price: "€320/month",
    deposit: "€640",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500",
    description: "Friendly roommates, close to public transport.",
    isScam: false,
    redFlags: [],
    greenFlags: ["Reasonable price", "Good location", "Shared with students"]
  },
  {
    id: 4,
    title: "Incredible Deal!!!",
    location: "Unknown Location",
    price: "€100/month",
    deposit: "€5000",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500",
    description: "Send money NOW! No questions asked! Best deal in Magdeburg!",
    isScam: true,
    redFlags: ["Suspiciously low rent", "High deposit", "Pressure tactics", "Multiple exclamation marks"],
    greenFlags: []
  },
  {
    id: 5,
    title: "Cozy Apartment",
    location: "Magdeburg Center",
    price: "€380/month",
    deposit: "€760",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500",
    description: "Well-maintained, landlord speaks English.",
    isScam: false,
    redFlags: [],
    greenFlags: ["Fair pricing", "Good communication", "Central location"]
  }
];

const AccommodationSwipeGame = ({ onComplete }) => {
  const [cards, setCards] = useState(ACCOMMODATION_LISTINGS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [acceptedListings, setAcceptedListings] = useState([]);
  const [rejectedListings, setRejectedListings] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [showingResults, setShowingResults] = useState(false);

  // Check if game is completed
  useEffect(() => {
    if (currentIndex >= cards.length) {
      setGameCompleted(true);
      setShowingResults(true);
      
      // Calculate final score
      const correctChoices = acceptedListings.filter(listing => !listing.isScam).length +
                           rejectedListings.filter(listing => listing.isScam).length;
      
      const finalScore = Math.round((correctChoices / cards.length) * 100);
      setScore(finalScore);
      
      setTimeout(() => {
        onComplete?.(finalScore >= 60, finalScore); // Pass if 60% or higher
      }, 3000);
    }
  }, [currentIndex, cards.length, acceptedListings, rejectedListings, onComplete]);

  const handleSwipe = (direction, cardData) => {
    if (direction === 'left') {
      // Rejected
      setRejectedListings([...rejectedListings, cardData]);
      if (cardData.isScam) {
        setFeedback("✅ Good choice! This was a scam.");
      } else {
        setFeedback("❌ Oops! This was actually legitimate.");
      }
    } else if (direction === 'right') {
      // Accepted
      setAcceptedListings([...acceptedListings, cardData]);
      if (!cardData.isScam) {
        setFeedback("✅ Great choice! This looks legitimate.");
      } else {
        setFeedback("❌ Watch out! This was a scam.");
      }
    }

    setTimeout(() => setFeedback(''), 2000);
    setCurrentIndex(currentIndex + 1);
  };

  const restartGame = () => {
    setCards(ACCOMMODATION_LISTINGS);
    setCurrentIndex(0);
    setScore(0);
    setGameCompleted(false);
    setAcceptedListings([]);
    setRejectedListings([]);
    setFeedback('');
    setShowingResults(false);
  };

  if (gameCompleted && showingResults) {
    return (
      <GameResultsScreen
        score={score}
        acceptedListings={acceptedListings}
        rejectedListings={rejectedListings}
        onRestart={restartGame}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            🏠 Find Alex's Accommodation
          </h1>
          <p className="text-gray-600">
            Swipe ➡️ to accept, ⬅️ to reject
          </p>
          <div className="mt-4 bg-white rounded-lg p-3 shadow">
            <div className="text-sm text-gray-600">
              Card {currentIndex + 1} of {cards.length}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white p-3 rounded-lg shadow-lg border-l-4 border-blue-500">
            {feedback}
          </div>
        )}

        {/* Cards Stack */}
        <div className="relative h-96 mb-6">
          {cards.slice(currentIndex, currentIndex + 3).map((card, index) => (
            <SwipeableCard
              key={card.id}
              card={card}
              index={index}
              onSwipe={handleSwipe}
              isActive={index === 0}
            />
          ))}
          
          {currentIndex >= cards.length && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">All Done!</h2>
                <p className="text-gray-600">Calculating your score...</p>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="font-bold text-gray-800 mb-2">🚨 Watch out for scams:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Prices too good to be true</li>
            <li>• Urgent payment demands</li>
            <li>• No viewing allowed</li>
            <li>• Poor grammar/spelling</li>
            <li>• Requests for money transfers</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Swipeable Card Component
const SwipeableCard = ({ card, index, onSwipe, isActive }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 0.5, 1, 0.5, 0]);
  const controls = useAnimation();

  const handleDragEnd = (event, info) => {
    const threshold = 100;
    
    if (Math.abs(info.offset.x) > threshold) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      
      // Animate card off screen
      controls.start({
        x: info.offset.x > 0 ? 300 : -300,
        opacity: 0,
        transition: { duration: 0.3 }
      }).then(() => {
        onSwipe(direction, card);
      });
    } else {
      // Snap back to center
      controls.start({ x: 0, y: 0 });
    }
  };

  return (
    <motion.div
      className={`absolute inset-0 cursor-grab ${!isActive ? 'pointer-events-none' : ''}`}
      style={{
        x,
        y,
        rotate,
        opacity,
        zIndex: 10 - index,
        scale: 1 - index * 0.05,
      }}
      animate={controls}
      drag={isActive}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-full border-2 border-gray-100">
        {/* Image */}
        <div className="h-48 bg-cover bg-center relative" style={{ backgroundImage: `url(${card.image})` }}>
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute top-4 right-4">
            <span className="bg-white px-2 py-1 rounded-full text-sm font-bold text-green-600">
              {card.price}
            </span>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <h3 className="text-xl font-bold text-gray-800 mb-1">{card.title}</h3>
          <p className="text-gray-600 text-sm mb-2">📍 {card.location}</p>
          <p className="text-gray-700 text-sm mb-3">{card.description}</p>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-semibold">Deposit:</span> {card.deposit}
            </div>
          </div>
          
          {/* Red flags indicator (subtle) */}
          {card.redFlags.length > 0 && (
            <div className="mt-2 text-xs text-red-500">
              ⚠️ {card.redFlags.length} warning signs
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Results Screen Component
const GameResultsScreen = ({ score, acceptedListings, rejectedListings, onRestart }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2">
            {score >= 60 ? '🎉 Well Done!' : '📚 Keep Learning!'}
          </h2>
          <div className="text-4xl font-bold text-blue-600 mb-2">{score}%</div>
          <p className="text-gray-600">
            {score >= 60 
              ? "Alex found safe accommodation thanks to you!"
              : "Alex needs more help avoiding scams. Try again!"
            }
          </p>
        </div>

        {/* Summary */}
        <div className="space-y-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-bold text-green-800 mb-2">✅ Accepted ({acceptedListings.length})</h3>
            {acceptedListings.map(listing => (
              <div key={listing.id} className="text-sm">
                <span className={listing.isScam ? 'text-red-600' : 'text-green-600'}>
                  {listing.isScam ? '❌' : '✅'} {listing.title}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-bold text-red-800 mb-2">❌ Rejected ({rejectedListings.length})</h3>
            {rejectedListings.map(listing => (
              <div key={listing.id} className="text-sm">
                <span className={listing.isScam ? 'text-green-600' : 'text-red-600'}>
                  {listing.isScam ? '✅' : '❌'} {listing.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default AccommodationSwipeGame;
