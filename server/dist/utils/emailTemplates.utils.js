"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificationTemplate = exports.invitationTemplate = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const constants_1 = require("../constants");
var templateFileExt;
(function (templateFileExt) {
    templateFileExt["html"] = "html";
    templateFileExt["text"] = "txt";
})(templateFileExt || (templateFileExt = {}));
const templateCache = {};
const readTemplate = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    if (templateCache[filePath]) {
        return templateCache[filePath];
    }
    try {
        const template = yield fs_1.default.promises.readFile(filePath, 'utf8');
        // Cache the template
        templateCache[filePath] = template;
        return template;
    }
    catch (error) {
        console.error(`Error reading template file at ${filePath}:`, error);
        throw new Error('Template file could not be read.');
    }
});
const templatesDir = path_1.default.resolve(__dirname, constants_1.TEMPLATE_FILE_DEST_FORM_UTILS);
const getTemplatePath = (templateName, ext) => path_1.default.join(templatesDir, `${templateName}.templates.${ext}`);
const invitationTemplate = (message, invitationUrl, senderName, senderRole, receiverRole) => __awaiter(void 0, void 0, void 0, function* () {
    const htmlTemplate = yield readTemplate(getTemplatePath(constants_1.EMAIL_TEMPLATES.Invitation, templateFileExt.html));
    const textTemplate = yield readTemplate(getTemplatePath(constants_1.EMAIL_TEMPLATES.Invitation, templateFileExt.text));
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
});
exports.invitationTemplate = invitationTemplate;
const verificationTemplate = (verificationCode) => __awaiter(void 0, void 0, void 0, function* () {
    const htmlTemplate = yield readTemplate(getTemplatePath(constants_1.EMAIL_TEMPLATES.Verification, templateFileExt.html));
    const textTemplate = yield readTemplate(getTemplatePath(constants_1.EMAIL_TEMPLATES.Verification, templateFileExt.text));
    const currentYear = new Date().getFullYear().toString();
    const html = htmlTemplate
        .replace(/{verificationCode}/g, verificationCode)
        .replace(/{currentYear}/g, currentYear);
    const text = textTemplate
        .replace(/{verificationCode}/g, verificationCode)
        .replace(/{currentYear}/g, currentYear);
    return { html, text };
});
exports.verificationTemplate = verificationTemplate;
