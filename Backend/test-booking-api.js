// Quick test script to debug the booking API
import fetch from 'node-fetch';

async function testBookingAPI() {
  try {
    console.log('Testing booking API endpoint...');
    
    // Test without authentication first
    const response = await fetch('http://localhost:3000/api/bookings/user/673d4cf8e5d67a74eba9e61e', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    } else {
      const data = await response.json();
      console.log('Success response:', data);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testBookingAPI();
