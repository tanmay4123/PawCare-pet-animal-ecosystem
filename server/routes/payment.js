import express from "express";
import Donation from "../models/Donation.js";
import { createOrder, getOrder, verifyWebhookSignature } from "/utils/cashfree.js";

const router = express.Router();

/** CREATE ORDER */
router.post("/create", async (req, res) => {
  try {
    const { donorName, email, phone, amount } = req.body;
    if (!donorName || !email || !phone || !amount)
      return res.status(400).json({ success: false, message: "Missing fields" });

    const donation = await Donation.create({
      donorName,
      email,
      phone,
      amount,
      currency: "INR",
      status: "created",
    });

    const orderId = `don_${donation._id}`;
    const cashfreeResp = await createOrder({
      orderId,
      amount,
      currency: "INR",
      customer: { id: orderId, name: donorName, email, phone },
    });

    if (!cashfreeResp || cashfreeResp.status === "ERROR" || cashfreeResp.code === "request_failed") {
      donation.status = "failed";
      donation.meta = cashfreeResp;
      await donation.save();
      return res.status(500).json({ success: false, message: "Cashfree auth failed", gatewayResponse: cashfreeResp });
    }

    donation.gatewayOrderId = cashfreeResp.order_id || orderId;
    donation.meta = cashfreeResp;
    donation.status = "pending";
    await donation.save();

    res.json({
      success: true,
      donationId: donation._id,
      orderId: donation.gatewayOrderId,
      appId: process.env.GATEWAY_APP_ID,
      gatewayData: cashfreeResp,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Payment creation failed", error: err.message });
  }
});

/** VERIFY PAYMENT */
router.post("/verify", async (req, res) => {
  try {
    const payload = req.body;
    const orderId = payload.order_id || payload.orderId;
    if (!orderId) return res.status(400).json({ success: false, message: "order_id missing" });

    const orderInfo = await getOrder(orderId);
    const donation = await Donation.findOne({ gatewayOrderId: orderId });
    if (!donation) return res.status(404).json({ success: false, message: "Donation not found" });

    donation.meta = { ...(donation.meta || {}), verifyPayload: orderInfo };

    if (orderInfo.payment_status === "SUCCESS" || orderInfo.order_status === "PAID") {
      donation.status = "paid";
      donation.gatewayPaymentId = orderInfo.payment_id || payload.payment_id;
    } else {
      donation.status = "failed";
    }

    await donation.save();
    res.json({ success: true, message: "Verification complete", donation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Verification failed", error: err.message });
  }
});

/** WEBHOOK */
router.post("/webhook", async (req, res) => {
  try {
    const rawBody = req.body.toString("utf8");
    const signature =
      req.headers["x-cf-signature"] ||
      req.headers["x-signature"] ||
      req.headers["x-cashfree-signature"];
    if (!verifyWebhookSignature(rawBody, signature)) return res.status(400).send("Invalid signature");

    const event = JSON.parse(rawBody);
    const orderId = event.order?.order_id || event.data?.order_id;
    if (!orderId) return res.status(200).send("No order_id found");

    const donation = await Donation.findOne({ gatewayOrderId: orderId });
    if (!donation) return res.status(200).send("Donation not found");

    const status = event.order?.order_status || event.data?.order_status;
    donation.status =
      status === "PAID" || status === "SUCCESS"
        ? "paid"
        : status === "FAILED"
        ? "failed"
        : donation.status;

    donation.gatewayPaymentId = event.payment?.payment_id || donation.gatewayPaymentId;
    donation.meta = { ...(donation.meta || {}), webhook: event };
    await donation.save();

    res.status(200).send("Webhook received");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

/* ------------------------------------------------------------------
   🏆 EXTRA ROUTES — Donation Record & Leaderboard
------------------------------------------------------------------ */

/** Record donation manually (for leaderboard or after success) */
router.post("/record", async (req, res) => {
  try {
    const {
      donorName,
      email,
      phone,
      amount,
      currency,
      gatewayOrderId,
      gatewayPaymentId,
      status,
    } = req.body;

    if (!donorName || !email || !phone || !amount) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const donation = new Donation({
      donorName,
      email,
      phone,
      amount,
      currency: currency || "INR",
      gatewayOrderId,
      gatewayPaymentId,
      status: status || "paid",
    });

    await donation.save();
    res.json({ success: true, message: "Donation recorded successfully", donation });
  } catch (err) {
    console.error("❌ Error saving donation:", err);
    res.status(500).json({ success: false, message: "Failed to record donation" });
  }
});

/** Fetch Top 5 Donors for Leaderboard */
router.get("/top", async (req, res) => {
  try {
    const topDonations = await Donation.find({ status: "paid" })
      .sort({ amount: -1 })
      .limit(5);

    res.json({ success: true, topDonations });
  } catch (err) {
    console.error("❌ Error fetching leaderboard:", err);
    res.status(500).json({ success: false, message: "Failed to fetch leaderboard" });
  }
});

export default router;
