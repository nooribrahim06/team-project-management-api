import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { EmailSendError } from "../middlewares/errorHandling.js";

function createVerificationUrl(token) {
  const frontendUrl = env.FRONTEND_URL.replace(/\/$/, "");
  return `${frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;
}

function createVerificationEmail(name, verificationUrl) {
  const safeName = String(name)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

  return `
    <h1>Verify your email</h1>
    <p>Hello ${safeName},</p>
    <p>Confirm your Team Project Management account using the link below.</p>
    <p><a href="${verificationUrl}">Verify email</a></p>
    <p>This link expires in 24 hours.</p>
  `;
}

export async function sendVerificationEmail({ email, name, rawToken }) {
  const verificationUrl = createVerificationUrl(rawToken);

  if (!env.EMAIL_USER || !env.EMAIL_APP_PASSWORD) {
    if (env.NODE_ENV === "production") {
      throw new EmailSendError();
    }

    console.log(`Development verification link for ${email}: ${verificationUrl}`);
    return { verificationUrl };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Team Project Management" <${env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your email",
      text: `Verify your email: ${verificationUrl}`,
      html: createVerificationEmail(name, verificationUrl),
    });
  } catch {
    throw new EmailSendError();
  }

  return { verificationUrl: null };
}
