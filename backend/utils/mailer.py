import logging
import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from config import settings

logger = logging.getLogger(__name__)


def _build_otp_html(otp_code: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="520" cellpadding="0" cellspacing="0"
              style="background:linear-gradient(135deg,#1e293b,#0f172a);border:1px solid #334155;
                     border-radius:16px;padding:40px;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
              <!-- Logo / Brand -->
              <tr>
                <td align="center" style="padding-bottom:28px;">
                  <span style="font-size:28px;font-weight:800;
                    background:linear-gradient(90deg,#6366f1,#8b5cf6);
                    -webkit-background-clip:text;color:#6366f1;letter-spacing:-0.5px;">
                    ◈ Kollab
                  </span>
                </td>
              </tr>
              <!-- Title -->
              <tr>
                <td align="center" style="padding-bottom:8px;">
                  <h1 style="margin:0;font-size:22px;font-weight:700;color:#f1f5f9;">
                    Verify your email address
                  </h1>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding-bottom:32px;">
                  <p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.6;">
                    Use the code below to complete your registration.<br>
                    This code expires in <strong style="color:#c4b5fd;">10 minutes</strong>.
                  </p>
                </td>
              </tr>
              <!-- OTP Box -->
              <tr>
                <td align="center" style="padding-bottom:32px;">
                  <div style="display:inline-block;background:#1e293b;border:2px solid #6366f1;
                    border-radius:12px;padding:20px 48px;">
                    <span style="font-size:42px;font-weight:800;letter-spacing:12px;
                      color:#a5b4fc;font-family:'Courier New',monospace;">
                      {otp_code}
                    </span>
                  </div>
                </td>
              </tr>
              <!-- Warning -->
              <tr>
                <td align="center" style="padding-bottom:28px;">
                  <p style="margin:0;font-size:12px;color:#64748b;line-height:1.6;">
                    If you didn't request this, you can safely ignore this email.<br>
                    Never share this code with anyone.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td align="center"
                  style="border-top:1px solid #1e293b;padding-top:20px;">
                  <p style="margin:0;font-size:11px;color:#475569;">
                    © 2025 Kollab Platform · All rights reserved
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """


async def send_otp_email(to_email: str, otp_code: str) -> bool:
    logger.info(f"[EMAIL] Dispatching OTP to {to_email}")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"{otp_code} — Your Kollab Verification Code"
    msg["From"] = f"Kollab Platform <{settings.MAIL_USERNAME}>"
    msg["To"] = to_email

    plain = f"Your Kollab verification code is: {otp_code}\nThis code expires in 10 minutes."
    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(_build_otp_html(otp_code), "html"))

    try:
        await aiosmtplib.send(
            msg,
            hostname=settings.MAIL_SERVER,
            port=settings.MAIL_PORT,
            username=settings.MAIL_USERNAME,
            password=settings.MAIL_PASSWORD,
            use_tls=False,
            start_tls=True,
        )
        logger.info(f"[EMAIL] OTP sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"[EMAIL] Failed to send OTP to {to_email}: {e}")
        # Fallback: print to console so dev flow isn't broken
        print(f"\n{'='*55}")
        print(f"📧 FALLBACK — OTP for {to_email}: {otp_code}")
        print(f"{'='*55}\n")
        return False


async def send_notification_email(to_email: str, title: str, message: str) -> bool:
    logger.info(f"[EMAIL] Notification to {to_email}: {title}")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Kollab — {title}"
    msg["From"] = f"Kollab Platform <{settings.MAIL_USERNAME}>"
    msg["To"] = to_email

    plain = f"{title}\n\n{message}"
    msg.attach(MIMEText(plain, "plain"))

    try:
        await aiosmtplib.send(
            msg,
            hostname=settings.MAIL_SERVER,
            port=settings.MAIL_PORT,
            username=settings.MAIL_USERNAME,
            password=settings.MAIL_PASSWORD,
            use_tls=False,
            start_tls=True,
        )
        return True
    except Exception as e:
        logger.error(f"[EMAIL] Failed to send notification to {to_email}: {e}")
        return False
