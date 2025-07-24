import React, { useState } from "react";
import Navbar from "../shared/navbar";
import Footer from "../shared/footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faEnvelope,faPhone, faClock } from "@fortawesome/free-solid-svg-icons";
import { submitContactForm } from "../services/api";
import { toast } from 'react-toastify';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await submitContactForm(formData);
      toast.success(response.message || 'Your message has been sent successfully!');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast.error(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <section className="flex flex-col min-h-screen bg-cyan-50">
      <Navbar />
      <main className="flex-grow flex items-center justify-center pt-[80px] gap-20">
        
        <div className="w-[600px] m-10">
          <h2 className="text-3xl font-bold">Get in Touch</h2>
          <p className="mt-6">
           We'd love to hear from you! Whether you have a question about our services, need technical support, or want to explore partnership opportunities, our team is here to help.
          </p>
          

<section className="mt-6 space-y-4">
  <div className="flex items-center space-x-4">
    <div className="rounded-full p-3 bg-cyan-500">
      <FontAwesomeIcon icon={faEnvelope} className="w-6 text-xl text-white" />
    </div>
    <div>
      <p className=" font-medium text-gray-800">Email Us</p>
      <p className="text-sm text-gray-500">roomsewa@gmail.com</p>
    </div>
  </div>

  <div className="flex items-center space-x-4">
    <div className="rounded-full p-3 bg-cyan-500">
      <FontAwesomeIcon icon={faPhone} className="w-6 text-xl text-white" />
    </div>
    <div>
      <p className="font-medium text-gray-800">Call Us</p>
      <p className="text-sm text-gray-500">+977 984323339</p>
    </div>
  </div>

  <div className="flex items-center space-x-4">
    <div className="rounded-full p-3 bg-cyan-500">
      <FontAwesomeIcon icon={faClock} className="w-6 text-xl text-white" />
    </div>
    <div>
      <p className="font-medium text-gray-800">Response Time</p>
      <p className="text-sm text-gray-500">Within 24 hours</p>
    </div>
  </div>
</section>
        </div>
        <form className="bg-[#fefcfb] p-6 rounded-lg shadow-lg" onSubmit={handleSubmit}>
          <section className="flex gap-3 mb-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="firstName" className="font-medium">First name<span className="text-red-500">*</span></label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 p-2 bg-gray-100"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="lastName"  className="font-medium">Last name<span className="text-red-500">*</span></label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 p-2 bg-gray-100"
              />
            </div>
          </section>
          <div className="flex flex-col gap-2 mb-5">
            <label htmlFor="email"  className="font-medium">Email<span className="text-red-500">*</span></label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 p-2 bg-gray-100"
            />
          </div>
          <div className="flex flex-col gap-2 mb-5">
                <label htmlFor="subject" className="font-medium">
                  Subject<span className="text-red-500">*</span>
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent p-2 bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <option value="">Select a topic</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="billing">Billing Question</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>
          <div className="flex flex-col gap-1 mb-5">
            <label htmlFor="message"  className="font-medium">Message<span className="text-red-500">*</span></label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows="4"
              required
              className="w-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-gray-100 resize-none"
            ></textarea>
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`h-full px-5 py-2 rounded-lg text-white font-semibold transition-colors ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-cyan-500 hover:bg-cyan-600'
            }`}
          >
            {isSubmitting ? 'Sending...' : 'Submit'}
          </button>
        </form>
      
      </main>
      <Footer />
    </section>
  );
};

export default Contact;
