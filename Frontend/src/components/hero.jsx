import React from "react";
import { Link } from "react-router-dom";
import heroImage from "../assets/room.jpg";

function Hero() {
  return (
    <section className="pt-[100px] w-full py-12 lg:py-20 px-6 lg:pt-[150px] md:px-12 md:pt-[100px] lg:px-24 sm:pt-[100px] flex flex-col-reverse lg:flex-row items-center justify-between gap-10 ">
      <div className="text-center lg:text-left max-w-xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight mb-6">
          Find Your Perfect Room with{" "}
          <span className="text-cyan-600">RoomSewa</span>
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Discover the best rooms and flats available for rent with ease. Filter
          by location, price, and more!
        </p>
        <Link to="/search">
          <button className="bg-cyan-600 text-white font-semibold px-6 py-3 rounded hover:bg-cyan-700 transition-colors">
            Search Rooms
          </button>
        </Link>
      </div>

      <div className="w-full lg:w-1/2 ">
        <img
          src={heroImage}
          alt="People finding rooms"
          className="w-full max-h-[500px] object-cover rounded-md shadow-md"
        />
      </div>
    </section>
  );
}

export default Hero;
