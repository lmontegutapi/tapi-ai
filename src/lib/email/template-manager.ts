import { prisma } from "@/lib/db";
import { EmailType } from "@/types";
/* 
export class EmailTemplateManager {
  static async getTemplate(organizationId: string, type: EmailType) {
    const template = await prisma.emailTemplate.findUnique({
      where: {
        organizationId_type: {
          organizationId,
          type
        }
      }
    });

    return template;
  }

  static async sendTemplatedEmail(
    to: string,
    type: EmailType,
    organizationId: string,
    data: TemplateData
  ) {
    const template = await this.getTemplate(organizationId, type);
    if (!template || !template.isActive) return null;

    const compiledBody = EmailTemplateService.compileTemplate(template.bodyTemplate, data);
    const compiledSubject = EmailTemplateService.compileTemplate(template.subject, data);

    // Enviar email usando Resend
    try {
      const result = await resend.emails.send({
        from: 'Tapi AI <no-reply@tudominio.com>',
        to: [to],
        subject: compiledSubject,
        html: compiledBody
      });

      // Registrar el envío
      await prisma.emailLog.create({
        data: {
          to,
          subject: compiledSubject,
          body: compiledBody,
          status: 'SENT',
          organizationId
        }
      });

      return result;
    } catch (error) {
      // Registrar el error
      await prisma.emailLog.create({
        data: {
          to,
          subject: compiledSubject,
          body: compiledBody,
          status: 'ERROR',
          error: error.message,
          organizationId
        }
      });
      
      throw error;
    }
  }
} */