const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Payment = require("../models/PaymentModel");
const { sendSmsNotification } = require("../utils/twilioService");
const { sendEmailNotification } = require("../utils/emailService");
require("dotenv").config();

const PAYMOB_HMAC = process.env.PAYMOB_HMAC_SECRET;

// Verify Paymob HMAC-SHA512 signature
function verifyHmac(obj, receivedHmac) {
  const fields = [
    "amount_cents", "created_at", "currency", "error_occured",
    "has_parent_transaction", "id", "integration_id", "is_3d_secure",
    "is_auth", "is_capture", "is_refunded", "is_standalone_payment",
    "is_voided", "order", "owner", "pending",
    "source_data.pan", "source_data.sub_type", "source_data.type", "success",
  ];
  const concatenated = fields.map(f => {
    if (f.startsWith("source_data.")) {
      const key = f.split(".")[1];
      return obj.source_data?.[key] ?? "";
    }
    if (f === "order") return obj.order?.id ?? "";
    return obj[f] ?? "";
  }).join("");

  const hmac = crypto.createHmac("sha512", PAYMOB_HMAC)
    .update(concatenated)
    .digest("hex");
  return hmac === receivedHmac;
}

router.post("/", async (req, res) => {
  console.log("Paymob webhook received");

  const { hmac } = req.query;
  const { obj, type } = req.body;

  if (!obj || !hmac) {
    return res.status(400).json({ error: "Invalid webhook payload" });
  }

  if (!verifyHmac(obj, hmac)) {
    console.error("❌ Paymob HMAC verification failed");
    return res.status(400).send("Webhook Error: HMAC verification failed");
  }

  if (type !== "TRANSACTION") {
    console.log(`Unhandled event type: ${type}`);
    return res.json({ received: true });
  }

  const paymobOrderId    = obj.order?.id?.toString();
  const merchantOrderId  = obj.order?.merchant_order_id;

  let payment = null;
  if (merchantOrderId) {
    payment = await Payment.findOne({ orderId: merchantOrderId });
  }
  if (!payment && paymobOrderId) {
    payment = await Payment.findOne({ stripePaymentIntentId: paymobOrderId });
  }
  if (!payment) {
    console.warn(`⚠️ No payment record found for orderId: ${merchantOrderId}`);
    return res.status(404).json({ error: "Payment record not found" });
  }

  console.log(`Found payment for order ${payment.orderId}, status: ${payment.status}`);

  const customerPhone = payment.phone;
  const customerEmail = payment.email;

  try {
    if (obj.success === true && payment.status !== "Paid") {
      payment.status = "Paid";
      await payment.save();
      console.log(`✅ Payment for Order ${payment.orderId} updated to Paid.`);

      if (customerPhone) {
        try {
          await sendSmsNotification(customerPhone, `Your payment for Order ${payment.orderId} was successful!`);
        } catch (e) { console.error(`❌ Twilio SMS error: ${e.message}`); }
      }

      if (customerEmail) {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; background-color: #f9f9f9; border-radius: 8px;">
            <h2 style="color: #333;">Payment Confirmation</h2>
            <p style="color: #555;">Dear Customer,</p>
            <p style="color: #555;">Your payment for <strong>Order #${payment.orderId}</strong> was successfully processed.</p>
            <div style="margin: 24px 0; padding: 16px; background: #fff; border: 1px solid #ddd; border-radius: 6px;">
              <p><strong>Amount:</strong> ${payment.amount} ${payment.currency?.toUpperCase()}</p>
              <p><strong>Status:</strong> ${payment.status}</p>
              <p><strong>Date:</strong> ${new Date(payment.createdAt).toLocaleString()}</p>
            </div>
            <p style="color: #888; font-size: 14px;">— SkyDish Food Delivery Team</p>
          </div>`;
        try {
          await sendEmailNotification(customerEmail, "Payment Confirmation for Your Order", emailHtml,
            `Your payment for Order ${payment.orderId} was successful!`);
        } catch (e) { console.error(`❌ Email error: ${e.message}`); }
      }

    } else if (obj.success === false && payment.status !== "Failed") {
      payment.status = "Failed";
      await payment.save();
      console.log(`❌ Payment for Order ${payment.orderId} updated to Failed.`);

      if (customerPhone) {
        try {
          await sendSmsNotification(customerPhone, `Your payment for Order ${payment.orderId} failed. Please try again.`);
        } catch (e) { console.error(`❌ Twilio SMS error: ${e.message}`); }
      }

      if (customerEmail) {
        const emailHtml = `<p>Dear Customer,</p><p>Your payment for Order <strong>${payment.orderId}</strong> failed. Please try again.</p>`;
        try {
          await sendEmailNotification(customerEmail, "Payment Failed", emailHtml,
            `Your payment for Order ${payment.orderId} failed.`);
        } catch (e) { console.error(`❌ Email error: ${e.message}`); }
      }
    } else {
      console.log(`Payment for Order ${payment.orderId} already at status: ${payment.status}`);
    }
  } catch (err) {
    console.error("❌ Error updating payment status in DB:", err.message);
    return res.status(500).json({ error: "Database update failed" });
  }

  res.json({ received: true });
});

module.exports = router;
