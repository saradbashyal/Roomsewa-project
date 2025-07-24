import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faTableList,
  faHouseLock,
  faComments,
  faMapPin,
  faChartSimple,
} from "@fortawesome/free-solid-svg-icons";

const Services = () => {
  return (
    <section className="pt-[100px] lg:pt-[150px] pb-12 lg:pb-20 px-6 md:px-12 lg:px-24 flex flex-col items-center">
      <div className="bg-gray-50 w-full max-w-8xl rounded-xl py-12 px-4 sm:px-8 shadow-sm lg:pt-[50px] lg:pb-[80px]">
        <h2 className="mb-12 text-4xl text-center">Our Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          <div className="flex flex-col items-center text-center max-w-[280px] mx-auto px-4 py-6
">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-3xl" />
            <h3 className="text-lg font-semibold mt-2">Smart Search</h3>
            <p className="mt-1">
              Efficiently finds the rooms by location, price and type.
            </p>
          </div>
          <div className="flex flex-col items-center text-center max-w-[280px] mx-auto px-4 py-6
">
            <FontAwesomeIcon icon={faTableList} className="text-3xl" />
            <h3 className="text-lg font-semibold mt-2">Room Listings</h3>
            <p className="mt-1">Efficiently post and view available rooms.</p>
          </div>
          <div className="flex flex-col items-center text-center max-w-[280px] mx-auto px-4 py-6
">
            <FontAwesomeIcon icon={faHouseLock} className="text-3xl" />
            <h3 className="text-lg font-semibold mt-2">Online Booking</h3>
            <p className="mt-1">Efficiently book your desired room online.</p>
          </div>
          <div className="flex flex-col items-center text-center max-w-[280px] mx-auto px-4 py-6
">
            <FontAwesomeIcon icon={faComments} className="text-3xl" />
            <h3 className="text-lg font-semibold mt-2">Direct Chat</h3>
            <p className="mt-1">
              Efficiently communicate with landlords or tenants.
            </p>
          </div>
          <div className="flex flex-col items-center text-center max-w-[280px] mx-auto px-4 py-6
">
            <FontAwesomeIcon icon={faMapPin} className="text-3xl" />
            <h3 className="text-lg font-semibold mt-2">Nearby Rooms</h3>
            <p className="mt-1">
              Efficiently view room options near your location.
            </p>
          </div>
          <div className="flex flex-col items-center text-center max-w-[280px] mx-auto px-4 py-6
">
            <FontAwesomeIcon icon={faChartSimple} className="text-3xl" />
            <h3 className="text-lg font-semibold mt-2">Price Compare</h3>
            <p className="mt-1">
              Efficiently compare room prices across listings.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
