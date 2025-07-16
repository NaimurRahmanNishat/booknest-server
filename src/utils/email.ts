import nodemailer from "nodemailer";

const sendEmail = async (options: any) => {
  // crate a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  } as any);

  // define the email options
  const emailOptions = {
    from: "Cineflix <support@Cineflix.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(emailOptions);
};

export default sendEmail;
