import twilio from 'twilio';

export const TwilioClient = twilio(process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID!, process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN!);