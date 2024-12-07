import React from "react";
import "../style/index.css";
import { Link } from "react-router-dom";

export default function HeroCard({ bannerData, bannerLoading }) {
  console.log(bannerData);
  console.log("banner loading in home.jsx",bannerLoading);

  // Extract the image URL from bannerData
  const backgroundImage = bannerData?.image || ""; // Replace `imageUrl` with the correct key from your bannerData


 
  return (
    <div className="max-w-7xl w-full m-auto my-18 px-4 lg:px-1">
   
   
      <div
        className="max-w-7xl m-auto text-white rounded-2xl  "
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-screen-sm rounded-2xl md:py-10 md:px-4 sm:px-6 lg:px-8 inside-crousel">
          <div className="max-w-lg pl-11">
            <h2 className="lg:text-4xl font-[950] text-white text-3xl">
              {bannerData?.title}
            </h2>
            <p className="mt-4 lg:text-7xl text-4xl font-[950] leading-6 text-[#C9D7FF]">
              Join Now
            </p>
            <p className="mt-2 max-w-2xl font-normal text-lg text-white">
              {bannerData?.description}
            </p>
            <div className="my-6">
              <a
                href={
                  bannerData?.redirectUrl?.startsWith("http")
                    ? bannerData.redirectUrl
                    : `https://${bannerData?.redirectUrl}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-14 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#F08E1E] hover:bg-orange-600"
              >
                join now
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
              
  );
}
