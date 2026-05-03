// receipt-ledger.js
// Handles local donation ledger, leaderboard UI, PDF receipts

(function () {

  // ─── Save donation to localStorage ledger ───
  window.recordDonationLocally = function (donation) {
    try {
      const ledger = JSON.parse(localStorage.getItem("pawcare_ledger") || "[]");
      ledger.unshift(donation);
      localStorage.setItem("pawcare_ledger", JSON.stringify(ledger));
    } catch (e) {
      console.error("Ledger save failed", e);
    }
  };

  // ─── Render leaderboard table from localStorage ───
  function populateLedgerUI() {
    const tbody = document.getElementById("leaderboard-body");
    if (!tbody) return;

    const ledger = JSON.parse(localStorage.getItem("pawcare_ledger") || "[]");
    tbody.innerHTML = "";
    let total = 0;

    ledger.forEach((entry, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${entry.name}</td>
        <td>₹${entry.amount}</td>
        <td>${entry.date}</td>
        <td>
          <button class="btn-outline small"
            onclick="generateReceipt('${entry.name}', ${entry.amount}, '${entry.date}')">
            Receipt
          </button>
        </td>
      `;
      tbody.appendChild(tr);
      total += Number(entry.amount || 0);
    });

    const raisedDisplay = document.getElementById("raised-display");
    const progressFill = document.getElementById("progress-fill");
    if (raisedDisplay) raisedDisplay.textContent = "₹" + total.toLocaleString();
    if (progressFill) progressFill.style.width = Math.min((total / 50000) * 100, 100) + "%";
  }

  // ─── Generate PDF Receipt ───
  window.generateReceipt = function (name, amount, date) {
    if (!window.jspdf) {
      alert("Receipt generator unavailable. Please refresh.");
      return;
    }
    const doc = new jspdf.jsPDF();
    doc.setFontSize(18);
    doc.text("PawCare Donation Receipt", 20, 20);
    doc.setFontSize(12);
    doc.text(`Donor : ${name}`, 20, 40);
    doc.text(`Amount: ₹${amount}`, 20, 52);
    doc.text(`Date  : ${date}`, 20, 64);
    doc.text("Thank you for supporting PawCare 🐾", 20, 84);
    doc.save(`PawCare_Receipt_${name}_${date}.pdf`);
  };

  // ─── On page load: show ledger & handle post-donation recording ───
  document.addEventListener("DOMContentLoaded", () => {
    populateLedgerUI();

    const lastDonation = JSON.parse(localStorage.getItem("lastDonation") || "{}");

    if (lastDonation?.name && lastDonation?.amount) {
      console.log("💚 Recording donation:", lastDonation);
      recordDonationLocally(lastDonation);
      populateLedgerUI();

      // Auto-generate PDF
      if (window.jspdf) {
        generateReceipt(lastDonation.name, lastDonation.amount, lastDonation.date);
      }

      // Clear to prevent duplicates
      localStorage.removeItem("lastDonation");

      // Redirect to homepage after 5s
      setTimeout(() => {
        window.location.href = "/donation/donation.html";
      }, 5000);
    }
  });

})();
