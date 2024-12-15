import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "your-email@gmail.com",
      pass: "your-email-password",
    },
  });

  const mailOptions = {
    from: "your-email@gmail.com",
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export { sendEmail };
