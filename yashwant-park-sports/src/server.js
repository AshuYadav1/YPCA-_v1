const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");
const fs = require("fs");
const PDFDocument = require("pdfkit");

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

// Function to send email to a captain
async function sendCaptainEmail(captain, team) {
  try {
    // Create a new PDF document
    const pdfDoc = new PDFDocument({
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
    });

    // Create a data stream to store the PDF data
    const pdfPath = `${captain.name}_team.pdf`;
    const pdfStream = fs.createWriteStream(pdfPath);
    pdfDoc.pipe(pdfStream);

    // Set the font and font size
    pdfDoc.font("Helvetica-Bold");
    pdfDoc.fontSize(18);

    // Add the header
    pdfDoc.text("Yashwant Park Sports Association", { align: "center" });
    pdfDoc.moveDown();

    // Add the title
    pdfDoc.fontSize(16);
    pdfDoc.text(`Team Members for ${captain.name}`, {
      align: "center",
      underline: true,
    });
    pdfDoc.moveDown();

    // Set the font and font size for team members
    pdfDoc.font("Helvetica");
    pdfDoc.fontSize(12);

    // Add the team members list
    team.forEach((player, index) => {
      pdfDoc.text(`${index + 1}. ${player.Name}`, { lineGap: 5 });
      if (index < team.length - 1) {
        pdfDoc.moveDown(); // Move down to the next line
      }
    });

    // Add a footer with the current date
    pdfDoc.moveDown();
    pdfDoc.fontSize(10);
    pdfDoc.text(`Generated on: ${new Date().toLocaleDateString()}`, {
      align: "center",
    });

    // Finalize the PDF document
    pdfDoc.end();

    // Wait for the PDF stream to finish writing
    await new Promise((resolve) => {
      pdfStream.on("finish", resolve);
    });

    // Send email with attached PDF
    const mailOptions = {
      from: "mail.ashukumaryadav@gmail.com",
      to: captain.email,
      subject: "Captain Selection for Today's Match",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Captain Selection</title>
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
              <h1>Captain Selection</h1>
              <p>Hi ${captain.name},</p>
              <p>Congratulations! You have been selected as a captain for today's match. Get ready to lead your team to victory!</p>
              <p>Please find the list of your team members attached in the PDF file.</p>
              <p>Best of luck!</p>
              <div class="footer">
                &copy; Yashwant Park Sports Association
              </div>
            </div>
          </body>
        </html>
      `,
      attachments: [
        {
          filename: pdfPath,
          path: pdfPath,
          contentType: "application/pdf",
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent to captain:", info.response);

    // Remove the temporary PDF file
    fs.unlinkSync(pdfPath);
  } catch (error) {
    console.error("Error sending email to captain:", error);
    throw error;
  }
}

// Function to send email to a player
async function sendPlayerEmail(player, captainName) {
  try {
    const mailOptions = {
      from: "mail.ashukumaryadav@gmail.com",
      to: player.Email,
      subject: `You are in ${captainName} Team`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Team Assignment</title>
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
              <h1>Team Assignment</h1>
              <p>Hi ${player.Name},</p>
              <p>You have been assigned to ${captainName}'s team for today's match. Prepare well and play your best!</p>
              <p>Good luck!</p>
              <div class="footer">
                &copy; Yashwant Park Sports Association
              </div>
            </div>
          </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent to player:", info.response);
  } catch (error) {
    console.error("Error sending email to player:", error);
    throw error;
  }
}

// Route to send emails to captains and players
app.post("/send-email", async (req, res) => {
  const { captain1, captain2 } = req.body;

  console.log("Received data:", req.body);

  try {
    // Send emails to captains
    await Promise.all([
      sendCaptainEmail(captain1, captain1.team),
      sendCaptainEmail(captain2, captain2.team),
    ]);

    // Send emails to players
    const playerPromises = [];
    captain1.team.forEach((player) => {
      playerPromises.push(sendPlayerEmail(player, captain1.name));
    });
    captain2.team.forEach((player) => {
      playerPromises.push(sendPlayerEmail(player, captain2.name));
    });

    await Promise.all(playerPromises);

    res.status(200).json({ message: "Emails sent successfully" });
  } catch (error) {
    console.error("Error sending emails:", error);
    res.status(500).json({ error: "Error sending emails" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
