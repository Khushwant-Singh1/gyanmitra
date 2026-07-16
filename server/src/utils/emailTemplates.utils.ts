import path from 'path';
import fs from 'fs';
import {
  ADMINISTRATOR_ROLE,
  EMAIL_TEMPLATES,
  TEMPLATE_FILE_DEST_FORM_UTILS,
} from '../constants';

enum templateFileExt {
  html = 'html',
  text = 'txt',
}

export interface templatesReturn {
  html: string;
  text: string;
}

const templateCache: { [key: string]: string } = {};

const readTemplate = async (filePath: string): Promise<string> => {
  if (templateCache[filePath]) {
    return templateCache[filePath];
  }

  try {
    const template = await fs.promises.readFile(filePath, 'utf8');
    // Cache the template
    templateCache[filePath] = template;
    return template;
  } catch (error) {
    console.error(`Error reading template file at ${filePath}:`, error);
    throw new Error('Template file could not be read.');
  }
};

const templatesDir = path.resolve(__dirname, TEMPLATE_FILE_DEST_FORM_UTILS);
const getTemplatePath = (templateName: EMAIL_TEMPLATES, ext: templateFileExt) =>
  path.join(templatesDir, `${templateName}.templates.${ext}`);

export const invitationTemplate = async (
  message: string,
  invitationUrl: string,
  senderName: string,
  senderRole: ADMINISTRATOR_ROLE,
  receiverRole: ADMINISTRATOR_ROLE
): Promise<templatesReturn> => {
  const htmlTemplate = await readTemplate(
    getTemplatePath(EMAIL_TEMPLATES.Invitation, templateFileExt.html)
  );
  const textTemplate = await readTemplate(
    getTemplatePath(EMAIL_TEMPLATES.Invitation, templateFileExt.text)
  );

  const currentYear = new Date().getFullYear().toString();

  const html = htmlTemplate
    .replace(/{senderName}/g, senderName)
    .replace(/{senderRole}/g, senderRole)
    .replace(/{receiverRole}/g, receiverRole)
    .replace(/{message}/g, message)
    .replace(/{tokenLink}/g, invitationUrl)
    .replace(/{currentYear}/g, currentYear);

  const text = textTemplate
    .replace(/{senderName}/g, senderName)
    .replace(/{senderRole}/g, senderRole)
    .replace(/{receiverRole}/g, receiverRole)
    .replace(/{message}/g, message)
    .replace(/{tokenLink}/g, invitationUrl)
    .replace(/{currentYear}/g, currentYear);

  return { html, text };
};

export const verificationTemplate = async (
  verificationCode: string
): Promise<templatesReturn> => {
  const htmlTemplate = await readTemplate(
    getTemplatePath(EMAIL_TEMPLATES.Verification, templateFileExt.html)
  );
  const textTemplate = await readTemplate(
    getTemplatePath(EMAIL_TEMPLATES.Verification, templateFileExt.text)
  );

  const currentYear = new Date().getFullYear().toString();

  const html = htmlTemplate
    .replace(/{verificationCode}/g, verificationCode)
    .replace(/{currentYear}/g, currentYear);

  const text = textTemplate
    .replace(/{verificationCode}/g, verificationCode)
    .replace(/{currentYear}/g, currentYear);

  return { html, text };
};
