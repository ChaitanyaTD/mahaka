import React, { useEffect, useState } from "react";
import { useIdentityKit } from "@nfid/identitykit/react";
import { useLocation, useNavigate } from "react-router-dom";
import { createActor } from "../../../../declarations/Fiatpayment/index";
import { useAuth } from "../../connect/useClient";
import Confetti from "react-confetti";
const PaymentStatusUpdate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { identity } = useIdentityKit();
  const [ticketType, setTicketType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [responseMessage, setResponseMessage] = useState(
    "Processing payment..."
  );

  const canisterIDFiat = process.env.CANISTER_ID_FIATPAYMENT;
  const { backend } = useAuth();
  const fullPath = location.pathname + location.hash;
  const match = fullPath.match(/\/([^/]+)\/([^/]+)\/([^/]+)/) || [];

  const mockData = {
    paymentMethod: "stripe",
    invoiceNo: Number(match[3]),
    isSuccess: match[2] === "success",
  };

  const [backendActor, setBackendActor] = useState(null);

  useEffect(() => {
    if (identity) {
      const actor = createActor(canisterIDFiat, {
        agentOptions: { identity, verifyQuerySignatures: true },
      });
      setBackendActor(actor);
    }
  }, [identity, canisterIDFiat]);

  useEffect(() => {
    const handlePaymentStatusUpdate = async () => {
      if (!identity || !backendActor) {
        setResponseMessage("Identity or backend is not available.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setResponseMessage("Processing payment...");

        const updateResponse = await backendActor.change_invoice_status({
          paymentMethod: mockData.paymentMethod,
          invoiceNo: mockData.invoiceNo,
          isSuccess: mockData.isSuccess,
        });

        if (!("ok" in updateResponse)) {
          setPaymentStatus("failure");
          setResponseMessage(
            updateResponse?.message || "Payment update failed."
          );
        }

        setPaymentStatus("success");
        setResponseMessage("Payment updated successfully.");

        const invoiceResponse = await backendActor.get_invoice(
          mockData.invoiceNo
        );

        const itemName = invoiceResponse?.body?.success?.items[0]?.name || "";
        const type = itemName.includes("Venue")
          ? "Venue"
          : itemName.includes("Event")
          ? "Event"
          : itemName.includes("Wahana")
          ? "Wahana"
          : null;

        setTicketType(type);

        if (type) {
          const ticketPayload = { [type]: null };
          const processResponse = await backend.processPendingPayment(
            mockData.invoiceNo,
            ticketPayload
          );

          if ("ok" in processResponse) {
            setPaymentStatus("success");
            setResponseMessage("Ticket booked successfully.");
          } else {
            setPaymentStatus("failure");
            setResponseMessage(
              processResponse?.err || "Payment processing failed."
            );
          }
        }
      } catch (error) {
        console.error("Error during payment update:", error);
        setPaymentStatus("failure");
        setResponseMessage("An error occurred while processing the payment.");
      } finally {
        setLoading(false);
      }
    };

    if (backendActor && identity) {
      handlePaymentStatusUpdate();
    }
  }, [backendActor, identity, mockData.invoiceNo, mockData.isSuccess]);

  const handleNavigateHome = () => navigate("/user/my-booking");
  const backhome = () => navigate("/");

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 bg-gray-50">
      {loading ? (
        <div className="fixed inset-0 z-[50001] flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col items-center">
            <div className="loader border-t-transparent border-4 border-gray-400 rounded-full w-12 h-12 animate-spin"></div>
            <div className="mt-4 text-lg font-semibold text-gray-700">
              {responseMessage}
            </div>
          </div>
        </div>
      ) : paymentStatus === "success" ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-600">
            Payment Successful!
          </h1>
          <p className="mt-4 text-lg">{responseMessage}</p>
          <button
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleNavigateHome}
          >
            View Ticket
          </button>
          <ConfettiComponent />
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Payment Failed!</h1>
          <p className="mt-4 text-lg">{responseMessage}</p>
          <button
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={backhome}
          >
            Back to Home
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentStatusUpdate;

function ConfettiComponent() {
  const [showConfetti, setShowConfetti] = useState(true);
  function easeInOutQuad(currentTime, currentValue, targetValue, duration) {
    currentTime /= duration / 2;
    if (currentTime < 1)
      return (targetValue / 2) * currentTime * currentTime + currentValue;
    currentTime--;
    return (
      (-targetValue / 2) * (currentTime * (currentTime - 2) - 1) + currentValue
    );
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false); // Stop showing confetti after 5 seconds
    }, 5000); // 5 seconds

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window?.innerWidth || 300}
          height={window?.innerHeight || 200}
          tweenDuration={5000} // Duration in milliseconds (5 seconds)
          tweenFunction={
            (currentTime, currentValue, targetValue, duration) =>
              easeInOutQuad(currentTime, currentValue, targetValue, 5000) // Pass duration of 5 seconds
          }
        />
      )}
    </>
  );
}
