import { create } from "zustand";

interface AudiencesStore {
  openNewAudienceDrawer: boolean;
  setOpenNewAudienceDrawer: (open: boolean) => void;
  openEditAudienceDrawer: boolean;
  setOpenEditAudienceDrawer: (open: boolean) => void;
}

export const useAudiencesStore = create<AudiencesStore>((set) => ({
  openNewAudienceDrawer: false,
  setOpenNewAudienceDrawer: (open) => set({ openNewAudienceDrawer: open }),
  openEditAudienceDrawer: false,
  setOpenEditAudienceDrawer: (open) => set({ openEditAudienceDrawer: open })
}));