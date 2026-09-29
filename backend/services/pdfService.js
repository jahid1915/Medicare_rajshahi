const PDFDocument = require("pdfkit");

/**
 * Generate Minimized, Optimized Single-Page Appointment Confirmation Voucher PDF Buffer
 * @param {Object} dataOrAppt
 * @param {Object} maybePayment
 * @returns {Promise<Buffer>}
 */
function generateAppointmentPdf(dataOrAppt, maybePayment) {
  let appointment, doctor, branch, patient, payment;
  if (dataOrAppt && dataOrAppt.appointment) {
    ({ appointment, doctor, branch, patient, payment } = dataOrAppt);
  } else {
    appointment = dataOrAppt;
    payment = maybePayment;
    doctor = appointment?.doctorId || appointment?.doctor_id;
    branch = appointment?.branchId || appointment?.branch_id;
    patient = appointment?.patientId;
  }

  return new Promise((resolve, reject) => {
    try {
      const serialNum = appointment?.serialNumber || appointment?.appointmentId || "NRM-CONFIRMED";
      
      // Strict single-page A4 geometry: width=595.28, height=841.89
      // Set margin: 0 to eliminate PDFKit automatic page-break triggers
      const doc = new PDFDocument({
        size: "A4",
        margin: 0,
        autoFirstPage: true,
        info: {
          Title: `Niramoy Appointment Confirmation - ${serialNum}`,
          Author: "Niramoy Healthcare",
          Subject: "Doctor Appointment Voucher"
        }
      });

      const buffers = [];
      doc.on("data", chunk => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", err => reject(err));

      // Brand Palette
      const primaryColor = "#0d7c6e";
      const secondaryColor = "#064e3b";
      const textColor = "#0f172a";
      const mutedColor = "#64748b";
      const borderColor = "#cbd5e1";

      const pageWidth = 595.28;
      const contentLeft = 36;
      const contentWidth = pageWidth - (contentLeft * 2); // 523.28

      // ─── 1. Modern Header Bar (Y: 0 -> 76) ───
      doc.rect(0, 0, pageWidth, 76).fill(primaryColor);
      doc.rect(0, 76, pageWidth, 3).fill("#14b8a6"); // Accent teal line

      doc.fillColor("#ffffff")
        .fontSize(19)
        .font("Helvetica-Bold")
        .text("NIRAMOY HEALTHCARE", contentLeft, 22);

      doc.fontSize(8.5)
        .font("Helvetica")
        .fillColor("#ccfbf1")
        .text("Smart Integrated Healthcare System • Rajshahi, Bangladesh", contentLeft, 47);

      doc.fontSize(11)
        .font("Helvetica-Bold")
        .fillColor("#ffffff")
        .text("DIGITAL APPOINTMENT VOUCHER", 340, 24, { align: "right", width: contentWidth - 304 });

      const issueDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
      doc.fontSize(8)
        .font("Helvetica")
        .fillColor("#99f6e4")
        .text(`Issued: ${issueDate} • Verified Entry`, 340, 46, { align: "right", width: contentWidth - 304 });

      // ─── 2. Serial & Status Banner (Y: 92 -> 146) ───
      const serialY = 92;
      const serialHeight = 54;
      doc.roundedRect(contentLeft, serialY, contentWidth, serialHeight, 6)
        .fillAndStroke("#f0fdf4", "#86efac");

      doc.fillColor("#15803d")
        .fontSize(8)
        .font("Helvetica-Bold")
        .text("OFFICIAL APPOINTMENT SERIAL", contentLeft + 16, serialY + 11);

      const serial = appointment.serialNumber || serialNum;
      doc.fillColor(primaryColor)
        .fontSize(20)
        .font("Helvetica-Bold")
        .text(serial, contentLeft + 16, serialY + 23);

      // Status Pill on Right
      const pillW = 185;
      const pillH = 26;
      const pillX = contentLeft + contentWidth - pillW - 14;
      const pillY = serialY + 14;
      doc.roundedRect(pillX, pillY, pillW, pillH, 13).fill("#dcfce7");

      doc.fillColor("#166534")
        .fontSize(9.5)
        .font("Helvetica-Bold")
        .text("✓ STATUS: CONFIRMED • PAID", pillX, pillY + 7, { align: "center", width: pillW });

      // ─── 3. Two-Column Grid: Patient (Left) & Doctor (Right) (Y: 158 -> 310) ───
      const gridY = 158;
      const gridHeight = 150;
      doc.roundedRect(contentLeft, gridY, contentWidth, gridHeight, 6)
        .fillAndStroke("#ffffff", "#e2e8f0");

      // Vertical Divider
      const colDividerX = contentLeft + (contentWidth / 2);
      doc.strokeColor("#e2e8f0").lineWidth(1)
        .moveTo(colDividerX, gridY + 10)
        .lineTo(colDividerX, gridY + gridHeight - 10)
        .stroke();

      // Column 1: Patient Information
      const col1Left = contentLeft + 14;
      doc.fillColor(primaryColor)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("PATIENT INFORMATION", col1Left, gridY + 12);

      doc.strokeColor("#ccfbf1").lineWidth(1)
        .moveTo(col1Left, gridY + 26)
        .lineTo(colDividerX - 14, gridY + 26)
        .stroke();

      const patientName = patient?.name || appointment.patientName || appointment.patient_name || "Valued Patient";
      const patientPhone = patient?.phone || appointment.patientPhone || appointment.patient_phone || "N/A";
      const patientEmail = patient?.email || appointment.patientEmail || "N/A";
      const patientGender = appointment.gender || patient?.gender || "N/A";
      const patientId = patient?._id ? patient._id.toString().slice(-8).toUpperCase() : "NRM-PT";

      function renderField(label, val, x, y, valWidth = 145) {
        doc.fillColor(mutedColor).fontSize(8).font("Helvetica").text(label, x, y);
        doc.fillColor(textColor).fontSize(8.5).font("Helvetica-Bold").text(val, x + 82, y, { width: valWidth, ellipsis: true });
      }

      let pY = gridY + 34;
      renderField("Full Name:", patientName, col1Left, pY); pY += 18;
      renderField("Patient ID:", patientId, col1Left, pY); pY += 18;
      renderField("Phone Number:", patientPhone, col1Left, pY); pY += 18;
      renderField("Email Address:", patientEmail, col1Left, pY); pY += 18;
      renderField("Gender / Age:", `${patientGender} ${appointment.age ? `• ${appointment.age} yrs` : ""}`, col1Left, pY); pY += 18;
      renderField("Emergency:", appointment.emergencyContact || patientPhone, col1Left, pY);

      // Column 2: Doctor & Chamber Information
      const col2Left = colDividerX + 14;
      doc.fillColor(primaryColor)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("DOCTOR & CHAMBER DETAILS", col2Left, gridY + 12);

      doc.strokeColor("#ccfbf1").lineWidth(1)
        .moveTo(col2Left, gridY + 26)
        .lineTo(contentLeft + contentWidth - 14, gridY + 26)
        .stroke();

      const docName = doctor?.name || appointment.doctorName || "Specialist Physician";
      const docSpecialty = doctor?.specialty || appointment.specialty || "Specialist Doctor";
      const docQualifications = doctor?.qualifications || doctor?.degrees || "MBBS, Specialist";
      const branchName = branch?.name || appointment.branchName || "Rajshahi Main Chamber";
      const branchAddress = branch?.address || appointment.chamberAddress || "Laxmipur, Rajshahi";
      const branchPhone = branch?.phone || "+8801700000000";

      let dY = gridY + 34;
      renderField("Doctor Name:", docName, col2Left, dY, 155); dY += 18;
      renderField("Specialty:", docSpecialty, col2Left, dY, 155); dY += 18;
      renderField("Degree:", docQualifications, col2Left, dY, 155); dY += 18;
      renderField("Branch/Center:", branchName, col2Left, dY, 155); dY += 18;
      renderField("Location:", branchAddress, col2Left, dY, 155); dY += 18;
      renderField("Branch Contact:", branchPhone, col2Left, dY, 155);

      // ─── 4. Schedule & Payment Details Table (Y: 322 -> 382) ───
      const schedY = 322;
      doc.fillColor(primaryColor)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("SCHEDULE & PAYMENT SPECIFICATION", contentLeft, schedY);

      // Table Header Row
      const thY = schedY + 16;
      const thH = 20;
      doc.roundedRect(contentLeft, thY, contentWidth, thH, 4).fill("#f8fafc");

      doc.fillColor(secondaryColor).fontSize(8).font("Helvetica-Bold");
      doc.text("Schedule Date", contentLeft + 10, thY + 5);
      doc.text("Slot Time", contentLeft + 115, thY + 5);
      doc.text("Consultation Type", contentLeft + 205, thY + 5);
      doc.text("Transaction ID", contentLeft + 330, thY + 5);
      doc.text("Amount (BDT)", contentLeft + contentWidth - 85, thY + 5, { align: "right", width: 75 });

      // Table Content Row
      const trY = thY + 22;
      const trH = 22;
      doc.roundedRect(contentLeft, trY, contentWidth, trH, 4).fillAndStroke("#ffffff", "#e2e8f0");

      const apptDate = new Date(appointment.appointmentDate || appointment.appointment_date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
      const timeSlot = appointment.time_slot || appointment.startTime || "Scheduled";
      const apptType = appointment.appointmentType || "Online Consultation";
      const txn = payment?.transaction_id || appointment.sslTransactionId || "SSL-CONFIRMED";
      const fee = payment ? payment.amount : (appointment.consultationFee || appointment.consultation_fee || 800);

      doc.fillColor(textColor).fontSize(8.5).font("Helvetica");
      doc.text(apptDate, contentLeft + 10, trY + 6);
      doc.text(timeSlot, contentLeft + 115, trY + 6);
      doc.text(apptType, contentLeft + 205, trY + 6);
      doc.fontSize(7.5).font("Courier-Bold").text(txn.slice(0, 22), contentLeft + 330, trY + 7);
      
      // Professional BDT formatting without garbled unicode symbols
      doc.fontSize(9.5).font("Helvetica-Bold").fillColor(primaryColor)
        .text(`BDT ${fee}`, contentLeft + contentWidth - 85, trY + 6, { align: "right", width: 75 });

      // ─── 5. Important Patient Guidelines Box (Y: 395 -> 530) ───
      const guideY = 395;
      const guideHeight = 135;
      doc.roundedRect(contentLeft, guideY, contentWidth, guideHeight, 6)
        .fillAndStroke("#f8fafc", "#e2e8f0");

      doc.fillColor(secondaryColor)
        .fontSize(9)
        .font("Helvetica-Bold")
        .text("IMPORTANT PATIENT GUIDELINES & PROTOCOLS", contentLeft + 14, guideY + 12);

      const guidelines = [
        "1. Reporting Time: Please arrive at the branch chamber or be online at least 15 minutes before your time slot.",
        "2. Verification: Present this digital PDF voucher or state your Serial ID at the reception counter for priority entry.",
        "3. Medical History: Bring all previous prescriptions, diagnostic lab reports, and ongoing medications.",
        "4. Rescheduling & Cancellation: Permitted up to 4 hours before the appointment via your Niramoy Patient Dashboard.",
        "5. Telemedicine Consultation: If online consultation is booked, click 'Join Consultation' from your dashboard."
      ];

      let gY = guideY + 30;
      doc.fontSize(8).font("Helvetica").fillColor("#334155");
      guidelines.forEach(g => {
        doc.text(g, contentLeft + 14, gY, { width: contentWidth - 28 });
        gY += 18;
      });

      // ─── 6. Security Stamp Banner (Y: 542 -> 582) ───
      const stampY = 542;
      const stampH = 40;
      doc.roundedRect(contentLeft, stampY, contentWidth, stampH, 6)
        .fillAndStroke("#ecfdf5", "#a7f3d0");

      doc.fillColor("#047857")
        .fontSize(8.5)
        .font("Helvetica-Bold")
        .text("✓ Verified by Niramoy Healthcare • SSLCOMMERZ Sandbox Gateway", contentLeft, stampY + 9, { align: "center", width: contentWidth });

      doc.fillColor("#065f46")
        .fontSize(7.5)
        .font("Helvetica")
        .text("This digital voucher is system-verified and requires no physical signature.", contentLeft, stampY + 23, { align: "center", width: contentWidth });

      // ─── 7. Compact Footer Bar (Y: 808 -> 841.89) ───
      // Placed strictly within single-page height (841.89)
      const footerY = 808;
      const footerH = 33.89;
      doc.rect(0, footerY, pageWidth, footerH).fill(secondaryColor);

      doc.fillColor("#ffffff")
        .fontSize(8)
        .font("Helvetica")
        .text("Niramoy Healthcare • Rajshahi, Bangladesh • Emergency Hotline: 16263 • Email: support@niramoy.health", 0, footerY + 11, { align: "center", width: pageWidth });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generateAppointmentPdf
};
