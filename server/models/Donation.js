// server/models/Donation.js
import mongoose from "mongoose";

const DonationSchema = new mongoose.Schema({
  donorName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  gatewayOrderId: { type: String },
  gatewayPaymentId: { type: String },
  status: {
    type: String,
    enum: ["created", "pending", "paid", "failed", "refunded"],
    default: "created",
  },
  meta: { type: Object },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

DonationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Donation = mongoose.model("Donation", DonationSchema);
export default Donation;
