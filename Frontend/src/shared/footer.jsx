import React from "react";
import { NavLink } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTwitter,
  faYoutube,
  faFacebookF,
} from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <section className="flex flex-col justify-center items-center lg:w-full h-[150px] bg-cyan-600 text-white">
      <ul className="flex gap-4 mb-3">
        <li>
          <NavLink
            to={"/about-us"}
            className="hover:text-cyan-200 hover:scale-105 transition-all duration-200"
          >
            About us
          </NavLink>
        </li>
        <li>
          <NavLink
            to={"/FAQs"}
            className="hover:text-cyan-200 hover:scale-105 transition-all duration-200"
          >
            FAQs
          </NavLink>
        </li>
        <li>
          <NavLink
            to={"/support"}
            className="hover:text-cyan-200 hover:scale-105 transition-all duration-200"
          >
            Contact us
          </NavLink>
        </li>
      </ul>
      <ul className="flex gap-4 mb-3 text-xl">
        <li>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform duration-300"
          >
            <FontAwesomeIcon icon={faTwitter} />
          </a>
        </li>
        <li>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform duration-300"
          >
            <FontAwesomeIcon icon={faYoutube} />
          </a>
        </li>
        <li>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform duration-300"
          >
            <FontAwesomeIcon icon={faFacebookF} />
          </a>
        </li>
      </ul>
      <p className="">
       Copyright &copy; {new Date().getFullYear()}- All rights reserved by Roomsewa.
      </p>
    </section>
  );
};

export default Footer;
