import React, { useState } from "react";
import Navbar from "../shared/navbar";
import Footer from "../shared/footer";

const FAQs = () => {
  const faqs = [
    {
      question: `How can I rent a room through this website?`,
      answer: `To rent a room, simply sign in or create an account, browse available listings, and click "Book Now" to complete your reservation.`,
      // icon: faHome
    },
    {
      question: `Do I need to pay to use the platform?`,
      answer: `No, browsing and searching for rooms is completely free. Posting rooms may be free or require a small fee based on future features.`,
      // icon: faCreditCard
    },
    {
      question: ` Am I allowed to talk to the room owner directly?`,
      answer: ` Yes, once you're logged in, you can easily message the owner through the built-in chat or contact option provided on their listing.`,
      // icon: faComments,
    },
    {
      question: `What types of accommodations are available?`,
      answer: `We offer various room options including single private rooms, and apartments.`,
      // icon: faBuilding,
    },
    {
      question: `How do I post a room I want to rent out?`,
      answer: `Register as a room provider, then access your dashboard to fill out the room listing form with details and images.`,
      // icon: faPlus,
    },
    {
      question: `Is online payment supported and secure?`,
      answer: `Yes, our platform allows secure online payments using encrypted methods to keep your transactions safe.`,
      // icon: faShield,
    },
    {
      question: `Can I cancel a booking if needed?`,
      answer: `Absolutely. You can cancel your booking through your profile, and refunds will follow the terms of our cancellation policy.`,
      // icon: faCalendarXmark,
    },
    {
      question: `What should I do if I face any issues?`,
      answer: `If you encounter any problems, feel free to contact our support team through email or the help section. We're available to assist you anytime.`,
      // icon: faLifeRing,
    },
    {
      question: `Is this site compatible with mobile devices?`,
      answer: `Yes, the platform is fully optimized to work smoothly on all devices, including smartphones, tablets, and desktops.`,
      // icon: faMobile,
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  function toggle(index) {
    if (openIndex === index) {
      return setOpenIndex(null);
    } else {
      return setOpenIndex(index);
    }
  }

  return (
    <section className="bg-cyan-50 min-h-screen">
      <Navbar />
      <div className="pt-[150px] px-6 md:px-12 lg:px-24 max-w-4xl mx-auto pb-[100px]">
        <h2 className="text-3xl lg:text-5xl font-bold text-center text-black mb-10">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4 ">
          {faqs.map((value, index) => (
            <div
              key={index}
              className=" border border-cyan-200 rounded-lg bg-white shadow-md overflow-hidden ${openindex === index ? ''} "
            >
              <button
                onClick={() => toggle(index)}
                className=" w-full flex justify-between items-center px-5 py-4 text-left text-lg font-medium text-black "
              >
                {/* <div className="">
                  <FontAwesomeIcon icon={value.icon} className="text-cyan-600 w-5 h-5 "/>
                </div> */}
                <h3 className="text-lg md:text-xl font-semibold">{value.question}</h3>
                <span className="text-2xl">{openIndex === index ? "−" : "+"}</span>
              </button>
              {openIndex === index && (
                <p className="px-6 pb-4 text-black ">{value.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </section>
  );
};

export default FAQs;
