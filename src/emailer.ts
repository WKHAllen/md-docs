/**
 * Send emails.
 * @packageDocumentation
 */

import * as nodemailer from "nodemailer";
import * as fs from "fs";
import SMTPTransport = require("nodemailer/lib/smtp-transport");

/**
 * Email address environment variable.
 */
export const emailAddress = process.env.EMAIL_ADDRESS;

/**
 * Email app password environment variable.
 */
const emailPassword = process.env.EMAIL_APP_PASSWORD;

/**
 * When sending an email fails, the amount of time to wait before retrying.
 */
const emailTimeout = 60 * 1000;

/**
 * App name
 */
const appName = "MD Docs";

/**
 * Send an email.
 *
 * @param emailTo The destination address.
 * @param subject The email subject line.
 * @param html The email body HTML.
 * @param text The email body text.
 * @param tryNum The number of times the email has tried to send.
 */
export async function sendEmail(
  emailTo: string,
  subject: string,
  html: string,
  text: string = "",
  tryNum: number = 1
): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    auth: {
      user: emailAddress,
      pass: emailPassword,
    },
  });

  const mailOptions = {
    from: {
      name: appName,
      address: emailAddress,
    },
    to: emailTo,
    subject: `${appName} - ${subject}`,
    html: html,
    text: text,
  };

  let info: SMTPTransport.SentMessageInfo;

  try {
    info = await transporter.sendMail(mailOptions);
  } catch (err) {
    console.warn(`Error sending email to '${emailTo}' (try ${tryNum}):\n`, err);
    setTimeout(() => {
      sendEmail(emailTo, subject, html, text, tryNum + 1);
    }, emailTimeout);
  }
}

/**
 * Send an email and render values into it.
 *
 * @param emailTo The destination address.
 * @param subject The email subject line.
 * @param emailName The name of the email.
 * @param options The values to be rendered into the email.
 */
export async function sendFormattedEmail(
  emailTo: string,
  subject: string,
  emailName: string,
  options: any
): Promise<void> {
  options.appName = options.appName || appName;

  const htmlBuffer = await fs.promises.readFile(`./emails/${emailName}.html`);
  let html = htmlBuffer.toString();
  const textBuffer = await fs.promises.readFile(`./emails/${emailName}.txt`);
  let text = textBuffer.toString();

  for (const key of Object.keys(options)) {
    while (html.includes(`{${key}}`)) {
      html = html.replace(`{${key}}`, options[key]);
    }
    while (text.includes(`{${key}}`)) {
      text = text.replace(`{${key}}`, options[key]);
    }
  }

  await sendEmail(emailTo, subject, html, text);
}
