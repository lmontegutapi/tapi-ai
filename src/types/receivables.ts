import { Campaign, Contact, PaymentPromise, Receivable } from "@prisma/client";

export interface ReceivableWithContact extends Omit<Receivable, "campaign"> {
  contact: Contact;
  paymentPromises: PaymentPromise[];
  campaign?: Campaign;
}

export interface ResponseAudienceDetails {
  success: boolean;
  data: {
    audience: {
      id: string;
      name: string;
      description: string | null;
      organizationId: string;
      delinquencyBucket: string;
      contactPreference: string;
      metadata: any;
      createdAt: Date;
      updatedAt: Date;
      receivables: ReceivableWithContact[];
      campaigns: Campaign[];
    };
    metrics: {
      totalAmount: number;
      pastDueAmount: number;
      totalReceivables: number;
      totalContacts: number;
      totalCampaigns: number;
      activeCampaigns: number;
      activePromises: number;
      totalCalls: number;
      averageAmount: number;
      receivablesByStatus: Record<string, number>;
      contactChannelMetrics: {
        whatsapp: number;
        email: number;
        voice: number;
      };
    };
  };
  error?: string;
}