import { create } from "zustand";
import { Audience } from "@prisma/client";
import { createCampaign } from "@/actions/campaigns";

interface CampaignsStore {
  audiences?: Audience[];
  setAudiences: (audiences: Audience[]) => void;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
  createCampaign: (data: any) => Promise<{ success: boolean; error?: string }>;
}

export const useCampaignsStore = create<CampaignsStore>((set) => ({
  audiences: undefined,
  setAudiences: (audiences) => set({ audiences }),
  isSubmitting: false,
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  createCampaign: async (data) => {
    set({ isSubmitting: true });
    try {
      const result = await createCampaign(data);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      set({ isSubmitting: false });
    }
  },
})); 