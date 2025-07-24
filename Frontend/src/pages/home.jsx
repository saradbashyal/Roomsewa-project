import React from 'react';
import Navbar from '../shared/navbar';
import Hero from '../components/hero';
import Search from '../components/search';
import WhySection from '../components/WhySection';
import Services from '../components/Services';
import RecommendationsSection from '../components/RecommendationsSection';
import Footer from '../shared/footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Home() {
  return (
    <section className="bg-cyan-50">
      <Navbar />
      <Hero />
      <Search />
      <RecommendationsSection />
      <WhySection />
      <Services />
      <Footer />
      
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </section>
  );
}

export default Home;