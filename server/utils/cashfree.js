// server/utils/cashfree.js
import crypto from "crypto";
import fetch from "node-fetch"; // Only needed for Node < 18


const BASE_URL =
  process.env.GATEWAY_MODE === "sandbox"
    ? "https://sandbox.cashfree.com/pg"
    : "https://api.cashfree.com/pg";

console.log("🟢 Cashfree Config:");
console.log("MODE:", process.env.GATEWAY_MODE);
console.log("APP_ID:", process.env.GATEWAY_APP_ID);
console.log("BASE_URL:", BASE_URL);

/**
 * 🟢 Create Cashfree Order (with full debug logging)
 */
export async function createOrder({ orderId, amount, currency, customer }) {
  try {
    console.log("Creating Cashfree order:", {
      orderId,
      amount,
      currency,
      customer,
    });

    const body = {
      order_id: orderId,
      order_amount: amount,
      order_currency: currency,
      order_meta: {
        return_url: `https://pawcare-pet-animal-ecosystem.onrender.com/donation/success.html?order_id=${orderId}`
      },

      customer_details: {
        customer_id: orderId,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone || "9999999999",
      },
    };


    console.log("📦 Request Body:", body);

    const response = await fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "x-client-id": process.env.GATEWAY_APP_ID,
        "x-client-secret": process.env.GATEWAY_SECRET,
        "x-api-version": "2022-09-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("📩 Response Status:", response.status);
    const text = await response.text();
    console.log("🟣 Raw Cashfree Response:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("⚠️ Failed to parse JSON response:", e.message);
      return { status: "FAILED", message: "Invalid JSON response" };
    }

    return data;
  } catch (err) {
    console.error("❌ Cashfree createOrder error:", err);
    return { status: "FAILED", message: err.message };
  }
}

/**
 * 🔵 Get Cashfree Order Info
 */
export async function getOrder(orderId) {
  try {
    const response = await fetch(`${BASE_URL}/orders/${orderId}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-client-id": process.env.GATEWAY_APP_ID,
        "x-client-secret": process.env.GATEWAY_SECRET,
        "x-api-version": "2022-09-01",
      },
    });

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("❌ Cashfree getOrder error:", err);
    return { status: "FAILED", message: err.message };
  }
}

/**
 * 🟣 Verify Webhook Signature
 */
export function verifyWebhookSignature(rawBody, signature) {
  try {
    const computed = crypto
      .createHmac("sha256", process.env.WEBHOOK_SECRET)
      .update(rawBody)
      .digest("base64");
    return computed === signature;
  } catch (err) {
    console.error("❌ Webhook verification error:", err);
    return false;
  }
}
