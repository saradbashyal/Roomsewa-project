import React from 'react';
import image1 from "../assets/room1.jpg";
import image2 from "../assets/room2.jpg";

const WhySection = () => {
  return (
    <section className="px-6 md:px-12 lg:px-24 pt-[50px] sm:pt-[50px] md:pt-[50px] lg:pt-[50px]">
      <div className="why-Section mb-16 flex flex-col items-center">
        <h2 className="text-2xl sm:text-3xl font-bold">Why Room Sewa?</h2>
        <p className="mt-2 text-gray-600 text-xl font-medium text-center">
          Room Sewa helps you find the perfect room based on your preferences, easily and quickly.
        </p>
      </div>

      <div className=" flex flex-col lg:flex-row lg:items-center">
        <div className="flex-1">
          <h3 className="feature-head  text-3xl font-bold mb-4">Search rooms based on your preferences</h3>

          <article className="mb-4">
            <h4 className="text-2xl font-semibold">Location Filters:</h4>
            <p className='font-medium'>Find rooms by city, neighborhood or nearby landmarks for added convenience.</p>
          </article>

          <article className="mb-4">
            <h4 className="text-2xl font-semibold">Price Range:</h4>
            <p className='font-medium'>Set your preferred budget and explore rooms that align with your financial goals.</p>
          </article>

          <article>
            <h4 className="text-2xl font-semibold">Room Type:</h4>
            <p className='font-medium'>Select from shared spaces, private rooms or full apartments to match your comfort and lifestyle needs.</p>
          </article>
        </div>

        <div className="flex gap-8 items-start translate-y-[20px]">
          <img
            src={image1}
            className="w-[250px] h-[390px] object-cover rounded-[65px] shadow-2xl lg:translate-y-[-30px]"
            alt="image 1"
          />
          <img
            src={image2}
            className="w-[250px] h-[390px] object-cover rounded-[65px] shadow-2xl lg:translate-y-[30px]"
            alt="image 2"
          />
        </div>
      </div>
    </section>
  );
};

export default WhySection;
