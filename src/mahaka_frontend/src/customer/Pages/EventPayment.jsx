import React, { useState, useEffect } from "react";
import payimg from "../../assets/images/payment.png";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { idlFactory } from "../../connect/token-cicp-ladger";
import { useAgent, useIdentityKit } from "@nfid/identitykit/react";
import { Actor } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import DatePicker from "../../common/DatePicker";
import VisitorPicker from "../Components/single-event/VisitorPicker";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../connect/useClient";
import { HttpAgent } from "@dfinity/agent";

const EventPayment = () => {
  const authenticatedAgent = useAgent();
  const { user, icpBalance } = useIdentityKit();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [eventdetail, seteventdetail] = useState(null);
  const location = useLocation();
  const fullPath = location.pathname + location.hash;

  const match = fullPath.match(/^(.+?)\/events\/(.+?)\/(.+?)\/payment/);

  const vanue = match[1];
  const vanueid = vanue.startsWith("/") ? vanue.slice(1) : vanue;

  const eventId = match[2];
  const ticketType = match[3];
  console.log("vanu", vanueid);

  const [numberOFVisitor, setNumberOFVisitor] = useState(1);
  const [paymenttype, setPaymentType] = useState("Card");
  const [loading, setLoading] = useState(false);
  const [loadingdata, setLoadingData] = useState(false);
  const navigate = useNavigate();
  const eventIds = `${decodeURIComponent(eventId).replace(/_/g, "#")}${
    window.location.hash
  }`;
  const vanueids = `${decodeURIComponent(vanueid).replace(/_/g, "#")}${
    window.location.hash
  }`;
  const [timestemp, setTimeStemp] = useState(0);

  const { backend, principal } = useAuth();
  // const { backend } = useSelector((state) => state.authentication);
  const { identity } = useIdentityKit();
  const ICP_API_HOST = "https://icp-api.io/";
  const [unauthenticatedAgent, setUnauthenticatedAgent] = useState(null);
  const [ticketprice, setTicketPrice] = useState(0);

  useEffect(() => {
    (async () => {
      const agent = new HttpAgent({ host: ICP_API_HOST });
      setUnauthenticatedAgent(agent);
    })();
  }, []);
  function extractCanisterId(url) {
    const match = url.match(
      /[a-z2-7]{5}-[a-z2-7]{5}-[a-z2-7]{5}-[a-z2-7]{5}-[a-z2-7]{3}/
    );
    return match ? match[0] : null;
  }
  const eventprincipal = Principal.fromText(extractCanisterId(eventId));
  useEffect(() => {
    const fetchEvent = async () => {
      setLoadingData(true);
      try {
        const data1 = await backend.getDIPdetails(eventprincipal);

        seteventdetail(data1);
        console.log("event detail", data1);
      } catch (error) {
        console.error("Error fetching:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchEvent();
  }, [backend]);
  useEffect(() => {
    if (eventdetail) {
      if (ticketType === "GROUP") {
        setTicketPrice(eventdetail.gTicket_price || 0);
      } else if (ticketType === "SINGLE") {
        setTicketPrice(eventdetail.sTicket_price || 0);
      } else if (ticketType === "VIP") {
        setTicketPrice(eventdetail.vTicket_price || 0);
      }
    }
  }, [eventdetail, ticketType]);

  // const handlePayment = async () => {
  //   if (!user) {
  //     alert("Please login first");
  //   }

  //   // Create Actor for payment
  //   const actor = Actor.createActor(idlFactory, {
  //     agent: authenticatedAgent,
  //     canisterId: "ryjl3-tyaaa-aaaaa-aaaba-cai",
  //   });
  //   console.log("object", actor, authenticatedAgent);
  //   const acc = {
  //     owner: Principal.fromText(process.env.CANISTER_ID_MAHAKA_BACKEND),
  //     subaccount: [],
  //   };

  //   const icrc2_approve_args = {
  //     from_subaccount: [],
  //     spender: acc,
  //     fee: [],
  //     memo: [],
  //     amount: BigInt(10000),
  //     created_at_time: [],
  //     expected_allowance: [],
  //     expires_at: [],
  //   };

  //   try {
  //     setIsPaymentProcessing(true);
  //     const response = await actor.icrc2_approve(icrc2_approve_args);
  //     console.log("Response from payment approve", response);

  //     if (response.Ok) {
  //       console.log("Payment approved! run further steps");
  //     } else {
  //       console.error("Payment failed");
  //     }
  //   } catch (err) {
  //     console.error("Error in payment approve", err);
  //   } finally {
  //     setIsPaymentProcessing(false);
  //   }

  //   // const transferArgs = {
  //   //   from_subaccount: [],
  //   //   spender: {
  //   //     owner: Principal.fromText("bd3sg-teaaa-aaaaa-qaaba-cai"),
  //   //     subaccount: [],
  //   //   },
  //   //   amount: BigInt(coffeeAmount * 10 ** 8 + 10000),
  //   //   fee: [],
  //   //   memo: [],
  //   //   created_at_time: [],
  //   //   expected_allowance: [],
  //   //   expires_at: [],
  //   // };
  //   // console.log("Transfer Args:", transferArgs);
  //   // try {
  //   //   const response = await actor.icrc2_approve(transferArgs);
  //   //   console.log("Response from icrc2_approve:", response);
  //   //   if (response && response.Ok) {
  //   //     setMessage(`Transferred ${coffeeAmount} ICP`);
  //   //     setPaymentStatus("Payment successful");
  //   //     await buyEventTicketHandler();
  //   //   } else {
  //   //     console.error("Unexpected response format or error:", response);
  //   //     throw new Error(response?.Err || "Payment failed");
  //   //   }
  //   // } catch (error) {
  //   //   setMessage("Payment failed");
  //   //   setPaymentStatus("Payment failed");
  //   //   console.error("Payment error:", error);
  //   // } finally {
  //   //   setLoading(false);
  //   //   setProcessing(false);
  //   //   setTimeout(() => setMessage("Make Payment"), 5000);
  //   // }
  // };

  // const buyEventTicketHandler = async () => {
  //   try {
  //     const ticketTypeVariant = { [ticketType]: null };
  //     const record = [
  //       {
  //         data: new Uint8Array([1, 2, 3]),
  //         description: "Ticket metadata",
  //         key_val_data: [
  //           { key: "eventName", val: { TextContent: "Amazing Concert" } },
  //           { key: "date", val: { TextContent: "2024-12-31" } },
  //         ],
  //         purpose: { Rendered: null },
  //       },
  //     ];

  //     const response = await backend.buyVenueTicket(
  //       "current venue#br5f7-7uaaa-aaaaa-qaaca-cai",
  //       { ticket_type: ticketTypeVariant, price: 1 },
  //       record,
  //       [
  //         Principal.fromText(
  //           "h7yxq-n6yb2-6js2j-af5hk-h4inj-edrce-oevyj-kbs7a-76kft-vrqrw-nqe"
  //         ),
  //       ],
  //       { ICP: null },
  //       1
  //     );

  //     console.log("Event ticket purchased successfully:", response);
  //     navigate("/ticket");
  //   } catch (err) {
  //     console.error("Error in buying event tickets:", err);
  //   }
  // };
  const handlePayment = async (e) => {
    if (principal == undefined) {
      alert("jgh");
      return;
    }
    e.preventDefault();
    setLoading(true);
    const coffeeAmount = 0.0001;

    if (!unauthenticatedAgent) {
      console.error("Agent not initialized");
      return;
    }

    const actor = Actor.createActor(idlFactory, {
      agent: unauthenticatedAgent,
      canisterId: "ryjl3-tyaaa-aaaaa-aaaba-cai",
    });

    const transferArgs = {
      from_subaccount: [],
      spender: {
        owner: Principal.fromText(process.env.CANISTER_ID_MAHAKA_BACKEND),
        subaccount: [],
      },
      amount: BigInt(coffeeAmount * 10 ** 8 + 10000),
      fee: [],
      memo: [],
      created_at_time: [],
      expected_allowance: [],
      expires_at: [],
    };

    try {
      console.log("transferArgs:", transferArgs);
      const response = await actor.icrc2_approve(transferArgs);
      console.log("res of icp payment", response);

      if (response.Ok) {
        console.log("Payment successful:", response.Ok);
      } else {
        throw new Error(response.Err || "Payment failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setLoading(false);
      e.target.disabled = false;
    }
  };
  console.log("s", vanueids);

  const handlePayment2 = async (e) => {
    if (!principal) {
      alert("Please connect your wallet");
      return;
    }

    setLoading(true);
    setIsPaymentProcessing(true);

    const _eventIds = eventIds;
    const _ticket_type =
      ticketType === "GROUP"
        ? { GroupPass: null }
        : ticketType === "VIP"
        ? { VipPass: null }
        : { SinglePass: null }; // Dynamically set ticket type based on user selection

    // Metadata example; replace with actual data as needed
    const _metadata = [
      {
        data: new Uint8Array([0x12, 0x34]), // Replace with actual image data if available
        description: "Event ticket details",
        key_val_data: [
          {
            key: "eventName",
            val: { TextContent: eventdetail?.name || "Event" },
          },
          { key: "date", val: { TextContent: eventdetail?.date || "TBD" } },
          {
            key: "venue",
            val: { TextContent: eventdetail?.venue || "Venue Name" },
          },
        ],
        purpose: { Rendered: null },
      },
    ];

    const receiver = principal;
    const numOfVisitors = BigInt(numberOFVisitor);
    const paymentType = { Card: null };

    try {
      const response = await backend.buyEventTicket(
        vanueids,
        _eventIds,
        {
          ticket_type: _ticket_type,
          priceFiat: parseFloat(eventdetail?.gTicket_price || 0),
          price: BigInt(eventdetail?.price || 100_000),
        },
        _metadata,
        receiver,
        timestemp,
        numOfVisitors,
        paymentType
      );

      console.log("Response:", response);

      if ("ok" in response) {
        console.log("Purchase successful:", response.ok);
        navigate(`/venues/${vanueid}/primium/payment2/checkout`); // Ensure `vanueid` is defined
      } else {
        throw new Error(response.err || "Purchase failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert(`Payment failed: ${error.message}`);
    } finally {
      setLoading(false);
      setIsPaymentProcessing(false);
    }
  };

  return (
    <div className="w-full bg-white m-auto">
      <div className="max-w-7xl w-full  mx-auto   rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 md:gap-6">
        <div className="order-2 md:order-1 bg-white p-16 ">
          <h2 className="text-3xl font-black ">Ticket Details </h2>
          <hr className="my-3 text-[#ACACAC]" />
          <div className="mb-5">
            {loadingdata ? (
              <p className="text-xl font-semibold">
                Vanue id:-{" "}
                <span className="px-20 rounded-lg py-[2px] animate-spin bg-gray-200"></span>
              </p>
            ) : (
              <p className="text-xl font-semibold">Eventid id:-{eventIds}</p>
            )}
            {loadingdata ? (
              <p className="text-xl text-green-400 font-semibold mt-2">
                Number of Tickets Left: :{" "}
                <span className="px-6 rounded-lg  py-[2px] animate-spin bg-gray-200"></span>
              </p>
            ) : (
              <p className="text-xl text-green-400 font-semibold">
                Number of Tickets Left:{" "}
                {eventdetail?.gTicket_limit !== undefined
                  ? Number(eventdetail.maxLimit)
                  : "N/A"}
              </p>
            )}
          </div>
          <div className="py-4 space-y-12 ">
            <DatePicker timestemp={timestemp} setTimeStemp={setTimeStemp} />
            <VisitorPicker
              numberOFVisitor={numberOFVisitor}
              setNumberOFVisitor={setNumberOFVisitor}
            />
          </div>
          {/* <div className="mb-5">
            <input type="checkbox" id="saveCard" className="mr-2 " />
            <label htmlFor="saveCard">Save card details</label>
          </div>

          <p className="text-[#ACACAC] text-base font-normal mt-5">
            Lorem ipsum dolor sit amet consectetur. Malesuada sed senectus id
            tincidunt amet scelerisque diamam velit blandit. Bibendum fusce sed
            enim cursus sed in in. Quis malesuada mattis.
          </p> */}
        </div>
        <div className="order-1 md:order-2 bg-[#F9FAFA] p-16">
          <h2 className="text-3xl font-black ">Order Summary</h2>
          <hr className="my-3 text-[#ACACAC]" />
          <div className="flex items-center mb-8 mt-8 w-full ">
            <img
              src={payimg}
              alt="Ticket"
              className="w-12 h-12 object-cover rounded-md mr-4"
            />
            <div>
              <h3 className="text-2xl font-black">{eventdetail?.name}</h3>
              <p className="text-base font-normal text-[#ACACAC]">
                {ticketType}
              </p>
            </div>
            <div className="ml-auto">
              <p className="text-2xl font-black">
                Rp.{" "}
                {loadingdata ? (
                  <span className="px-4 rounded-lg  py-[2px] animate-spin bg-gray-200"></span>
                ) : (
                  Number(ticketprice)
                )}
              </p>
              <p className="text-base font-normal text-[#ACACAC]">
                Qty: {numberOFVisitor}
              </p>
            </div>
          </div>
          <hr className="my-4 text-[#ACACAC]" />
          <div className="flex justify-between ">
            <span className="text-lg font-normal text-[#0A0D13]">Subtotal</span>
            <span className="text-lg font-black text-[#0A0D13]">
              Rp.{" "}
              {loadingdata ? (
                <span className="px-4 rounded-lg  py-[2px] animate-spin bg-gray-200"></span>
              ) : (
                Number(ticketprice) * numberOFVisitor
              )}
            </span>
          </div>
          <hr className="my-4 text-[#ACACAC]" />
          <div className="flex justify-between font-bold text-xl">
            <span className="text-lg font-normal text-[#0A0D13]">Total</span>
            <span className="text-3xl font-black text-[#0A0D13]">
              Rp.{" "}
              {loadingdata ? (
                <span className="px-4 rounded-lg  py-[2px] animate-spin bg-gray-200"></span>
              ) : (
                Number(ticketprice) * numberOFVisitor
              )}
            </span>
          </div>
          <div className="py-4">
            <label className="block text-2xl font-black text-[#0A0D13] mb-2">
              Pay With:
            </label>
            <div className="flex items-center gap-4">
              <label
                htmlFor="card"
                className="flex items-center text-lg font-black cursor-pointer"
              >
                <input
                  type="radio"
                  id="card"
                  name="payment"
                  className="mr-2"
                  value="Card"
                  checked={paymenttype === "Card"}
                  onChange={() => setPaymentType("Card")}
                />
                Card
              </label>

              <label
                htmlFor="icp"
                className="flex items-center text-lg font-normal cursor-pointer"
              >
                <input
                  type="radio"
                  id="icp"
                  name="payment"
                  className="mr-2"
                  value="ICP"
                  checked={paymenttype === "ICP"}
                  onChange={() => setPaymentType("ICP")}
                />
                ICP Wallet
              </label>
            </div>
          </div>

          <button
            className={`w-full py-2 rounded-md text-white ${
              isPaymentProcessing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
            type="submit"
            disabled={isPaymentProcessing}
            onClick={paymenttype === "Card" ? handlePayment2 : handlePayment}
          >
            {isPaymentProcessing
              ? "Processing..."
              : `Process Payment with ${paymenttype}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventPayment;