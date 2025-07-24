import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const PaymentFailure = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <FontAwesomeIcon icon={faTimesCircle} className="text-6xl text-red-500 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h1>
        <p className="text-gray-600 mb-6">
          Your payment could not be processed. No charges were made to your account.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 text-white py-3 rounded-xl hover:from-cyan-700 hover:to-cyan-800 transition-all duration-300 flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Try Again
          </button>
          
          <button
            onClick={() => navigate('/search')}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
          >
            Back to Search
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-red-50 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">Common Issues:</h3>
          <ul className="text-sm text-red-700 text-left space-y-1">
            <li>• Insufficient balance</li>
            <li>• Network connectivity issues</li>
            <li>• Incorrect payment details</li>
            <li>• Session timeout</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;