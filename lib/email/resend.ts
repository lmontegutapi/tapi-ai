import { Resend } from 'resend';
import WelcomeEmailTemplate from './welcome-email';
import InvitationEmailTemplate from './invitation-email';

export const resend = new Resend(process.env.RESEND_API_KEY);

/* export const sendWelcomeEmail = async (to: string, name: string, organizationName: string) => {
  try {
    const data = await resend.emails.send({
      from: 'TapFlow AI <no-reply@tudominio.com>',
      to: [to],
      subject: `Bienvenido a ${organizationName}`,
      react: WelcomeEmailTemplate({
        name,
        organizationName
      })
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
};

export const sendInvitationEmail = async (to: string, inviterName: string, organizationName: string, inviteLink: string) => {
  try {
    const data = await resend.emails.send({
      from: 'Cobranzas AI <no-reply@tudominio.com>',
      to: [to],
      subject: `${inviterName} te invitó a unirte a ${organizationName}`,
      react: InvitationEmailTemplate({
        inviterName,
        organizationName,
        inviteLink
      })
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}; */