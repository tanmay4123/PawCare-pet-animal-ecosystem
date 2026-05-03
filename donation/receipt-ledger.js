// receipt-ledger.js
// Non-invasive Ledger & Instant Receipt (uses localStorage only)

(function () {
  // Add donation to local ledger (called when you want to record a successful donation)
  window.recordDonationLocally = function (donation) {
    try {
      const ledger = JSON.parse(localStorage.getItem("pawcare_ledger") || "[]");
      ledger.unshift(donation);
      localStorage.setItem("pawcare_ledger", JSON.stringify(ledger));
    } catch (e) {
      console.error("Ledger save failed", e);
    }
  };

  // Populate leaderboard UI from localStorage
  function populateLedgerUI() {
    const tbody = document.getElementById("leaderboard-body");
    if (!tbody) return;
    tbody.innerHTML = "";
    const ledger = JSON.parse(localStorage.getItem("pawcare_ledger") || "[]");
    let total = 0;
    ledger.forEach((entry, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${entry.name}</td>
        <td>₹${entry.amount}</td>
        <td>${entry.date}</td>
        <td><button class="btn-outline small" onclick="generateReceipt('${entry.name}', ${entry.amount}, '${entry.date}')">Receipt</button></td>
      `;
      tbody.appendChild(tr);
      total += Number(entry.amount || 0);
    });
    const raisedDisplay = document.getElementById("raised-display");
    const progressFill = document.getElementById("progress-fill");
    if (raisedDisplay) raisedDisplay.textContent = "₹" + total.toLocaleString();
    if (progressFill) progressFill.style.width = Math.min((total / 50000) * 100, 100) + "%";
  }

  // Instant PDF receipt generator (uses jspdf which you already include)
  window.generateReceipt = function (name, amount, date) {
    if (!window.jspdf) {
      alert("Receipt generator unavailable. Please refresh.");
      return;
    }
    const doc = new jspdf.jsPDF();
    doc.setFontSize(18);
    doc.text("PawCare Donation Receipt", 20, 20);
    doc.setFontSize(12);
    doc.text(`Donor: ${name}`, 20, 40);
    doc.text(`Amount: ₹${amount}`, 20, 50);
    doc.text(`Date: ${date}`, 20, 60);
    doc.text("Thank you for supporting PawCare 🐾", 20, 80);
    doc.save(`PawCare_Receipt_${name}_${date}.pdf`);
  };

  // ✅ Auto record lastDonation if exists (for success page)
  document.addEventListener("DOMContentLoaded", () => {
    populateLedgerUI(); // show existing ledger first

    const lastDonation = JSON.parse(localStorage.getItem("lastDonation") || "{}");
    if (lastDonation?.name && lastDonation?.amount) {
      console.log("💚 Recording donation on success page:", lastDonation);
      recordDonationLocally(lastDonation);
      populateLedgerUI(); // refresh UI

      // Auto-generate PDF receipt
      if (window.jspdf) {
        generateReceipt(lastDonation.name, lastDonation.amount, lastDonation.date);
      }

      // Remove to prevent duplicates
      localStorage.removeItem("lastDonation");

      // Optional redirect after 5s
      setTimeout(() => {
        window.location.href = "../index/index.html";
      }, 5000);
    }
  });
})();
