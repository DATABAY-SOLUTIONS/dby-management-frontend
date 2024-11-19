import { create } from 'zustand';
import { Project, TimeEntry, Expense } from '../types/project';
import { projectService } from '../services/projects';
import { useAuthStore } from './authStore';

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  setSelectedProject: (project: Project | null) => void;
  addTimeEntry: (projectId: string, entry: Omit<TimeEntry, 'id' | 'projectId' | 'comments'>) => Promise<void>;
  addExpense: (projectId: string, expense: Omit<Expense, 'id' | 'projectId'>) => Promise<void>;
  updateTimeEntry: (projectId: string, entry: TimeEntry) => Promise<void>;
  updateExpense: (projectId: string, expense: Expense) => Promise<void>;
  addComment: (projectId: string, timeEntryId: string, content: string) => Promise<void>;
  requestMoreHours: (projectId: string, request: { hours: number; reason: string; neededBy: string }) => Promise<void>;
  updateProject: (projectId: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  deleteExpense: (projectId: string, expenseId: string) => Promise<void>;
  getAccessibleProjects: () => Project[];
  hasProjectAccess: (projectId: string) => boolean;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  selectedProject: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await projectService.getProjects();
      set({ projects });
    } catch (error) {
      set({ error: 'Failed to fetch projects' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getAccessibleProjects: () => {
    const { user } = useAuthStore.getState();
    if (!user) return [];

    // Admins can see all projects
    if (user.role === 'admin') return get().projects;

    // Other users can only see assigned projects
    return get().projects.filter(project => 
      project.assignments.some(assignment => assignment.userId === user.id)
    );
  },

  hasProjectAccess: (projectId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return false;

    // Admins have access to all projects
    if (user.role === 'admin') return true;

    // Find the project
    const project = get().projects.find(p => p.id === projectId);
    if (!project) return false;

    // Check if user is assigned to the project
    return project.assignments.some(assignment => assignment.userId === user.id);
  },

  setSelectedProject: (project) => set({ selectedProject: project }),

  addTimeEntry: async (projectId, entry) => {
    if (!get().hasProjectAccess(projectId)) {
      throw new Error('No access to this project');
    }

    set({ isLoading: true, error: null });
    try {
      const newEntry = await projectService.addTimeEntry(projectId, entry);
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                timeEntries: [newEntry, ...project.timeEntries],
                usedHours: project.usedHours ? project.usedHours + entry.hours : entry.hours,
              }
            : project
        ),
        selectedProject: state.selectedProject?.id === projectId
          ? {
              ...state.selectedProject,
              timeEntries: [newEntry, ...state.selectedProject.timeEntries],
              usedHours: state.selectedProject.usedHours ? 
                state.selectedProject.usedHours + entry.hours : entry.hours,
            }
          : state.selectedProject
      }));
    } catch (error) {
      set({ error: 'Failed to add time entry' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // ... rest of the existing methods with access control checks ...

  updateProject: async (projectId, projectData) => {
    if (!get().hasProjectAccess(projectId)) {
      throw new Error('No access to this project');
    }

    set({ isLoading: true, error: null });
    try {
      const updatedProject = await projectService.updateProject(projectId, projectData);
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId ? { ...project, ...updatedProject } : project
        ),
        selectedProject: state.selectedProject?.id === projectId
          ? { ...state.selectedProject, ...updatedProject }
          : state.selectedProject
      }));
    } catch (error) {
      set({ error: 'Failed to update project' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));