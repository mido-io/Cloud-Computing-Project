import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/checkout.css";

const API_BASE_URL = process.env.REACT_APP_PAYMENT_API_URL || "http://localhost:5004";
const PAYMOB_IFRAME_ID = process.env.REACT_APP_PAYMOB_IFRAME_ID || "1041996";

const Checkout = () => {
  const [paymentToken, setPaymentToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paid, setPaid] = useState(false);

  // Example order data — in production comes from cart / order service
  const orderData = {
    orderId: "ORDER00036",
    userId: "USER67890",
    amount: 43,
    currency: "EGP",
    firstName: "John",
    lastName: "Doe",
    email: "customer@skydish.com",
    phone: "+201001234567",
  };

  useEffect(() => {
    initiatePayment();

    // Listen for Paymob callback message from iframe
    const handleMessage = (event) => {
      if (event.data && event.data.type === "paymob_success") {
        setPaid(true);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const initiatePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/payment/process`, orderData);
      console.log("Paymob response:", response.data);

      const token =
        response.data.paymentToken ||
        response.data.payment_key ||
        response.data.token;

      if (token) {
        setPaymentToken(token);
      } else {
        setError("⚠️ Could not retrieve payment token from server.");
      }
    } catch (err) {
      console.error("Payment initiation error:", err.response?.data || err.message);
      setError("❌ Failed to initiate payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const iframeUrl = paymentToken
    ? `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`
    : null;

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">💳 Secure Payment</h2>

      <div className="order-summary">
        <p><strong>Order:</strong> {orderData.orderId}</p>
        <p><strong>Amount:</strong> {orderData.amount} {orderData.currency}</p>
      </div>

      {paid && (
        <div className="checkout-success">
          ✅ Payment Successful! Your order is confirmed.
        </div>
      )}

      {error && (
        <div className="checkout-error">
          {error}
          <button onClick={initiatePayment} className="checkout-btn" style={{ marginTop: "12px" }}>
            Retry
          </button>
        </div>
      )}

      {loading && !error && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <span className="spinner" />
          <p>Preparing secure payment...</p>
        </div>
      )}

      {iframeUrl && !paid && !loading && (
        <div className="paymob-iframe-wrapper">
          <iframe
            src={iframeUrl}
            title="Paymob Payment"
            width="100%"
            height="600px"
            style={{ border: "none", borderRadius: "12px" }}
            allow="payment"
          />
        </div>
      )}

      {!iframeUrl && !loading && !error && (
        <div className="checkout-error">
          ⚠️ Payment service is not configured. Please contact support.
        </div>
      )}
    </div>
  );
};

export default Checkout;
