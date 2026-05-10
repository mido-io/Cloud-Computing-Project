const express = require("express");
const router = express.Router();
const axios = require("axios");
const Payment = require("../models/PaymentModel");
const { sendSmsNotification } = require("../utils/twilioService");
require("dotenv").config();

const PAYMOB_API_KEY      = process.env.PAYMOB_API_KEY;
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
const PAYMOB_IFRAME_ID    = process.env.PAYMOB_IFRAME_ID;

async function getAuthToken() {
  const res = await axios.post("https://accept.paymob.com/api/auth/tokens", {
    api_key: PAYMOB_API_KEY,
  });
  return res.data.token;
}

async function registerOrder(authToken, amountCents, currency, orderId) {
  const res = await axios.post("https://accept.paymob.com/api/ecommerce/orders", {
    auth_token: authToken,
    delivery_needed: false,
    amount_cents: amountCents,
    currency: currency || "EGP",
    merchant_order_id: orderId,
    items: [],
  });
  return res.data.id;
}

async function getPaymentKey(authToken, paymobOrderId, amountCents, currency, billingData) {
  const res = await axios.post("https://accept.paymob.com/api/acceptance/payment_keys", {
    auth_token: authToken,
    amount_cents: amountCents,
    expiration: 3600,
    order_id: paymobOrderId,
    billing_data: billingData,
    currency: currency || "EGP",
    integration_id: parseInt(PAYMOB_INTEGRATION_ID),
  });
  return res.data.token;
}

router.post("/process", async (req, res) => {
  try {
    const { orderId, userId, amount, currency, email, phone, firstName, lastName } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required." });
    }

    console.log(`Processing Paymob payment for order ${orderId}`);

    let payment = await Payment.findOne({ orderId });
    if (payment && payment.status === "Paid") {
      return res.status(200).json({
        message: "✅ This order has already been paid successfully.",
        paymentStatus: "Paid",
        disablePayment: true,
      });
    }

    const amountCents  = Math.round(parseFloat(amount) * 100);
    const usedCurrency = currency || "EGP";

    const authToken     = await getAuthToken();
    const paymobOrderId = await registerOrder(authToken, amountCents, usedCurrency, orderId);

    const billingData = {
      apartment: "N/A",
      email: email || "N/A",
      floor: "N/A",
      first_name: firstName || "Customer",
      last_name: lastName || "User",
      street: "N/A",
      building: "N/A",
      phone_number: phone,
      shipping_method: "N/A",
      postal_code: "N/A",
      city: "N/A",
      country: "EG",
      state: "N/A",
    };

    const paymentKey = await getPaymentKey(authToken, paymobOrderId, amountCents, usedCurrency, billingData);
    const iframeUrl  = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;

    if (!payment) {
      payment = new Payment({
        orderId,
        userId,
        amount,
        currency: usedCurrency,
        status: "Pending",
        stripePaymentIntentId: paymobOrderId.toString(),
        stripeClientSecret: paymentKey,
        phone,
        email,
      });
    } else {
      payment.stripePaymentIntentId = paymobOrderId.toString();
      payment.stripeClientSecret    = paymentKey;
    }
    await payment.save();
    console.log(`✅ Paymob payment initiated for order ${orderId}`);

    return res.json({
      paymentKey,
      iframeUrl,
      paymentId: payment._id,
      disablePayment: false,
    });
  } catch (error) {
    if (error.code === 11000) {
      const existingPayment = await Payment.findOne({ orderId: req.body.orderId });
      if (existingPayment) {
        if (existingPayment.status === "Paid") {
          return res.status(200).json({
            message: "✅ This order has already been paid successfully.",
            paymentStatus: "Paid",
            disablePayment: true,
          });
        }
        return res.json({
          paymentKey: existingPayment.stripeClientSecret,
          paymentId: existingPayment._id,
          disablePayment: false,
        });
      }
    }
    console.error("❌ Paymob payment processing error:", error.message);
    res.status(500).json({ error: "❌ Payment processing failed. Please try again." });
  }
});

module.exports = router;
