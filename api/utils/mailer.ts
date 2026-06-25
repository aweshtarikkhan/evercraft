import dotenv from "dotenv";
import { Resend } from "resend";
dotenv.config();

const RESEND_API_KEY = process.env.RESEND_API_KEY || "re_EpUJKf6t_AXAJFTTxqBAV669uj6QPS2Cj";
const SENDER_EMAIL = process.env.SENDER_EMAIL || "info@evercraft.co.in";
const SENDER_NAME = process.env.SENDER_NAME || "EverCraft Publications";

const resend = new Resend(RESEND_API_KEY);

export interface MailOptions {
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
}

export async function sendEmail({ to, toName = "", subject, htmlContent }: MailOptions): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: [to],
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error("❌ Resend API Error:", error);
      return false;
    }

    console.log(`✉️ Email successfully sent to ${to} via Resend! ID:`, data?.id);
    return true;
  } catch (error) {
    console.error("❌ Error sending email through Resend:", error);
    return false;
  }
}

export function getOrderTrackingHTML(status: string) {
  // Map statuses to step index (1 to 4)
  const steps = ["Order Placed", "Shipped", "Out for Delivery", "Delivered"];
  let activeStep = steps.indexOf(status) + 1;
  if (activeStep === 0) activeStep = 1; // Default to Order Placed if unknown
  
  if (status === "Cancelled") {
    return `<div style="padding: 16px; background: #fef2f2; border: 1px solid #f87171; border-radius: 8px; color: #b91c1c; font-weight: bold; text-align: center; margin: 20px 0;">Order Cancelled</div>`;
  }

  const activeColor = "#16a34a"; // green
  const inactiveColor = "#e5e7eb"; // gray

  let html = `
  <div style="margin: 30px 0; font-family: sans-serif;">
    <table style="width: 100%; border-collapse: collapse; text-align: center;">
      <tr>
  `;

  steps.forEach((stepName, index) => {
    const stepNumber = index + 1;
    const isActive = activeStep >= stepNumber;
    const isPast = activeStep > stepNumber;
    
    // Bar logic:
    const leftBarColor = activeStep >= stepNumber ? activeColor : inactiveColor;
    const rightBarColor = activeStep > stepNumber ? activeColor : inactiveColor;
    
    let leftBar = stepNumber === 1 ? `<div style="width: 50%; float: right; height: 4px; background: ${rightBarColor};"></div>` : `<div style="width: 50%; float: left; height: 4px; background: ${leftBarColor};"></div>`;
    let rightBar = stepNumber === 4 ? `<div style="width: 50%; float: left; height: 4px; background: ${leftBarColor};"></div>` : (stepNumber !== 1 ? `<div style="width: 50%; float: right; height: 4px; background: ${rightBarColor};"></div>` : '');

    html += `
        <td style="width: 25%; position: relative; vertical-align: top;">
          <div style="height: 4px; width: 100%; position: absolute; top: 13px; z-index: 1;">
            ${leftBar}
            ${rightBar}
          </div>
          <div style="width: 30px; height: 30px; border-radius: 50%; background: ${isActive ? activeColor : inactiveColor}; color: ${isActive ? 'white' : '#9ca3af'}; line-height: 30px; margin: 0 auto; position: relative; z-index: 2; font-weight: bold; font-size: 14px;">
            ${isPast || (isActive && stepNumber === 4) ? '✓' : stepNumber}
          </div>
          <div style="margin-top: 10px; font-size: 12px; font-weight: bold; color: ${isActive ? activeColor : '#9ca3af'}; line-height: 1.2;">
            ${stepName}
          </div>
        </td>
    `;
  });

  html += `
      </tr>
    </table>
  </div>
  `;
  
  return html;
}
