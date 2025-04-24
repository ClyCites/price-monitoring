import nodemailer from 'nodemailer';
import fs from 'fs-extra';
import handlebars from 'handlebars';
import path from 'path';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const loadTemplate = async (templateName, replacements) => {
  const filePath = path.join(process.cwd(), 'emails', `${templateName}.html`);
  const source = await fs.readFile(filePath, 'utf-8');
  const template = handlebars.compile(source);
  return template(replacements);
};

export const sendEmail = async (to, subject, templateName, replacements) => {
  try {
    const html = await loadTemplate(templateName, replacements);

    await transporter.sendMail({
      from: `"Price Tracker" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email sending error:', error);
  }
};
