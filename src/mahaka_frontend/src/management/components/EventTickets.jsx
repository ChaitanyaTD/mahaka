import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Principal } from "@dfinity/principal";
import notificationManager from "../../common/utils/notificationManager";
import { FaPlus, FaMinus } from "react-icons/fa";

export default function EventTickets({
  type,
  gradientClass,
  name,
  description,
  price,
  availability,
  highlightClass,
  tickets,
  selectedVenue,
  id,
}) {
  const { backend, principal } = useSelector((state) => state.authentication);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  const convertDateToNanoseconds = (dateString) => {
    const date = new Date(dateString);
    return date.getTime() * 1_000_000; // Convert milliseconds to nanoseconds
  };

  const buyVenueTicketHandler = async () => {
    try {
      setLoading(true);
      const ticketTypeVariant = { ["SinglePass"]: null };
      const record = [
        {
          data: new Uint8Array([1, 2, 3]),
          description: "Ticket metadata",
          key_val_data: [
            { key: "venueName", val: { TextContent: "Amazing Concert" } },
            { key: "date", val: { TextContent: "2024-12-31" } },
          ],
          purpose: { Rendered: null },
        },
      ];

      console.log(record);
      console.log(selectedVenue);
      const dateInNanoseconds = convertDateToNanoseconds(selectedDate);

      const response = await backend.buyOfflineEventTicket(
        id,
        selectedVenue.id,
        { ticket_type: ticketTypeVariant, price: 1, priceFiat: 1 },
        record,

        Principal.fromText(principal),
        dateInNanoseconds,

        ticketQuantity,
        { Cash: null }
      );

      console.log("event ticket purchased successfully:", response);
      notificationManager.success("Ticket purchase successfully");

      toggleModal();
    } catch (err) {
      console.error("Error in buying event tickets:", err);
      toggleModal();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" flex justify-center  p-2 py-5">
      {/* Ticket Card */}
      <div
        onClick={toggleModal}
        className={`relative ${gradientClass} rounded-xl w-full h-[160px] overflow-hidden cursor-pointer`}
      >
        <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 h-16 w-16 bg-background rounded-full z-20"></div>
        <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 h-16 w-16 bg-background rounded-full"></div>
        <div className="flex relative z-10">
          <div
            className={`h-[160px] w-[103px] ${highlightClass} flex items-center justify-center`}
          >
            <span className="transform -rotate-90 whitespace-nowrap text-[20px] font-black pt-15 tracking-widest text-white">
              {type}
            </span>
          </div>
          <div className="w-3/4 p-4">
            <h3 className="text-xl font-black">{name}</h3>
            {/* <p className="text-base font-normal">{description}</p> */}
            <div className="flex justify-between mt-[5rem]">
              <span className="  font-black">Rp.{price}</span>
              <span className="  font-normal">{availability} TICKETS LEFT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-2xl text-secondary   mb-4">{name}</h2>
            <div className="mb-4">
              <label className="block text-secondary text-lg mb-2">
                Select Date:
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg p-2"
                value={selectedDate}
                min={new Date().toISOString().split("T")[0]} // Today's date
                max={
                  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0]
                } // One week from now
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="flex justify-between">
              <label className="block text-secondary text-lg mb-2">
                Quantity:
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setTicketQuantity(Math.max(1, ticketQuantity - 1))
                  }
                  className="px-2 py-1 bg-gray-200 rounded-md"
                >
                  <FaMinus size={8} />
                </button>
                <span className="text-lg">{ticketQuantity}</span>
                <button
                  onClick={() =>
                    setTicketQuantity(
                      Math.min(ticketQuantity + 1, availability)
                    )
                  }
                  className="px-2 py-1 bg-gray-200 rounded-md"
                >
                  <FaPlus size={8} />
                </button>
              </div>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-lg text-secondary  ">Price:</span>
              <span className="text-lg font-semibold">
                Rp.{parseInt(tickets.sTicket_price)}
              </span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-lg  text-secondary ">Tickets Left:</span>
              <span className="text-lg font-semibold">
                {parseInt(tickets.sTicket_limit)}
              </span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-lg text-secondary  ">Type:</span>
              <span className="text-lg font-semibold">{type}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-lg text-secondary  ">Payment Mode:</span>
              <span className="text-lg font-semibold">Cash</span>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={toggleModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
              >
                Close
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-white ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-secondary hover:bg-secondary-dark"
                }`}
                onClick={buyVenueTicketHandler}
                disabled={loading} // Disable button when loading
              >
                {loading ? "Buying..." : "Buy Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
