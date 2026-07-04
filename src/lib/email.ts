import { Resend } from "resend";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error(
        "RESEND_API_KEY environment variable is not set. " +
        "To send emails, add RESEND_API_KEY=re_... to your .env.local file."
      );
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  try {
    const emailClient = getResend();
    const { data, error } = await emailClient.emails.send({
      from: process.env.EMAIL_FROM || "PEA FITS <noreply@peafits.com.np>",
      to: [to],
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    });

    if (error) {
      throw new Error(`Email send failed: ${error.message}`);
    }

    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    console.error("Email send error:", message);
    return { success: false as const, error: message };
  }
}

export async function sendEmailWithRetry(
  params: SendEmailParams,
  retries = 3
) {
  for (let i = 0; i < retries; i++) {
    const result = await sendEmail(params);
    if (result.success) return result;
    if (i < retries - 1) {
      await new Promise((r) => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
  return { success: false as const, error: "All retry attempts failed" };
}

export function passwordResetEmailHtml(resetUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #0a0a0a; padding: 40px 20px; text-align: center;">
    <h1 style="color: #c4ff0e; margin: 20px 0; font-family: Georgia, serif; font-size: 24px;">
      PEA FITS
    </h1>
    <h2 style="color: #ffffff; margin: 20px 0; font-size: 20px;">
      Reset Your Password
    </h2>
    <p style="color: #e0e0e0; margin: 20px 0; line-height: 1.6; font-size: 14px;">
      You requested a password reset. Click the button below to set a new password.
      This link expires in 1 hour.
    </p>
    <a href="${resetUrl}"
       style="display: inline-block; background: #c4ff0e; color: #0a0a0a;
              padding: 14px 36px; text-decoration: none; border-radius: 4px;
              font-weight: bold; margin: 20px 0; font-size: 14px;">
      Reset Password
    </a>
    <p style="color: #888; font-size: 12px; margin-top: 30px;">
      If you didn't request this, please ignore this email.
    </p>
  </div>
</body>
</html>`;
}

export function orderConfirmationEmailHtml(params: {
  orderNumber: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  orderUrl: string;
}): string {
  const itemsHtml = params.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #333; color: #e0e0e0; font-size: 13px;">${item.name}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #333; color: #888; text-align: center; font-size: 13px;">${item.quantity}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #333; color: #e0e0e0; text-align: right; font-size: 13px;">$${item.price.toFixed(2)}</td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #0a0a0a; padding: 40px 20px;">
    <h1 style="color: #c4ff0e; text-align: center; font-family: Georgia, serif; font-size: 24px; margin-bottom: 30px;">
      PEA FITS
    </h1>
    <h2 style="color: #ffffff; font-size: 20px;">Order Confirmed</h2>
    <p style="color: #e0e0e0; font-size: 14px; line-height: 1.6;">
      Hi ${params.customerName},<br><br>
      Thank you for your order! Your order <strong style="color: #c4ff0e;">#${params.orderNumber}</strong> has been confirmed.
    </p>
    <table style="width: 100%; margin: 20px 0;">
      <thead>
        <tr>
          <th style="text-align: left; color: #888; font-size: 12px; padding: 8px 0; border-bottom: 1px solid #444;">Item</th>
          <th style="text-align: center; color: #888; font-size: 12px; padding: 8px 0; border-bottom: 1px solid #444;">Qty</th>
          <th style="text-align: right; color: #888; font-size: 12px; padding: 8px 0; border-bottom: 1px solid #444;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="text-align: right; color: #888; font-size: 13px; padding: 12px 0;">Total:</td>
          <td style="text-align: right; color: #c4ff0e; font-size: 16px; font-weight: bold; padding: 12px 0;">$${params.total.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
    <a href="${params.orderUrl}"
       style="display: inline-block; background: #c4ff0e; color: #0a0a0a;
              padding: 14px 36px; text-decoration: none; border-radius: 4px;
              font-weight: bold; margin: 20px 0; font-size: 14px;">
      View Order
    </a>
  </div>
</body>
</html>`;
}

export function welcomeEmailHtml(name: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #0a0a0a; padding: 40px 20px; text-align: center;">
    <h1 style="color: #c4ff0e; margin: 20px 0; font-family: Georgia, serif; font-size: 24px;">
      Welcome to PEA FITS
    </h1>
    <p style="color: #e0e0e0; margin: 20px 0; line-height: 1.6; font-size: 14px;">
      Hi ${name},<br><br>
      Welcome to PEA FITS — your destination for curated women's fashion.<br><br>
      Browse our latest collections and discover pieces that speak to you.
    </p>
    <a href="${process.env.NEXT_PUBLIC_URL || "https://peafits.com.np"}/collections"
       style="display: inline-block; background: #c4ff0e; color: #0a0a0a;
              padding: 14px 36px; text-decoration: none; border-radius: 4px;
              font-weight: bold; margin: 20px 0; font-size: 14px;">
      Shop Now
    </a>
  </div>
</body>
</html>`;
}

/**
 * Sends a password reset email to the user.
 * Called by the reset-password API route.
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string | null,
  resetUrl: string
) {
  return sendEmail({
    to: email,
    subject: "Reset Your PEA FITS Password",
    html: passwordResetEmailHtml(resetUrl),
  });
}
