import { useState, useEffect, useRef } from "react";
import "./OTPVerification.css";

const OTPVerification = ({
  email,
  onVerifySuccess,
  onBackToSignup,
  onResendOTP,
  isLoading = false,
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(600);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInputChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== "") && newOtp.join("").length === 6) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (e.key === "Enter") {
      handleVerify();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, 6);

    if (digits.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < digits.length && i < 6; i++) {
        newOtp[i] = digits[i];
      }
      setOtp(newOtp);

      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();

      if (digits.length === 6) {
        handleVerify(digits);
      }
    }
  };

  const handleVerify = async (otpCode = null) => {
    const otpToVerify = otpCode || otp.join("");

    if (otpToVerify.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    if (timeLeft <= 0) {
      setError("OTP has expired. Please request a new one.");
      return;
    }

    try {
      await onVerifySuccess(otpToVerify);
    } catch (error) {
      setError(error.message || "Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    try {
      await onResendOTP();
      setResendCooldown(60);
      setTimeLeft(600);
      setOtp(["", "", "", "", "", ""]);
      setError("");
      inputRefs.current[0]?.focus();
    } catch (error) {
      setError("Failed to resend OTP. Please try again.");
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const isExpired = timeLeft <= 0;
  const canResend = resendCooldown === 0;

  return (
    <div className="otp-container">
      <div className="otp-header">
        <div className="otp-icon">📧</div>
        <h2 className="otp-title">Verify Your Email</h2>
        <p className="otp-subtitle">
          We've sent a 6-digit verification code to:
        </p>
        <p className="otp-email">{email}</p>
      </div>

      <div className="otp-form">
        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`otp-input ${error ? "otp-input-error" : ""}`}
              disabled={isLoading || isExpired}
              autoComplete="one-time-code"
            />
          ))}
        </div>

        {error && (
          <div className="otp-error">
            <span className="otp-error-icon">❌</span>
            {error}
          </div>
        )}

        <div className="otp-timer">
          {isExpired ? (
            <span className="otp-expired">⏰ Code expired</span>
          ) : (
            <span className="otp-time">
              ⏱️ Expires in {formatTime(timeLeft)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => handleVerify()}
          disabled={otp.join("").length !== 6 || isLoading || isExpired}
          className="otp-verify-btn"
        >
          {isLoading ? "🔄 Verifying..." : "🔐 Verify & Create Account"}
        </button>

        <div className="otp-actions">
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || isLoading}
            className={`otp-resend-btn ${!canResend ? "disabled" : ""}`}
          >
            {!canResend ? `⏳ Resend in ${resendCooldown}s` : "📧 Resend Code"}
          </button>

          <button
            type="button"
            onClick={onBackToSignup}
            className="otp-back-btn"
            disabled={isLoading}
          >
            ← Back to Signup
          </button>
        </div>
      </div>

      <div className="otp-help">
        <p>
          💡 <strong>Tips:</strong>
        </p>
        <ul>
          <li>Check your spam/junk folder if you don't see the email</li>
          <li>The code is valid for 10 minutes</li>
          <li>You can paste the entire code from your email</li>
        </ul>
      </div>
    </div>
  );
};

export default OTPVerification;
