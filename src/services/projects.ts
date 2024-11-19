import { api, USE_MOCK_DATA } from '../config/api';
import { Project, TimeEntry, Expense } from '../types/project';
import { demoProjects } from '../config/demo-data';

const SIMULATE_DELAY = 800;

const simulateDelay = () => 
  USE_MOCK_DATA ? new Promise(resolve => setTimeout(resolve, SIMULATE_DELAY)) : Promise.resolve();

export const projectService = {
  async getProjects(): Promise<Project[]> {
    if (USE_MOCK_DATA) {
      await simulateDelay();
      return demoProjects;
    }
    const { data } = await api.get<Project[]>('/projects');
    return data;
  },

  async getProject(id: string): Promise<Project> {
    if (USE_MOCK_DATA) {
      await simulateDelay();
      const project = demoProjects.find(p => p.id === id);
      if (!project) throw new Error('Project not found');
      return project;
    }
    const { data } = await api.get<Project>(`/projects/${id}`);
    return data;
  },

  async createProject(projectData: Omit<Project, 'id'>): Promise<Project> {
    if (USE_MOCK_DATA) {
      await simulateDelay();
      const newProject: Project = {
        ...projectData,
        id: crypto.randomUUID()
      };
      demoProjects.push(newProject);
      return newProject;
    }
    const { data } = await api.post<Project>('/projects', projectData);
    return data;
  },

  async updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
    if (USE_MOCK_DATA) {
      await simulateDelay();
      const projectIndex = demoProjects.findIndex(p => p.id === id);
      if (projectIndex === -1) throw new Error('Project not found');
      
      const updatedProject = {
        ...demoProjects[projectIndex],
        ...projectData
      };
      demoProjects[projectIndex] = updatedProject;
      return updatedProject;
    }
    const { data } = await api.patch<Project>(`/projects/${id}`, projectData);
    return data;
  },

  async deleteProject(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await simulateDelay();
      const projectIndex = demoProjects.findIndex(p => p.id === id);
      if (projectIndex === -1) throw new Error('Project not found');
      demoProjects.splice(projectIndex, 1);
      return;
    }
    await api.delete(`/projects/${id}`);
  },

  async addTimeEntry(projectId: string, entry: Omit<TimeEntry, 'id' | 'projectId' | 'comments'>): Promise<TimeEntry> {
    if (USE_MOCK_DATA) {
      await simulateDelay();
      return {
        ...entry,
        id: crypto.randomUUID(),
        projectId,
        comments: []
      };
    }
    const { data } = await api.post<TimeEntry>(`/projects/${projectId}/time-entries`, entry);
    return data;
  },

  async updateTimeEntry(projectId: string, entryId: string, entry: Partial<TimeEntry>): Promise<TimeEntry> {
    if (USE_MOCK_DATA) {
      await simulateDelay();
      return {
        ...entry,
        id: entryId,
        projectId
      } as TimeEntry;
    }
    const { data } = await api.patch<TimeEntry>(`/projects/${projectId}/time-entries/${entryId}`, entry);
    return data;
  },

  async addExpense(projectId: string, expense: Omit<Expense, 'id' | 'projectId'>): Promise<Expense> {
    if (USE_MOCK_DATA) {
      await simulateDelay();
      return {
        ...expense,
        id: crypto.randomUUID(),
        projectId
      };
    }
    const { data } = await api.post<Expense>(`/projects/${projectId}/expenses`, expense);
    return data;
  },

  async updateExpense(projectId: string, expenseId: string, expense: Partial<Expense>): Promise<Expense> {
    if (USE_MOCK_DATA) {
      await simulateDelay();
      return {
        ...expense,
        id: expenseId,
        projectId
      } as Expense;
    }
    const { data } = await api.patch<Expense>(`/projects/${projectId}/expenses/${expenseId}`, expense);
    return data;
  },

  async deleteExpense(projectId: string, expenseId: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await simulateDelay();
      const project = demoProjects.find(p => p.id === projectId);
      if (!project) throw new Error('Project not found');
      
      const expenseIndex = project.expenses.findIndex(e => e.id === expenseId);
      if (expenseIndex === -1) throw new Error('Expense not found');
      
      project.expenses.splice(expenseIndex, 1);
      return;
    }
    await api.delete(`/projects/${projectId}/expenses/${expenseId}`);
  },

  async addComment(projectId: string, timeEntryId: string, content: string): Promise<TimeEntry> {
    if (USE_MOCK_DATA) {
      await simulateDelay();
      return {
        id: timeEntryId,
        projectId,
        description: 'Updated entry',
        hours: 2,
        priority: 'medium',
        status: 'in-progress',
        date: new Date().toISOString(),
        comments: [
          {
            id: crypto.randomUUID(),
            timeEntryId,
            userId: '1',
            userName: 'John Developer',
            userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=faces',
            content,
            timestamp: new Date().toISOString(),
            isClient: false,
            isRead: true
          }
        ]
      };
    }
    const { data } = await api.post<TimeEntry>(`/projects/${projectId}/time-entries/${timeEntryId}/comments`, { content });
    return data;
  },

  async requestMoreHours(projectId: string, request: { hours: number; reason: string; neededBy: string }): Promise<Project> {
    if (USE_MOCK_DATA) {
      await simulateDelay();
      const project = demoProjects.find(p => p.id === projectId);
      if (!project) throw new Error('Project not found');
      return {
        ...project,
        totalHours: project.totalHours! + request.hours
      };
    }
    const { data } = await api.post<Project>(`/projects/${projectId}/request-hours`, request);
    return data;
  }
};