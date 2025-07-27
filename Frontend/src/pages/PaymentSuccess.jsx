import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        let transactionUuid, refId, paymentData;

        // Check if we have base64 encoded data from eSewa
        const esewaData = searchParams.get('data');
        if (esewaData) {
          try {
            // Decode base64 data from eSewa
            const decodedData = atob(esewaData);
            paymentData = JSON.parse(decodedData);
            
            transactionUuid = paymentData.transaction_uuid;
            refId = paymentData.transaction_code; // eSewa uses transaction_code as ref_id
          } catch (decodeError) {
            console.error('Failed to decode eSewa data:', decodeError);
            setVerificationStatus('error');
            setIsVerifying(false);
            return;
          }
        } else {
          // Fallback to direct URL parameters
          transactionUuid = searchParams.get('transaction_uuid');
          refId = searchParams.get('ref_id');
        }

        if (!transactionUuid) {
          console.error('No transaction_uuid found');
          setVerificationStatus('error');
          setIsVerifying(false);
          return;
        }

        // Call backend to verify payment
        const token = localStorage.getItem('token');
        console.log('Calling verify-esewa with:', { transactionUuid, refId });
        
        const response = await fetch('https://roomsewa-project-production.up.railway.app/api/bookings/verify-esewa', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            transaction_uuid: transactionUuid,
            ref_id: refId,
            esewa_data: paymentData // Send the full eSewa data for verification
          })
        });

        console.log('Verify response status:', response.status);
        const responseData = await response.text();
        console.log('Verify response data:', responseData);

        if (response.ok) {
          setVerificationStatus('success');
        } else {
          console.error('Verification failed:', responseData);
          setVerificationStatus('error');
        }
      } catch (error) {
        console.error('Payment verification failed:', error);
        setVerificationStatus('error');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="text-4xl text-cyan-600 animate-spin mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment...</h1>
          <p className="text-gray-600">Please wait while we confirm your payment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {verificationStatus === 'success' ? (
          <>
            <FontAwesomeIcon icon={faCheckCircle} className="text-6xl text-green-500 mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              Your booking has been confirmed. You'll receive a confirmation email shortly.
            </p>
            <button
              onClick={() => navigate('/search')}
              className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 text-white py-3 rounded-xl hover:from-cyan-700 hover:to-cyan-800 transition-all duration-300"
            >
              Continue Browsing
            </button>
          </>
        ) : (
          <>
            <div className="text-6xl text-red-500 mb-6">❌</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Verification Failed</h1>
            <p className="text-gray-600 mb-6">
              We couldn't verify your payment. Please contact support if you were charged.
            </p>
            <button
              onClick={() => navigate('/search')}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
            >
              Back to Search
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;