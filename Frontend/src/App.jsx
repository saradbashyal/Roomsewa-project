import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import About from './pages/about';
import FAQs from './pages/FAQs';
import Contact from './pages/Contact';
import Login from './auth/Login/Login';
import SignUp from './auth/Register/signUp';
import ForgotPassword from './auth/forgotPassword/forgotPassword';
import SearchPage from './pages/search';
import AddProperty from './pages/AddProperty';
import EditProperty from './pages/EditProperty';
import RoomDetails from './pages/RoomDetails';
import RecommendationsPage from './pages/RecommendationsPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import OTP from './auth/forgotPassword/otpConfirmationPage';
import MyListings from './pages/MyListings';
import MyBookings from './pages/MyBookings';
import ScrollToTop from './components/ScrollToTop';

import './app.css'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about-us" element={<About/>}/>
        <Route path="/FAQs" element={<FAQs/>}/>
        <Route path="/support" element={<Contact/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<SignUp/>}/>
        <Route path="/forgotpassword" element={<ForgotPassword/>}/>
        <Route path="/search" element={<SearchPage/>}/>
        <Route path="/add-property" element={<AddProperty/>}/>
        <Route path="/edit-property/:id" element={<EditProperty/>}/>
        <Route path="/room/:id" element={<RoomDetails/>}/>
        <Route path="/my-listings" element={<MyListings/>}/>
        <Route path="/my-bookings" element={<MyBookings/>}/>
        <Route path="/recommendations" element={<RecommendationsPage/>}/>
        <Route path="/payment/success" element={<PaymentSuccess/>}/>
        <Route path="/payment/failure" element={<PaymentFailure/>}/>
        <Route path="/otp" element={<OTP/>}/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
