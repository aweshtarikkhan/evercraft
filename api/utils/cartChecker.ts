import { query } from "../config/database";
import { sendEmail } from "./mailer";

export async function checkAbandonedCarts() {
  console.log("⏰ Running cart abandonment check...");
  try {
    // Find carts updated > 24 hours ago, containing items, where email hasn't been sent yet
    const abandonedCarts = await query(`
      SELECT c.*, u.email, u.name 
      FROM carts c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.abandoned_email_sent = 0 
        AND c.items != '[]' 
        AND c.items != '' 
        AND c.items IS NOT NULL
        AND c.updated_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);

    for (const cart of abandonedCarts) {
      let itemsList: any[] = [];
      try {
        itemsList = JSON.parse(cart.items);
      } catch (e) {
        console.error("Error parsing cart items JSON:", e);
        continue;
      }

      if (!itemsList || itemsList.length === 0) continue;

      // Format items detail html
      let itemsHtml = `<ul style="list-style: none; padding: 0; line-height: 1.6;">`;
      for (const item of itemsList) {
        itemsHtml += `
          <li style="padding: 10px; margin-bottom: 8px; background: #ffffff; border-radius: 8px; border: 1px solid #fde68a;">
            <strong>📖 ${item.title}</strong><br/>
            <span style="font-size: 13px; color: #5C3A21;">Qty: ${item.qty} · ₹${item.price}</span>
          </li>
        `;
      }
      itemsHtml += `</ul>`;

      const mailSent = await sendEmail({
        to: cart.email,
        toName: cart.name,
        subject: "You left books in your cart! 📚🛒",
        htmlContent: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1.5px solid #D4AF37; border-radius: 16px; background-color: #fdf6e2; color: #2D1B10;">
            <h2 style="color: #aa7c11; text-align: center; font-size: 24px; font-weight: 900; margin-bottom: 20px;">Wait! Don't Leave Your Stories Behind</h2>
            <p>Dear ${cart.name},</p>
            <p>We noticed that you left some wonderful titles in your shopping cart at EverCraft Publications. Books have a way of finding the right readers at the right time, and these are waiting for you!</p>
            
            <h3 style="color: #aa7c11; margin-top: 24px;">Items in your cart:</h3>
            ${itemsHtml}
            
            <div style="text-align: center; margin-top: 32px;">
              <a href="http://localhost:5174/cart" style="background: linear-gradient(135deg, #D4AF37, #aa7c11); color: #150A05; font-weight: 700; padding: 14px 32px; border-radius: 12px; text-decoration: none; display: inline-block; font-size: 15px; box-shadow: 0 4px 15px rgba(212,175,55,0.3);">
                Complete Your Order ⚡
              </a>
            </div>
            
            <p style="margin-top: 32px; font-size: 13px; color: #6b7280;">If you have already completed your purchase, please ignore this email. You can manage your cart settings in your profile dashboard.</p>
            <p style="margin-top: 24px;">Warm regards,</p>
            <p style="font-weight: 800; color: #aa7c11; margin: 0;">The EverCraft Team</p>
          </div>
        `
      });

      if (mailSent) {
        // Mark as sent so they don't receive it again until they edit their cart again
        await query("UPDATE carts SET abandoned_email_sent = 1 WHERE id = ?", [cart.id]);
        console.log(`✉️ Abandoned cart email sent to ${cart.email}`);
      }
    }
  } catch (error) {
    console.error("❌ Error in checkAbandonedCarts background job:", error);
  }
}

export function startCartChecker() {
  // Run checker every 1 hour (3600000 ms)
  setInterval(checkAbandonedCarts, 60 * 60 * 1000);
  console.log("⏰ Background cart checker started (Runs every 1 hour).");
}
