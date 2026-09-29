const nodemailer = require("nodemailer");

/**
 * Configure Transporter
 * Supports SMTP (e.g. Gmail / SendGrid / Custom SMTP).
 * Falls back gracefully in development / test environments if credentials are dummy.
 */
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  } else {
    // Development / fallback stream transporter (prints to console if dev)
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: "unix",
      buffer: true
    });
  }

  return transporter;
}

/**
 * Send OTP Verification Email
 */
async function sendOtpEmail({ email, otp, purpose = "Patient Sign-In & Verification" }) {
  try {
    const from = process.env.SMTP_FROM || `"Niramoy Healthcare" <noreply@niramoy.health>`;
    const subject = "Niramoy Healthcare — Verify Your Email";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f8f7; margin: 0; padding: 0; color: #142422; }
          .container { max-width: 560px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(13,124,110,0.08); border: 1px solid #e2eceb; }
          .header { background: linear-gradient(135deg, #0d7c6e 0%, #064e3b 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.85; }
          .body { padding: 36px 32px; }
          .otp-box { background: #f0fdf4; border: 2px dashed #0d7c6e; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #0d7c6e; font-family: monospace; }
          .warning { font-size: 12px; color: #b91c1c; background: #fef2f2; padding: 12px 16px; border-radius: 8px; margin: 20px 0; line-height: 1.5; }
          .footer { background: #f8fafc; padding: 20px 32px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2eceb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NIRAMOY HEALTHCARE</h1>
            <p>Smart Integrated Healthcare Platform — Rajshahi</p>
          </div>
          <div class="body">
            <h2 style="font-size: 18px; margin-top: 0; color: #142422;">Email Verification Code</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #47615f;">
              Hello,<br/>
              Please use the one-time verification code below to verify your email for <strong>${purpose}</strong>.
            </p>
            <div class="otp-box">
              <div style="font-size: 12px; color: #065f46; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Your One-Time Password</div>
              <div class="otp-code">${otp}</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 8px;">Valid for <strong>5 minutes</strong>. Maximum 5 attempts.</div>
            </div>
            <div class="warning">
              ⚠️ <strong>Security Warning:</strong> Never share this code with anyone. Niramoy Healthcare representatives will never ask for your OTP.
            </div>
            <p style="font-size: 13px; color: #94a3b8; margin-bottom: 0;">
              If you did not request this verification code, please ignore this email or contact support.
            </p>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Niramoy Healthcare • Rajshahi, Bangladesh<br/>
            Need assistance? Reach us at support@niramoy.health
          </div>
        </div>
      </body>
      </html>
    `;

    const transport = getTransporter();
    const info = await transport.sendMail({
      from,
      to: email,
      subject,
      html
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(`[Email Service] Sent OTP to: ${email} (MessageId: ${info.messageId || "simulated"})`);
    }

    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("[Email Service Error]: Failed to send OTP email:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send Appointment Confirmation Email with PDF Attachment
 */
async function sendAppointmentConfirmationEmail({ appointment, payment, pdfBuffer }) {
  try {
    const patientEmail = appointment.patientEmail || appointment.patient_name || appointment.customer_email;
    if (!patientEmail || !patientEmail.includes("@")) {
      return { success: false, reason: "No valid recipient email" };
    }

    const serial = appointment.serialNumber || "NRM-CONFIRMED";
    const apptId = appointment.appointmentId || appointment._id;
    const doctorName = appointment.doctorName || (appointment.doctorId && appointment.doctorId.name) || "Specialist Doctor";
    const specialty = appointment.specialty || (appointment.doctorId && appointment.doctorId.specialty) || "General Medicine";
    const branchName = appointment.branchName || (appointment.branchId && appointment.branchId.name) || "Rajshahi Main Branch";
    const apptDate = new Date(appointment.appointmentDate || appointment.appointment_date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    const apptTime = appointment.time_slot || appointment.startTime || "Scheduled Time";
    const amount = payment ? payment.amount : (appointment.consultationFee || appointment.consultation_fee || 800);

    const from = process.env.SMTP_FROM || `"Niramoy Healthcare" <appointments@niramoy.health>`;
    const subject = `Niramoy Healthcare — Appointment Confirmed | ${serial}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f8f7; margin: 0; padding: 0; color: #142422; }
          .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(13,124,110,0.08); border: 1px solid #e2eceb; }
          .header { background: linear-gradient(135deg, #0d7c6e 0%, #064e3b 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .serial-badge { display: inline-block; background: #ffffff; color: #0d7c6e; font-weight: 900; font-size: 20px; padding: 8px 24px; border-radius: 99px; margin-top: 12px; letter-spacing: 1px; }
          .body { padding: 32px; }
          .detail-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .detail-table td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
          .detail-table td.label { font-weight: 700; color: #64748b; width: 35%; }
          .detail-table td.val { font-weight: 800; color: #0f172a; }
          .alert-box { background: #eff6ff; border-left: 4px solid #2563eb; padding: 14px; border-radius: 6px; font-size: 13px; color: #1e3a8a; line-height: 1.5; margin: 20px 0; }
          .footer { background: #f8fafc; padding: 20px 32px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2eceb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0; font-size:24px;">NIRAMOY HEALTHCARE</h1>
            <p style="margin:4px 0 0 0; opacity:0.9;">Appointment Confirmation Receipt</p>
            <div class="serial-badge">${serial}</div>
          </div>
          <div class="body">
            <h2 style="font-size: 18px; margin-top: 0; color: #065f46;">✓ Appointment Successfully Confirmed</h2>
            <p style="font-size: 14px; color: #47615f; line-height: 1.6;">
              Dear Patient,<br/>
              Your doctor appointment has been successfully scheduled and verified. Your payment via SSLCOMMERZ Sandbox Gateway has been securely confirmed.
            </p>

            <table class="detail-table">
              <tr>
                <td class="label">Doctor</td>
                <td class="val">${doctorName}</td>
              </tr>
              <tr>
                <td class="label">Specialty</td>
                <td class="val">${specialty}</td>
              </tr>
              <tr>
                <td class="label">Branch / Chamber</td>
                <td class="val">${branchName}</td>
              </tr>
              <tr>
                <td class="label">Date</td>
                <td class="val">${apptDate}</td>
              </tr>
              <tr>
                <td class="label">Time Slot</td>
                <td class="val">${apptTime}</td>
              </tr>
              <tr>
                <td class="label">Serial ID</td>
                <td class="val" style="color: #0d7c6e;">${serial}</td>
              </tr>
              <tr>
                <td class="label">Appointment ID</td>
                <td class="val">${apptId}</td>
              </tr>
              <tr>
                <td class="label">Payment Status</td>
                <td class="val" style="color: #16a34a;">PAID (Verified)</td>
              </tr>
              <tr>
                <td class="label">Total Paid</td>
                <td class="val">৳${amount} BDT</td>
              </tr>
            </table>

            <div class="alert-box">
              📌 <strong>Important Instructions:</strong>
              <ul style="margin: 6px 0 0 0; padding-left: 18px;">
                <li>Please arrive at the chamber or be online at least 15 minutes prior to your time slot.</li>
                <li>Keep your Serial ID (${serial}) ready at the reception counter.</li>
                <li>Bring previous medical prescriptions and diagnostic reports if applicable.</li>
              </ul>
            </div>

            <p style="font-size: 13px; color: #64748b;">
              Your official PDF appointment confirmation voucher is attached to this email. You can also view or download it anytime from your Niramoy Patient Dashboard.
            </p>
          </div>
          <div class="footer">
            Payment Verified by Niramoy Healthcare • SSLCOMMERZ Sandbox<br/>
            © ${new Date().getFullYear()} Niramoy Healthcare • Rajshahi, Bangladesh
          </div>
        </div>
      </body>
      </html>
    `;

    const attachments = [];
    if (pdfBuffer) {
      attachments.push({
        filename: `Niramoy-Appointment-${serial}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf"
      });
    }

    const transport = getTransporter();
    const info = await transport.sendMail({
      from,
      to: patientEmail,
      subject,
      html,
      attachments
    });

    console.log(`[Email Service] Confirmation email sent to ${patientEmail} with PDF attachment.`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("[Email Service Error]: Confirmation email failed:", err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendOtpEmail,
  sendAppointmentConfirmationEmail
};
