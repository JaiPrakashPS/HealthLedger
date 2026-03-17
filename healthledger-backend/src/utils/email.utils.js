const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Email error:', error.message);
    throw error;
  }
};

// Email templates
const templates = {
  accessLinkShared: ({ doctorName, patientName, link, expiresIn }) => ({
    subject: `${patientName} shared medical records with you — HealthVault`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f5f7fa;border-radius:12px">
        <div style="background:#0A6EBD;padding:20px 24px;border-radius:8px;margin-bottom:20px">
          <h1 style="color:#fff;margin:0;font-size:20px">HealthVault</h1>
          <p style="color:rgba(255,255,255,.7);margin:4px 0 0;font-size:13px">Medical Records Shared</p>
        </div>
        <div style="background:#fff;padding:24px;border-radius:8px;border:1px solid #e4eaf0">
          <p style="font-size:15px;color:#0d1b2a">Dear <strong>${doctorName}</strong>,</p>
          <p style="color:#5a6a7e;line-height:1.7"><strong>${patientName}</strong> has securely shared their medical records with you via HealthVault.</p>
          <div style="text-align:center;margin:28px 0">
            <a href="${link}" style="background:#0A6EBD;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">
              View Medical Records →
            </a>
          </div>
          <p style="font-size:12px;color:#9aaabb;text-align:center">This link expires in ${expiresIn} days. Do not share this link with others.</p>
        </div>
      </div>
    `,
  }),

  appointmentConfirmed: ({ patientName, doctorName, date, time, type }) => ({
    subject: `Appointment confirmed — ${date} at ${time}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f5f7fa;border-radius:12px">
        <div style="background:#0A6EBD;padding:20px 24px;border-radius:8px;margin-bottom:20px">
          <h1 style="color:#fff;margin:0;font-size:20px">HealthVault</h1>
        </div>
        <div style="background:#fff;padding:24px;border-radius:8px;border:1px solid #e4eaf0">
          <p style="font-size:15px;color:#0d1b2a">Dear <strong>${patientName}</strong>,</p>
          <p style="color:#5a6a7e">Your appointment has been confirmed.</p>
          <div style="background:#EBF5FF;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #0A6EBD">
            <p style="margin:0;font-size:14px;color:#0d1b2a"><strong>Doctor:</strong> ${doctorName}</p>
            <p style="margin:6px 0 0;font-size:14px;color:#0d1b2a"><strong>Date:</strong> ${date}</p>
            <p style="margin:6px 0 0;font-size:14px;color:#0d1b2a"><strong>Time:</strong> ${time}</p>
            <p style="margin:6px 0 0;font-size:14px;color:#0d1b2a"><strong>Type:</strong> ${type}</p>
          </div>
        </div>
      </div>
    `,
  }),

  recordAccessNotification: ({ patientName, doctorName, recordName, accessTime }) => ({
    subject: `Your record was accessed — HealthVault`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f5f7fa;border-radius:12px">
        <div style="background:#0A6EBD;padding:20px 24px;border-radius:8px;margin-bottom:20px">
          <h1 style="color:#fff;margin:0;font-size:20px">HealthVault</h1>
        </div>
        <div style="background:#fff;padding:24px;border-radius:8px;border:1px solid #e4eaf0">
          <p style="font-size:15px;color:#0d1b2a">Dear <strong>${patientName}</strong>,</p>
          <p style="color:#5a6a7e"><strong>${doctorName}</strong> accessed your record <strong>${recordName}</strong> on ${accessTime}.</p>
          <p style="font-size:12px;color:#9aaabb">If you did not authorise this, revoke the access link immediately from your HealthVault dashboard.</p>
        </div>
      </div>
    `,
  }),
};

module.exports = { sendEmail, templates };