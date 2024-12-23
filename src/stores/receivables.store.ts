import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';

interface IReceivablesStore {
  openNewReceivableDrawer: boolean;
  setOpenNewReceivableDrawer: (openNewReceivableDrawer: boolean) => void;
}

export const receivablesStore = createStore<IReceivablesStore>()(
  persist(
    (set) => ({
      openNewReceivableDrawer: false,
      setOpenNewReceivableDrawer: (openNewReceivableDrawer) => set({ openNewReceivableDrawer }),
    }),
    { name: 'receivables' }
  )
)

export const useReceivablesStore = <T>(
    selector?: (state: IReceivablesStore) => T,
) => useStore(receivablesStore, selector!);