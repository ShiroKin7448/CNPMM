import nodemailer from "nodemailer";

const mailEnabled = () => process.env.NOTIFICATION_MAIL_ENABLED !== "false";

export const createMailTransporter = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendNotificationMail = async ({ to = [], subject, title, message, targetUrl = "" }) => {
  const recipients = Array.from(new Set((Array.isArray(to) ? to : [to]).filter(Boolean)));
  if (!mailEnabled() || !recipients.length) {
    return { ok: false, skipped: true, recipients };
  }

  const transporter = createMailTransporter();
  if (!transporter) return { ok: false, skipped: true, recipients };

  const actionUrl = targetUrl?.startsWith("http")
    ? targetUrl
    : `${process.env.FRONTEND_URL || "http://localhost:5173"}${targetUrl || ""}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: recipients.join(","),
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:20px;background:#f5f5f5;">
        <div style="background:#000;color:#C0FF6B;padding:22px;border-radius:18px 18px 0 0;">
          <h2 style="margin:0;font-size:22px;">LaptopStore BT08</h2>
          <p style="margin:8px 0 0;color:#D5D5D5;font-size:13px;">Thông báo realtime từ hệ thống</p>
        </div>
        <div style="background:#fff;border:1px solid #D5D5D5;border-top:0;padding:24px;border-radius:0 0 18px 18px;">
          <h3 style="margin:0 0 12px;color:#000;">${title}</h3>
          <p style="margin:0 0 20px;color:#333;line-height:1.55;">${message}</p>
          ${targetUrl ? `<a href="${actionUrl}" style="display:inline-block;background:#000;color:#C0FF6B;text-decoration:none;border-radius:10px;padding:12px 18px;font-weight:700;">Xem chi tiết</a>` : ""}
          <p style="margin-top:24px;color:#777;font-size:12px;">Email này được gửi từ BT08 - 23110193 - Đinh Nguyễn Đức Duy.</p>
        </div>
      </div>
    `,
  });

  return { ok: true, recipients };
};

