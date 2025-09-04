import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';

const AccommodationSwipeGame = ({ accommodationData, level, onComplete, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [acceptedListings, setAcceptedListings] = useState([]);
  const [rejectedListings, setRejectedListings] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [showingResults, setShowingResults] = useState(false);

  const currentCard = accommodationData[currentIndex];

  // Check if game is completed
  useEffect(() => {
    if (currentIndex >= accommodationData.length && !gameCompleted) {
      setGameCompleted(true);
      setShowingResults(true);
      
      // Calculate final score
      const correctChoices = acceptedListings.filter(listing => !listing.isScam).length +
                            rejectedListings.filter(listing => listing.isScam).length;
      const finalScore = Math.round((correctChoices / accommodationData.length) * 100);
      setScore(finalScore);
      
      setTimeout(() => {
        onComplete(finalScore >= 60, finalScore);
      }, 3000);
    }
  }, [currentIndex, accommodationData.length, acceptedListings, rejectedListings, gameCompleted, onComplete]);

  const handleSwipe = (direction, cardData) => {
    if (direction === 'left') {
      // Rejected
      setRejectedListings(prev => [...prev, cardData]);
      if (cardData.isScam) {
        setFeedback("✅ Good choice! This was a scam.");
      } else {
        setFeedback("❌ Oops! This was actually legitimate.");
      }
    } else if (direction === 'right') {
      // Accepted
      setAcceptedListings(prev => [...prev, cardData]);
      if (!cardData.isScam) {
        setFeedback("✅ Great choice! This looks legitimate.");
      } else {
        setFeedback("❌ Watch out! This was a scam.");
      }
    }
    
    setTimeout(() => setFeedback(''), 2000);
    setCurrentIndex(prev => prev + 1);
  };

  const SwipeCard = ({ card, onSwipe }) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-50, 50]);
    const opacity = useTransform(x, [-200, -50, 0, 50, 200], [0, 1, 1, 1, 0]);

    return (
      <motion.div
        className="absolute inset-0 w-full"
        style={{ x, rotate, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) => {
          if (Math.abs(info.offset.x) > 100) {
            onSwipe(info.offset.x > 0 ? 'right' : 'left', card);
          }
        }}
        whileDrag={{ scale: 1.05 }}
        initial={{ scale: 0, y: 100, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ 
          x: x.get() > 0 ? 1000 : -1000, 
          opacity: 0,
          transition: { duration: 0.3 }
        }}
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-full max-w-sm mx-auto">
          {/* Image */}
          <div className="h-48 bg-gray-200 overflow-hidden">
            <img
              src={card.image}
              alt={card.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500';
              }}
            />
          </div>
          
          {/* Content */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{card.title}</h3>
            <p className="text-gray-600 mb-2">📍 {card.location}</p>
            <div className="flex justify-between mb-3">
              <span className="text-lg font-semibold text-green-600">{card.price}</span>
              <span className="text-sm text-gray-500">Deposit: {card.deposit}</span>
            </div>
            <p className="text-gray-700 text-sm mb-4">{card.description}</p>
            
            {/* Red Flags */}
            {card.redFlags && card.redFlags.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-red-600 mb-1">⚠️ Red Flags:</h4>
                <ul className="text-xs text-red-500">
                  {card.redFlags.map((flag, index) => (
                    <li key={index}>• {flag}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Green Flags */}
            {card.greenFlags && card.greenFlags.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-green-600 mb-1">✅ Good Signs:</h4>
                <ul className="text-xs text-green-600">
                  {card.greenFlags.map((flag, index) => (
                    <li key={index}>• {flag}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (gameCompleted && showingResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="text-4xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Calculating your score...</h2>
          <div className="animate-pulse">
            <div className="h-2 bg-orange-200 rounded mb-4"></div>
            <div className="h-2 bg-orange-300 rounded mb-4"></div>
            <div className="h-2 bg-orange-400 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">🏠</div>
          <div className="text-xl font-semibold text-orange-800">Loading accommodation...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-red-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-xl font-bold text-gray-800">🏠 Accommodation Hunter</h1>
            <button
              onClick={onBack}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Back
            </button>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Card {currentIndex + 1} of {accommodationData.length}</span>
            <span>Help Alex find safe housing!</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4 text-center">
          <p className="text-gray-700 text-sm">
            Swipe ➡️ to <span className="text-green-600 font-semibold">accept</span>, 
            ⬅️ to <span className="text-red-600 font-semibold">reject</span>
          </p>
        </div>

        {/* Card Container */}
        <div className="relative h-96 mb-4">
          <SwipeCard
            key={currentCard.id}
            card={currentCard}
            onSwipe={handleSwipe}
          />
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <p className="text-lg font-semibold">{feedback}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 mt-6">
          <button
            onClick={() => handleSwipe('left', currentCard)}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            ❌ Reject
          </button>
          <button
            onClick={() => handleSwipe('right', currentCard)}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            ✅ Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccommodationSwipeGame;
