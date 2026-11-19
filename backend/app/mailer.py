"""Outbound email. Uses SMTP when configured; otherwise logs the message (development only)."""
import logging
import smtplib
from email.message import EmailMessage

from .config import get_settings

log = logging.getLogger("mindcare.mail")


def send_email(to: str, subject: str, body: str) -> None:
    s = get_settings()
    if not s.smtp_host:
        if s.env == "production":
            log.error("SMTP is not configured; email to a user was not sent")
            return
        log.warning("DEV EMAIL (not sent) to=%s subject=%s\n%s", to, subject, body)
        return
    msg = EmailMessage()
    msg["From"], msg["To"], msg["Subject"] = s.email_from, to, subject
    msg.set_content(body)
    try:
        with smtplib.SMTP(s.smtp_host, s.smtp_port, timeout=10) as smtp:
            smtp.starttls()
            if s.smtp_username:
                smtp.login(s.smtp_username, s.smtp_password)
            smtp.send_message(msg)
    except Exception:  # noqa: BLE001 - delivery failure must not reveal account existence to the caller
        log.exception("Failed to send email")
