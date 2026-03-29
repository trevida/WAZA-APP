import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useWorkspaceStore = create(
  persist(
    (set, get) => ({
      currentWorkspace: null,
      workspaces: [],
      
      setCurrentWorkspace: (workspace) => {
        set({ currentWorkspace: workspace });
      },
      
      setWorkspaces: (workspaces) => {
        set({ workspaces });
        if (workspaces.length > 0 && !get().currentWorkspace) {
          set({ currentWorkspace: workspaces[0] });
        }
      },
      
      updateCurrentWorkspace: (data) => {
        const updated = { ...get().currentWorkspace, ...data };
        set({ currentWorkspace: updated });
      },
      
      clearWorkspace: () => {
        set({ currentWorkspace: null, workspaces: [] });
      },
    }),
    {
      name: 'waza-workspace',
    }
  )
);

export default useWorkspaceStore;
