import React from "react";
import Navbar from "../shared/navbar";
import Footer from "../shared/footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faUsers, faBolt, faHandHoldingHeart } from "@fortawesome/free-solid-svg-icons";

const About = () => {
  return (
    <section className="flex flex-col min-h-screen bg-cyan-50">
      <Navbar />

      <main className="flex-grow pt-[100px] px-4 lg:px-8">
    
        <div className="max-w-6xl mx-auto py-12">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-800 mb-6">
              About Room Sewa
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Room Sewa is a student-built platform that helps connect
                landlords with tenants, making room rentals simpler, faster, and
                more accessible.
              </p>
            </p>
          </div>

         
          <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  Our Mission
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Our mission is to bridge the gap between landlords and tenants
                  by offering a reliable platform tailored for students and
                  young renters. We aim to simplify the room rental experience
                  through smart features and intuitive design.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed">
                  By focusing on accessibility, transparency, and ease of use,
                  Room Sewa helps users find suitable housing quickly and
                  confidently — all in one place.
                </p>
              </div>
              <div className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl p-8 text-center">
                <div className="text-6xl mb-4">🛋️</div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  Comfort Meets Convenience
                </h3>
                <p className="text-gray-600">
                  Room Sewa is built to make finding and renting rooms as simple
                  and stress-free as relaxing in your own space.
                </p>
              </div>
            </div>
          </div>

    
          <div className="mb-12">
            <h2 className=" text-3xl font-bold text-gray-800 text-center mb-12">
              Meet Our Team
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            
              <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="w-24 h-24 bg-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">SB</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Sarad Bashyal
                </h3>
                <p className="text-cyan-600 font-medium mb-3">Lead Developer</p>
                <p className="text-gray-600 text-sm">
                  Built the frontend and backend, contributed to UI/UX design,
                  and led core feature research.
                </p>
              </div>

            
              <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="w-24 h-24 bg-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">SA</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Sudip Aryal
                </h3>
                <p className="text-cyan-600 font-medium mb-3">
                  Backend Developer
                </p>
                <p className="text-gray-600 text-sm">
                  Worked on building and managing the backend, focusing on
                  server-side logic, database integration, and API development.
                </p>
              </div>
            </div>
          </div>

        
          <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 mb-12">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
              Project Goals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="flex items-start space-x-4">
    <div className="p-2 rounded-full bg-emerald-100 text-emerald-600">
      <FontAwesomeIcon icon={faCircleCheck} className="w-6" />
    </div>
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Smart Search</h3>
      <p className="text-gray-600">
        Help users find the right room quickly with location, price, and filter options that actually work.
      </p>
    </div>
  </div>

              <div className="flex items-start space-x-4">
    <div className="p-2 rounded-full bg-blue-100 text-blue-600">
      <FontAwesomeIcon icon={faUsers} className="w-6" />
    </div>
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Accessibility</h3>
      <p className="text-gray-600">
        Make the platform usable for everyone — including those on mobile, slow networks, or with limited tech skills.
      </p>
    </div>
  </div>

              <div className="flex items-start space-x-4">
    <div className="bg-yellow-100 rounded-full p-2 text-yellow-600">
      <FontAwesomeIcon icon={faBolt} className="w-6"/>
    </div>
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Speed & Performance</h3>
      <p className="text-gray-600">
        Ensure the app loads fast, responds quickly, and scales efficiently for growing users.
      </p>
    </div>
  </div>

              <div className="flex items-start space-x-4">
    <div className="bg-purple-100 rounded-full p-2 text-purple-600">
      <FontAwesomeIcon icon={faHandHoldingHeart} className="w-6"/>
    </div>
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">User-Friendly Design</h3>
      <p className="text-gray-600">
        Keep the experience clean, simple, and easy to use — from browsing rooms to contacting landlords.
      </p>
    </div>
  </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </section>
  );
};

export default About;
