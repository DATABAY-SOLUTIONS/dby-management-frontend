import { create } from 'zustand';
import { Project, TimeEntry, Expense, ProjectAssignment } from '../types/project';
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
  createProject: (projectData: Omit<Project, 'id' | 'timeEntries' | 'expenses' | 'assignments'>) => Promise<void>;
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

  setSelectedProject: (project) => set({ selectedProject: project }),

  createProject: async (projectData) => {
    set({ isLoading: true, error: null });
    try {
      const newProject = await projectService.createProject({
        ...projectData,
        timeEntries: [],
        expenses: [],
        assignments: []
      });
      set((state) => ({
        projects: [...state.projects, newProject]
      }));
    } catch (error) {
      set({ error: 'Failed to create project' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  addTimeEntry: async (projectId, entry) => {
    set({ isLoading: true, error: null });
    try {
      const newEntry = await projectService.addTimeEntry(projectId, entry);
      set((state) => ({
        projects: state.projects.map((project) =>
            project.id === projectId
                ? {
                  ...project,
                  timeEntries: [newEntry, ...project.timeEntries],
                  usedHours: project.type === 'time-based' ?
                      (project.usedHours || 0) + entry.hours : undefined
                }
                : project
        ),
        selectedProject: state.selectedProject?.id === projectId
            ? {
              ...state.selectedProject,
              timeEntries: [newEntry, ...state.selectedProject.timeEntries],
              usedHours: state.selectedProject.type === 'time-based' ?
                  (state.selectedProject.usedHours || 0) + entry.hours : undefined
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

  addExpense: async (projectId, expense) => {
    set({ isLoading: true, error: null });
    try {
      const newExpense = await projectService.addExpense(projectId, expense);
      set((state) => ({
        projects: state.projects.map((project) =>
            project.id === projectId
                ? {
                  ...project,
                  expenses: [newExpense, ...project.expenses],
                }
                : project
        ),
        selectedProject: state.selectedProject?.id === projectId
            ? {
              ...state.selectedProject,
              expenses: [newExpense, ...state.selectedProject.expenses],
            }
            : state.selectedProject
      }));
    } catch (error) {
      set({ error: 'Failed to add expense' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTimeEntry: async (projectId, entry) => {
    set({ isLoading: true, error: null });
    try {
      const updatedEntry = await projectService.updateTimeEntry(projectId, entry.id, entry);
      set((state) => ({
        projects: state.projects.map((project) =>
            project.id === projectId
                ? {
                  ...project,
                  timeEntries: project.timeEntries.map((te) =>
                      te.id === entry.id ? updatedEntry : te
                  ),
                }
                : project
        ),
        selectedProject: state.selectedProject?.id === projectId
            ? {
              ...state.selectedProject,
              timeEntries: state.selectedProject.timeEntries.map((te) =>
                  te.id === entry.id ? updatedEntry : te
              ),
            }
            : state.selectedProject
      }));
    } catch (error) {
      set({ error: 'Failed to update time entry' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateExpense: async (projectId, expense) => {
    set({ isLoading: true, error: null });
    try {
      const updatedExpense = await projectService.updateExpense(projectId, expense.id, expense);
      set((state) => ({
        projects: state.projects.map((project) =>
            project.id === projectId
                ? {
                  ...project,
                  expenses: project.expenses.map((exp) =>
                      exp.id === expense.id ? updatedExpense : exp
                  ),
                }
                : project
        ),
        selectedProject: state.selectedProject?.id === projectId
            ? {
              ...state.selectedProject,
              expenses: state.selectedProject.expenses.map((exp) =>
                  exp.id === expense.id ? updatedExpense : exp
              ),
            }
            : state.selectedProject
      }));
    } catch (error) {
      set({ error: 'Failed to update expense' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProject: async (projectId, projectData) => {
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

  deleteProject: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      await projectService.deleteProject(projectId);
      set((state) => ({
        projects: state.projects.filter((project) => project.id !== projectId),
        selectedProject: state.selectedProject?.id === projectId ? null : state.selectedProject
      }));
    } catch (error) {
      set({ error: 'Failed to delete project' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteExpense: async (projectId, expenseId) => {
    set({ isLoading: true, error: null });
    try {
      await projectService.deleteExpense(projectId, expenseId);
      set((state) => ({
        projects: state.projects.map((project) =>
            project.id === projectId
                ? {
                  ...project,
                  expenses: project.expenses.filter((exp) => exp.id !== expenseId),
                }
                : project
        ),
        selectedProject: state.selectedProject?.id === projectId
            ? {
              ...state.selectedProject,
              expenses: state.selectedProject.expenses.filter((exp) => exp.id !== expenseId),
            }
            : state.selectedProject
      }));
    } catch (error) {
      set({ error: 'Failed to delete expense' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  addComment: async (projectId, timeEntryId, content) => {
    set({ isLoading: true, error: null });
    try {
      const updatedEntry = await projectService.addComment(projectId, timeEntryId, content);
      set((state) => ({
        projects: state.projects.map((project) =>
            project.id === projectId
                ? {
                  ...project,
                  timeEntries: project.timeEntries.map((te) =>
                      te.id === timeEntryId ? updatedEntry : te
                  ),
                }
                : project
        ),
        selectedProject: state.selectedProject?.id === projectId
            ? {
              ...state.selectedProject,
              timeEntries: state.selectedProject.timeEntries.map((te) =>
                  te.id === timeEntryId ? updatedEntry : te
              ),
            }
            : state.selectedProject
      }));
    } catch (error) {
      set({ error: 'Failed to add comment' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  requestMoreHours: async (projectId, request) => {
    set({ isLoading: true, error: null });
    try {
      const updatedProject = await projectService.requestMoreHours(projectId, request);
      set((state) => ({
        projects: state.projects.map((project) =>
            project.id === projectId ? updatedProject : project
        ),
        selectedProject: state.selectedProject?.id === projectId
            ? updatedProject
            : state.selectedProject
      }));
    } catch (error) {
      set({ error: 'Failed to request more hours' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getAccessibleProjects: () => {
    const state = get();
    const user = useAuthStore.getState().user;
    if (!user) return [];

    return state.projects.filter(project => {
      const assignment = project.assignments.find(a => a.userId === user.id);
      return assignment || user.role === 'admin';
    });
  },

  hasProjectAccess: (projectId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return false;
    if (user.role === 'admin') return true;

    const project = get().projects.find(p => p.id === projectId);
    if (!project) return false;

    return project.assignments.some(a => a.userId === user.id);
  }
}));
