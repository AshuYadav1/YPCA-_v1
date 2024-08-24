const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

// Configure the email transporter using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mail.ashukumaryadav@gmail.com", // Replace with your Gmail email address
    pass: "odtp lwnq swkn bqnj", // Replace with your Gmail password
  },
});

// Function to generate random string (example)
function generateRandomString(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Dummy database for storing temporary credentials
let temporaryCredentials = {};

// Function to generate temporary login credentials for captains
function generateTemporaryCredentials(captain) {
  const loginId = generateRandomString(8); // Example function to generate random string
  const token = generateRandomString(12); // Example function to generate random string
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 12); // Expiry in 12 hours

  temporaryCredentials[captain.email] = {
    loginId,
    token,
    expiry,
  };

  return { loginId, token, expiry };
}

// Function to send temporary login credentials to a captain
async function sendTemporaryCredentials(captain) {
  try {
    const { loginId, token, expiry } = generateTemporaryCredentials(captain);

    // Send email with temporary credentials
    const mailOptions = {
      from: "mail.ashukumaryadav@gmail.com",
      to: captain.email,
      subject: "Temporary Login Credentials for App",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Temporary Login Credentials</title>
            <style>
              /* Email template styles */
              body {
                font-family: Arial, sans-serif;
                background-color: #f7f7f7;
                color: #333;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
                padding: 30px;
              }
              h1 {
                color: #007bff;
                text-align: center;
                margin-top: 0;
              }
              p {
                line-height: 1.5;
                margin-bottom: 20px;
              }
              .footer {
                text-align: center;
                font-size: 14px;
                color: #777;
                margin-top: 40px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Temporary Login Credentials</h1>
              <p>Hi ${captain.name},</p>
              <p>Here are your temporary login credentials for accessing the app:</p>
              <p>Login ID: ${loginId}</p>
              <p>Token: ${token}</p>
              <p>Expiry: ${expiry.toLocaleString()}</p>
              <div class="footer">
                &copy; Yashwant Park Sports Association
              </div>
            </div>
          </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent with temporary credentials to captain:", info.response);
  } catch (error) {
    console.error("Error sending email with temporary credentials to captain:", error);
    throw error;
  }
}

// Route to send temporary login credentials to captains
app.post("/send-temporary-credentials", async (req, res) => {
  const { captain } = req.body;

  try {
    await sendTemporaryCredentials(captain);
    res.status(200).json({ message: "Temporary credentials sent successfully" });
  } catch (error) {
    console.error("Error sending temporary credentials:", error);
    res.status(500).json({ error: "Error sending temporary credentials" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
