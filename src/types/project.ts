export interface Comment {
  id: string;
  timeEntryId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  isClient: boolean;
  isRead: boolean;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  description: string;
  hours: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending-estimation' | 'client-approved' | 'in-progress' | 'blocked' | 'done';
  date: string;
  comments: Comment[];
}

export interface ExpensePayment {
  id: string;
  expenseId: string;
  amount: number;
  date: string;
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod?: 'bank-transfer' | 'credit-card' | 'cash' | 'other';
  reference?: string;
}

export interface Expense {
  id: string;
  projectId: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  isRecurring?: boolean;
  recurringInterval?: 'monthly' | 'quarterly' | 'yearly';
  payments?: ExpensePayment[];
  paidAmount?: number;
  remainingAmount?: number;
  status?: 'unpaid' | 'partially-paid' | 'paid';
}

export type ProjectType = 'time-based' | 'fixed-price';

export interface ProjectAssignment {
  userId: string;
  role: 'project-manager' | 'developer' | 'viewer';
}

export interface Project {
  id: string;
  name: string;
  client: string;
  type: ProjectType;
  totalHours?: number;
  usedHours?: number;
  budget?: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'on-hold';
  timeEntries: TimeEntry[];
  expenses: Expense[];
  assignments: ProjectAssignment[];
  jiraEpicId?: string;
  jiraEpicKey?: string;
  jiraEpicName?: string;
  jiraProjectKey?: string;
}
