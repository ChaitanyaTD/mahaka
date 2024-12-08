import React from "react";
import MahakaLogo from "../../assets/images/mahakalogo.svg";
import { HiMiniMapPin, HiMiniPhone, HiMiniPrinter } from "react-icons/hi2";
import {
  FaFacebookSquare,
  FaGooglePlusG,
  FaInstagram,
  FaLinkedinIn,
  FaPinterest,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import { MdMailOutline } from "react-icons/md";
import { Link } from "react-router-dom";

export default function Footer() {
 
  const currentYear = new Date().getFullYear();
  const address = "345 Faulconer Drive, Suite 4 • Charlottesville, CA, 12345";
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;
  return (
    <footer className="bg-[#124076] px-6 md:px-8 pt-12 text-neutral-100 md:flex-row tracking-wider">
      <div className="mx-auto grid w-full  grid-cols-2 gap-12 md:grid-cols-[1fr,_175px,_175px,_175px]">
        <div className="flex flex-col items-start gap-4">
          <span className="font-black italic text-4xl ml-10">MAHAKA</span>
        </div>
        <div className="space-y-4">
          <span className="  font-bold">Socials</span>
          <div className="flex items-center gap-2 text-sm text-neutral-300 transition-colors hover:text-indigo-300 cursor-pointer font-medium">
            <FaFacebookSquare size={16} />
            <span>Facebook</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-300 transition-colors hover:text-indigo-300 cursor-pointer font-medium">
            <FaInstagram size={16} />
            <span>Instagram</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-300 transition-colors hover:text-indigo-300 cursor-pointer font-medium">
            <FaLinkedinIn size={16} />
            <span>Linkedin</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-300 transition-colors hover:text-indigo-300 cursor-pointer font-medium">
            <FaTwitter size={16} />
            <span>Twitter</span>
          </div>
        </div>
        <div className="space-y-4">
          <span className="  font-bold">Site</span>
          <Link
            className="flex items-center gap-2 text-sm text-neutral-300 transition-colors hover:text-indigo-300 font-medium cursor-pointer"
            to="/"
          >
            Home
          </Link>
          <Link
            className="flex items-center gap-2 text-sm text-neutral-300 transition-colors hover:text-indigo-300 font-medium cursor-pointer"
            to="/about-us"
          >
            About Mahaka
          </Link>
        </div>
        <div className="space-y-4">
          <span className=" font-bold">Legal</span>
          <div className="flex items-center gap-2 text-sm text-neutral-300 transition-colors hover:text-indigo-300 font-medium cursor-pointer">
            License
          </div>
          <Link
            className="flex items-center gap-2 text-sm text-neutral-300 transition-colors hover:text-indigo-300 font-medium cursor-pointer"
            to="/privacy-policy"
          >
            Privacy Policy
          </Link>
          <Link className="flex items-center gap-2 text-sm text-neutral-300 transition-colors hover:text-indigo-300 font-medium cursor-pointer"
           to ="/terms-conditions"
           >
            Terms
          </Link>
        </div>
        <div className="mx-auto flex ml-6  text-md     flex-col-reverse items-center justify-between gap-4  sm:flex-row">
          <span>© 2024 MAHAKA, LLC. All rights reserved.</span>
        </div>
      </div>
      <div className="-mx-4 mt-12 border-t-[1px] border-border p-4">
        <div className=" ">
          <span>© 2024 MAHAKA, LLC. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
