import logging
import os

logger = logging.getLogger(__name__)

FRONTEND_URL = os.getenv("FRONTEND_URL", "https://waza.vercel.app")


class EmailService:
    """Mock email service — logs verification/reset links to console."""

    def send_verification_email(self, to_email: str, token: str):
        verify_url = f"{FRONTEND_URL}/verify-email?token={token}"
        logger.info("=" * 60)
        logger.info(f"[MOCK EMAIL] Verification email to: {to_email}")
        logger.info(f"[MOCK EMAIL] Verify URL: {verify_url}")
        logger.info("=" * 60)

    def send_password_reset_email(self, to_email: str, token: str):
        reset_url = f"{FRONTEND_URL}/reset-password?token={token}"
        logger.info("=" * 60)
        logger.info(f"[MOCK EMAIL] Password reset email to: {to_email}")
        logger.info(f"[MOCK EMAIL] Reset URL: {reset_url}")
        logger.info("=" * 60)


email_service = EmailService()
