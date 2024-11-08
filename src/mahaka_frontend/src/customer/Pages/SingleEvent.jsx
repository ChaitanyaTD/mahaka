import Frame13 from "../../assets/images/Frame13.png";
import Frame15 from "../../assets/images/Frame15.png";
import fram2 from "../../assets/images/fram2.png";
import Ticket from "../../customer/Components/Ticket";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Swiper, SwiperSlide } from "swiper/react";
import { getVenue } from "../../redux/reducers/apiReducers/venueApiReducer";
import { getAllEventsByVenue } from "../../redux/reducers/apiReducers/eventApiReducer";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

// import required modules
import { Autoplay, Pagination } from "swiper/modules";
import { GoArrowUpRight } from "react-icons/go";
import MoreEventCard from "../Components/MoreEventCard";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ModalPopup from "../../common/ModalPopup";
import DatePicker from "../../common/DatePicker";
import VisitorPicker from "../Components/single-event/VisitorPicker";

const ticketData = [
  {
    type: "PREMIUM",
    gradientClass: "bg-gradient-to-r from-orange-200 to-orange-300",
    name: "Ticket Name",
    description:
      "Lorem ipsum dolor sit amet consectetur. Bibendum est vitae urna pharetra",
    price: "Rp. 1,500",
    availability: "AVAILABLE",
    highlightClass: "bg-orange-500",
  },
  {
    type: "VVIP",
    gradientClass: "bg-gradient-to-r from-cyan-200 to-cyan-300",
    name: "Ticket Name",
    description:
      "Lorem ipsum dolor sit amet consectetur. Bibendum est vitae urna pharetra",
    price: "Rp. 1,500",
    availability: "SOLD OUT",
    highlightClass: "bg-cyan-500",
  },
  {
    type: "GROUP",
    gradientClass: "bg-gradient-to-r from-blue-200 to-blue-300",
    name: "Ticket Name",
    description:
      "Lorem ipsum dolor sit amet consectetur. Bibendum est vitae urna pharetra",
    price: "Rp. 1,500",
    availability: "3 TICKETS LEFT",
    highlightClass: "bg-blue-500",
  },
  {
    type: "REGULAR",
    gradientClass: "bg-gradient-to-r from-gray-200 to-gray-300",
    name: "John Doe",
    description:
      "Lorem ipsum dolor sit amet consectetur. Bibendum est vitae urna pharetra",
    price: "Rp. 1,500",
    availability: "AVAILABLE",
    highlightClass: "bg-gray-500",
  },
];
const calculateDuration = (StartDate, EndDate) => {
  const start = new Date(StartDate);
  const end = new Date(EndDate);
  const durationMs = end - start;
  const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));

  if (days === 0) return "1 day";
  if (days === 1) return "2 days";
  return `${days + 1} days`;
};

export default function SingleEvent() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { ModalOne } = ModalPopup();

  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
  const { id } = useParams();
  const venueId = `${decodeURIComponent(id)}${window.location.hash}`;
  console.log(venueId);

  const dispatch = useDispatch();
  const {
    currentVenue,
    loading: venueLoading,
    error,
  } = useSelector((state) => state.venues);
  console.log(currentVenue);
  const {
    events,

    eventsLoading: eventLoading,
    error: eventError,
  } = useSelector((state) => state.events);
  const { backend } = useSelector((state) => state.authentication);
  const [localError, setLocalError] = useState(null);
  const venue =
    currentVenue && Array.isArray(currentVenue) ? currentVenue[1] : null;

  useEffect(() => {
    if (!venueId) {
      setLocalError("Venue ID is missing from the URL");
      return;
    }

    if (!backend) {
      setLocalError("Backend is not initialized");
      return;
    }

    dispatch(getVenue({ backend, venueId }))
      .unwrap()
      .catch((err) => {
        setLocalError(err.message || "Failed to fetch venue details");
      });

    dispatch(
      getAllEventsByVenue({ backend, chunkSize: 100, pageNo: 0, venueId })
    )
      .unwrap()
      .catch((err) => {
        setLocalError(err.message || "Failed to fetch events for the venue");
      });
  }, [dispatch, venueId, backend]);

  console.log(eventLoading, "eventLoading");
  console.log(venueLoading, "venueLoading");

  // Assuming the first event is the main event for this venue
  const event = events && Array.isArray(events) ? events : null;

  const duration =
    venue?.Details.StartDate && venue?.Details.EndDate
      ? calculateDuration(venue.Details.StartDate, venue.Details.EndDate)
      : "";

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    const time = parseInt(timeString, 10);
    const hours = Math.floor(time / 100);
    const minutes = time % 100;
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  return (
    <>
      <div className="z-999">
        <ModalOne open={isModalOpen} setOpen={setIsModalOpen}>
          <div className="w-full flex flex-col h-full">
            <h1 className="text-2xl font-medium flex w-full items-center justify-center uppercase py-4">
              Main Gate Pass
            </h1>
            <div className="flex w-full bg-white rounded-b-3xl">
              <div className="py-4 space-y-12 w-full h-full lg:mx-80">
                <DatePicker />
                <VisitorPicker />
              </div>
            </div>
            <Link
              to="/payment"
              className="flex w-full items-center justify-center mt-auto mb-12"
            >
              <span className="font-medium px-12 py-2 rounded-md bg-secondary text-white text-lg">
                Proceed to checkout
              </span>
            </Link>
          </div>
        </ModalOne>
      </div>
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {venueLoading ? (
            <h1 className=" animate-pulse bg-gray-300 rounded-2xl w-32 h-12 font-black mb-10"></h1>
          ) : (
            <h1 className="text-4xl font-black pb-10">{venue?.Title || ""}</h1>
          )}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* left side section  */}
            <div className="lg:w-2/3 ">
              <div className="w-full rounded-2xl relative">
                {venueLoading ? (
                  <div className="flex items-center justify-center h-full w-full">
                    <div className="animate-pulse bg-gray-300 rounded-2xl h-90 w-full"></div>
                  </div>
                ) : (
                  <img
                    src={venue?.banner?.data || Frame13}
                    alt={venue?.title || "Event"}
                    className={`h-90 w-full rounded-2xl ${
                      venueLoading ? "hidden" : "block"
                    }`}
                    onLoad={() => setIsLoading(false)}
                  />
                )}
              </div>
              <>
                {/* tabs navlink */}
                <div className="mb-4 mt-8">
                  <ul
                    className="flex   justify-around items-center flex-wrap -mb-px text-sm font-medium text-center"
                    role="tablist"
                  >
                    <li className="me-2" role="presentation">
                      <button
                        className={`inline-block text-2xl font-black p-4 border-b-2 rounded-t-lg ${
                          activeTab === "profile"
                            ? "border-blue-500"
                            : "border-transparent"
                        }`}
                        onClick={() => handleTabClick("profile")}
                        type="button"
                        role="tab"
                        aria-controls="profile"
                        aria-selected={activeTab === "profile"}
                      >
                        Tickets
                      </button>
                    </li>
                    <li className="me-2" role="presentation">
                      <button
                        className={`inline-block text-2xl font-normal p-4 border-b-2 rounded-t-lg ${
                          activeTab === "dashboard"
                            ? "border-blue-500"
                            : "border-transparent"
                        } `}
                        onClick={() => handleTabClick("dashboard")}
                        type="button"
                        role="tab"
                        aria-controls="dashboard"
                        aria-selected={activeTab === "dashboard"}
                      >
                        Description
                      </button>
                    </li>
                  </ul>
                </div>

                {/* tabs  */}
                <div id="default-tab-content">
                  {activeTab === "profile" && (
                    <motion.div
                      initial={{ x: 500 }}
                      animate={{ x: 0 }}
                      transition={{ stiffness: 300 }}
                      className="p-4 "
                      id="profile"
                      role="tabpanel"
                      aria-labelledby="profile-tab"
                    >
                      <p className="text-lg font-normal">
                        Lorem ipsum dolor sit amet consectetur. Nisl sapien id
                        erat senectus ornare egestas diam vitae tincidunt.
                        Curabitur commodo purus sed accumsan tristique velit
                        volutpat amet.
                      </p>
                      <div>
                        {ticketData.map((ticket, index) => (
                          <div
                            key={index}
                            className="cursor-pointer"
                            onClick={handleModalOpen}
                          >
                            <Ticket
                              key={index}
                              type={ticket.type}
                              gradientClass={ticket.gradientClass}
                              name={ticket.name}
                              description={ticket.description}
                              price={ticket.price}
                              availability={ticket.availability}
                              highlightClass={ticket.highlightClass}
                            />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  {activeTab === "dashboard" && (
                    <motion.div
                      initial={{ x: 500 }}
                      animate={{ x: 0 }}
                      transition={{ stiffness: 300 }}
                      className="p-4 "
                      id="dashboard"
                      role="tabpanel"
                      aria-labelledby="dashboard-tab"
                    >
                      <div className="p-6 font-sans">
                        <ul className="list-disc list-inside mb-4">
                          <li>
                            <strong>Duration:</strong>
                            {duration || "1 Day"} (approx.)
                          </li>
                          <li>
                            <strong>Location:</strong>{" "}
                            {venue?.Details.Location || "Indonesia"}
                          </li>
                          <li>
                            <strong>Last Entry:</strong>{" "}
                            {(venue?.Details.EndTime &&
                              venue.Details.EndTime) ||
                              "4:00 PM"}
                          </li>
                        </ul>
                        <p className="mb-4">
                          This data is taken from the existing zoo website.
                        </p>
                        <div className="space-y-4">
                          <div>
                            <p>
                              Come and visit New Zealand's first zoo to get up
                              close and personal to native treasures and
                              endangered animals from around the world.
                            </p>
                            <p>
                              Child entry applies for 3-14 year olds, and under
                              3s are free. All children under the age of 14 must
                              be accompanied by an adult when visiting the Zoo.
                            </p>
                            <p>
                              Zoo Entry Tickets purchased online are valid for
                              12 months from purchase date. Tickets can also be
                              bought in person at our front entrance.
                            </p>
                            <p>
                              If you are looking for tickets to a special event
                              or current discounted offer, these cannot be
                              booked here. Please visit the relevant event or
                              offer webpage for more information.
                            </p>
                          </div>
                          <div>
                            <p>
                              Come and visit New Zealand's first zoo to get up
                              close and personal to native treasures and
                              endangered animals from around the world.
                            </p>
                            <p>
                              Child entry applies for 3-14 year olds, and under
                              3s are free. All children under the age of 14 must
                              be accompanied by an adult when visiting the Zoo.
                            </p>
                            <p>
                              Zoo Entry Tickets purchased online are valid for
                              12 months from purchase date. Tickets can also be
                              bought in person at our front entrance.
                            </p>
                            <p>
                              If you are looking for tickets to a special event
                              or current discounted offer, these cannot be
                              booked here. Please visit the relevant event or
                              offer webpage for more information.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </>
            </div>
            {/* right side section  */}
            {venueLoading ? (
              <div className="lg:w-1/3 h-[340px] w-full shadow-lg rounded-lg sticky top-0">
                <div className="p-8 animate-pulse">
                  <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>{" "}
                  {/* Title skeleton */}
                  <div className="h-6 bg-gray-300 rounded w-1/2 mb-2"></div>{" "}
                  {/* Date skeleton */}
                  <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>{" "}
                  {/* Time skeleton */}
                  <div className="h-6 bg-gray-300 rounded w-full mb-4"></div>{" "}
                  {/* Location skeleton */}
                </div>
                <div className="pl-8">
                  <div className="h-6 bg-gray-300 rounded w-1/2 mb-2"></div>{" "}
                  {/* Event end date skeleton */}
                </div>
              </div>
            ) : (
              <div className="lg:w-1/3 h-[340px] w-full shadow-lg rounded-lg sticky top-0">
                <div className="p-8">
                  <h1 className="text-2xl font-black">Venue Details</h1>
                  <h3 className="text-lg font-normal">
                    {" "}
                    {venue?.Details.StartDate &&
                      formatDate(venue.Details.StartDate)}{" "}
                    -
                    {(venue?.Details.EndDate &&
                      formatDate(venue.Details.EndDate)) ||
                      "13 Jul- 17 Jul 2024"}
                  </h3>
                  <h3 className="text-lg font-normal">
                    {venue?.Details.StartTime && venue.Details.StartTime} -
                    {(venue?.Details.EndTime && venue.Details.EndTime) ||
                      "12:00AM - 3:00PM"}
                  </h3>
                  <h3 className="text-lg font-normal">
                    Location of the Venue - {venue?.Details.Location}
                  </h3>
                </div>
                <h2 className="text-2xl font-normal pl-8">
                  Venue ends on :{" "}
                  <span className="text-red-600">
                    {(venue?.Details.EndDate &&
                      formatDate(venue.Details.EndDate)) ||
                      "17 July, 2024"}
                  </span>
                </h2>
              </div>
            )}
          </div>
        </div>

        {/* bottom crousel section  */}
        <div className="py-12 mx-auto px-4 sm:px-6 lg:px-8">
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
            <h1 className="text-4xl font-black">Check Events</h1>
          </section>

          <div className="max-w-7xl mx-auto">
            {eventLoading ? (
              <div className="flex my-18 space-x-4 px-4 sm:px-6 lg:px-8 mx-auto">
                {/* Skeleton Loader for each card */}
                {[...Array(2)].map((_, index) => (
                  <div
                    key={index}
                    className="w-full lg:w-1/2 h-64 bg-gray-200 animate-pulse rounded-lg"
                  ></div>
                ))}
              </div>
            ) : (
              <Swiper
                spaceBetween={40}
                slidesPerView={1}
                breakpoints={{
                  640: {
                    slidesPerView: 1,
                  },
                  768: {
                    slidesPerView: 1,
                  },
                  1024: {
                    slidesPerView: 2,
                  },
                }}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                pagination={{
                  clickable: true,
                }}
                modules={[Autoplay, Pagination]}
                className="mySwiper px-4 sm:px-6 lg:px-8 mx-auto"
              >
                {event?.map((event, index) => (
                  <SwiperSlide key={index}>
                    <MoreEventCard
                      event={event}
                      index={index}
                      image={event?.banner?.data}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
