import { useState } from "react";

import {
  createPaymentOrder,
  verifyPayment,
} from "../../lib/api";

import { useToast } from "../ui/Toast";

const PayNowButton = ({ bookingId, token, amount }) => {
  const [loading, setLoading] = useState(false);

  const {
    success: showSuccess,
    error: showError,
  } = useToast();

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  const handlePayment = async () => {
    if (loading) return;

    if (!bookingId || !token) {
      showError(
        "Unable to process payment",
        "Please login again and try."
      );
      return;
    }

    try {
      setLoading(true);

      // --------------------------------------------------
      // 1. Create Razorpay order
      // --------------------------------------------------
      const data = await createPaymentOrder(
        bookingId,
        token
      );

      const { order } = data;

      if (!order || !order.id) {
        throw new Error(
          "Unable to create payment order."
        );
      }

      // --------------------------------------------------
      // 2. Check Razorpay SDK
      // --------------------------------------------------
      if (!window.Razorpay) {
        throw new Error(
          "Razorpay payment gateway is not loaded. Please refresh the page and try again."
        );
      }

      // --------------------------------------------------
      // 3. Razorpay Checkout
      // --------------------------------------------------
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        amount: order.amount,
        currency: order.currency,

        name: "StayNest",
        description: "PG / Hostel Booking",

        order_id: order.id,

        handler: async function (paymentResponse) {
          try {
            // --------------------------------------------------
            // 4. Verify payment on backend
            // --------------------------------------------------
            const verificationData = {
              bookingId,

              razorpay_payment_id:
                paymentResponse.razorpay_payment_id,

              razorpay_order_id:
                paymentResponse.razorpay_order_id,

              razorpay_signature:
                paymentResponse.razorpay_signature,
            };

            const result = await verifyPayment(
              verificationData,
              token
            );

            console.log(
              "Payment verification result:",
              result
            );

            // --------------------------------------------------
            // 5. Success
            // --------------------------------------------------
            showSuccess(
              "Payment successful",
              `Your payment of ${formatCurrency(
                order.amount / 100
              )} has been completed successfully.`
            );

            // Refresh booking data
            window.location.reload();
          } catch (error) {
            console.error(
              "Payment verification error:",
              error
            );

            showError(
              "Payment verification failed",
              error.message ||
                "If money was deducted, please contact support."
            );
          }
        },

        modal: {
          ondismiss: function () {
            console.log(
              "Razorpay checkout closed by user."
            );
          },
        },

        theme: {
          color: "#2563eb",
        },
      };

      const razorpay = new window.Razorpay(
        options
      );

      // --------------------------------------------------
      // 6. Payment failure
      // --------------------------------------------------
      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Payment failed:",
            response.error
          );

          const errorMessage =
            response?.error?.description ||
            "Payment failed. Please try again.";

          showError(
            "Payment failed",
            `${errorMessage} Your booking has not been marked as paid.`
          );
        }
      );

      // --------------------------------------------------
      // 7. Open Razorpay
      // --------------------------------------------------
      razorpay.open();
    } catch (error) {
      console.error(
        "Payment error:",
        error
      );

      showError(
        "Unable to start payment",
        error.message ||
          "Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handlePayment}
        disabled={loading}
        aria-busy={loading}
        className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              aria-hidden="true"
            />

            <span>
              Processing Payment...
            </span>
          </>
        ) : (
          <>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect
                width="18"
                height="14"
                x="3"
                y="5"
                rx="2"
              />
              <line
                x1="3"
                x2="21"
                y1="10"
                y2="10"
              />
            </svg>

            <span>
              {amount
                ? `Pay ${formatCurrency(amount)}`
                : "Pay Now"}
            </span>
          </>
        )}
      </button>

      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect
            width="18"
            height="11"
            x="3"
            y="11"
            rx="2"
          />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>

        <span>
          Secure payment powered by Razorpay
        </span>
      </div>
    </div>
  );
};

export default PayNowButton;