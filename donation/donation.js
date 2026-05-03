// ----------------------
// PawCare Donation Logic (Stable Cashfree v3 Integration)
// ----------------------

document.addEventListener("DOMContentLoaded", async () => {
  const donateBtn = document.getElementById("donate-btn");
  const toggleBtn = document.getElementById("toggle-button");
  const raisedDisplay = document.getElementById("raised-display");
  const progressFill = document.getElementById("progress-fill");
  const leaderboardBody = document.getElementById("leaderboard-body");
  const coinLayer = document.getElementById("coin-layer");

  let totalRaised = 0;
  let donationType = "one-time";

  // 🔁 Toggle donation type
  toggleBtn.addEventListener("click", () => {
    donationType = donationType === "one-time" ? "autopay" : "one-time";
    toggleBtn.classList.toggle("autopay");
    toggleBtn.classList.toggle("one-time");
  });

  // ✅ Preload and verify Cashfree SDK
  if (typeof Cashfree === "undefined") {
    alert("Cashfree SDK failed to load. Please refresh and try again.");
    return;
  }
  console.log("✅ Cashfree SDK detected:", Cashfree);

  // ⚡ Initialize the SDK instance once
  const cashfree = Cashfree({ mode: "sandbox" });
  console.log("🟢 Cashfree instance initialized:", cashfree);

  // 💳 Handle donation
  donateBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const name = document.getElementById("donor-name").value.trim();
    const email = document.getElementById("donor-email").value.trim();
    const phone = document.getElementById("donor-phone").value.trim();
    const amount = parseInt(document.getElementById("donation-amount").value, 10);

    if (!name || !email || !phone || !amount || amount < 10) {
      alert("Please enter valid details (minimum ₹10).");
      return;
    }

    // 🧾 Save info locally for receipt after redirect
    localStorage.setItem(
      "lastDonation",
      JSON.stringify({
        name,
        email,
        phone,
        amount,
        date: new Date().toLocaleDateString("en-IN"),
      })
    );

    donateBtn.disabled = true;
    donateBtn.textContent = "Processing...";

    try {
      // 🔹 Step 1: Create order via backend
      const res = await fetch("http://localhost:8000/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName: name,
          email,
          phone,
          amount,
        }),
      });

      const data = await res.json();
      console.log("✅ Backend Response:", data);

      if (!data.success || !data.gatewayData?.payment_session_id) {
        alert("Payment initialization failed. Please try again.");
        return;
      }

      const sessionId = data.gatewayData.payment_session_id;
      console.log("💡 Session ID:", sessionId);

      // 🔹 Step 2: Trigger Cashfree Checkout
      if (!cashfree || typeof cashfree.checkout !== "function") {
        console.error("❌ Cashfree instance invalid:", cashfree);
        alert("Cashfree SDK issue. Please refresh and try again.");
        return;
      }

      console.log("🟣 Redirecting to Cashfree checkout...");
      cashfree.checkout({
        paymentSessionId: sessionId,
        redirectTarget: "_self",
      });

    } catch (err) {
      console.error("❌ Payment Error:", err);
      alert("Backend connection failed or SDK issue. Please try again.");
    } finally {
      donateBtn.disabled = false;
      donateBtn.textContent = "Donate Now 🐾";
    }
  });

  // 🧾 Local leaderboard (UI only)
  function addDonationToLedger(name, amount) {
    const row = document.createElement("tr");
    const date = new Date().toLocaleDateString("en-IN");
    row.innerHTML = `
      <td>${leaderboardBody.children.length + 1}</td>
      <td>${name}</td>
      <td>₹${amount}</td>
      <td>${date}</td>
      <td><button class="btn-outline small">Receipt</button></td>
    `;
    leaderboardBody.prepend(row);

    totalRaised += amount;
    raisedDisplay.textContent = "₹" + totalRaised.toLocaleString();
    progressFill.style.width = Math.min((totalRaised / 50000) * 100, 100) + "%";

    const coin = document.createElement("div");
    coin.classList.add("coin");
    coin.style.left = Math.random() * 60 + "%";
    coinLayer.appendChild(coin);
    setTimeout(() => coin.remove(), 3000);
  }

  // ✅ EXTRA SECTION (safe additions only)
 
window.addEventListener("load", () => {
  // Parse query params robustly
  const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get("order_id") || urlParams.get("orderId") || urlParams.get("payment_id");
console.log("Query Params:", window.location.search, "Parsed orderId:", orderId);
  if (orderId) {
    const lastDonation = JSON.parse(localStorage.getItem("lastDonation") || "{}");

    if (lastDonation?.name && lastDonation?.amount) {
      console.log("💚 Recording successful donation:", lastDonation);

      addDonationToLedger(lastDonation.name, lastDonation.amount);

      // Generate PDF receipt if jspdf is loaded
      if (window.jspdf) {
        const doc = new jspdf.jsPDF();
        doc.setFontSize(18);
        doc.text("PawCare Donation Receipt", 20, 20);
        doc.setFontSize(12);
        doc.text(`Name: ${lastDonation.name}`, 20, 40);
        doc.text(`Email: ${lastDonation.email}`, 20, 50);
        doc.text(`Amount: ₹${lastDonation.amount}`, 20, 60);
        doc.text(`Date: ${lastDonation.date}`, 20, 70);
        doc.text("Thank you for supporting PawCare 🐾", 20, 90);
        doc.save(`PawCare_Receipt_${lastDonation.name}.pdf`);
      }

      // Redirect after 5s
      setTimeout(() => {
        window.location.href = "../index/index.html";
      }, 5000);
    }
  }
});
});



