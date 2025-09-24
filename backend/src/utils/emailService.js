import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "nbcuilahore@gmail.com",
      pass: "ocgq fmda habj lcmk",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const getOTPEmailTemplate = (name, otp) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
        .title { color: #333; font-size: 20px; margin-bottom: 20px; }
        .otp-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 10px 0; }
        .info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">📝 MyTodo App</div>
          <h2 class="title">Email Verification Required</h2>
        </div>
        
        <p>Hello <strong>${name}</strong>,</p>
        
        <p>Thank you for signing up! To complete your registration, please verify your email address using the verification code below:</p>
        
        <div class="otp-box">
          <p style="margin: 0; font-size: 16px;">Your Verification Code</p>
          <div class="otp-code">${otp}</div>
          <p style="margin: 0; font-size: 14px;">Valid for 10 minutes</p>
        </div>
        
        <div class="info">
          <p><strong>🔒 Security Notice:</strong></p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>This code expires in <strong>10 minutes</strong></li>
            <li>Don't share this code with anyone</li>
            <li>If you didn't request this, please ignore this email</li>
          </ul>
        </div>
        
        <p>If you're having trouble, you can request a new verification code from the signup page.</p>
        
        <div class="footer">
          <p>Best regards,<br><strong>MyTodo App Team</strong></p>
          <p style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const sendOTPEmail = async (email, name, otp) => {
  try {
    const transporter = createTransporter();

    await transporter.verify();
    console.log("✅ Email transporter ready");

    const mailOptions = {
      from: {
        name: "MyTodo App",
        address: "nbcuilahore@gmail.com",
      },
      to: email,
      subject: `🔐 Your Verification Code: ${otp}`,
      html: getOTPEmailTemplate(name, otp),
      text: `Hello ${name},\n\nYour verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nBest regards,\nMyTodo App Team`,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ OTP email sent successfully:", {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      to: email,
    });

    return {
      success: true,
      messageId: info.messageId,
      message: "OTP email sent successfully",
    };
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);

    return {
      success: false,
      error: error.message,
      message: "Failed to send OTP email",
    };
  }
};

export const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("✅ Email configuration is valid");
    return { success: true, message: "Email configuration is valid" };
  } catch (error) {
    console.error("❌ Email configuration error:", error);
    return { success: false, error: error.message };
  }
};
