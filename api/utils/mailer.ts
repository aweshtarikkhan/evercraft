import dotenv from "dotenv";
dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY || "";
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "info@evercraft.in";
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || "EverCraft Publications";

export interface MailOptions {
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
}

export async function sendEmail({ to, toName = "", subject, htmlContent }: MailOptions): Promise<boolean> {
  if (!BREVO_API_KEY || BREVO_API_KEY === "YOUR_BREVO_API_KEY") {
    console.warn("⚠️ BREVO_API_KEY is not set or using placeholder. Email send simulated (logged below):");
    console.log(`To: ${to}\nSubject: ${subject}\nContent:\n${htmlContent}`);
    return true; // Simulate success
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: {
          name: BREVO_SENDER_NAME,
          email: BREVO_SENDER_EMAIL
        },
        to: [
          {
            email: to,
            name: toName
          }
        ],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    if (response.ok) {
      console.log(`✉️ Email successfully sent to ${to} via Brevo!`);
      return true;
    } else {
      const errorData = await response.json();
      console.error("❌ Brevo API Error response:", errorData);
      return false;
    }
  } catch (error) {
    console.error("❌ Error sending email through Brevo:", error);
    return false;
  }
}
