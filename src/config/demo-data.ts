import { Project, TimeEntry, Comment } from '../types/project';
import dayjs from 'dayjs';

const generateDiscussionHistory = (timeEntryId: string, variant: number = 0): Comment[] => {
  const discussions = [
    [
      {
        id: crypto.randomUUID(),
        timeEntryId,
        userId: '2',
        userName: 'Sarah Client',
        userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=faces',
        content: 'The new design mockups look great! Could you explain the thought process behind the color scheme?',
        timestamp: dayjs().subtract(2, 'days').toISOString(),
        isClient: true,
        isRead: true
      },
      {
        id: crypto.randomUUID(),
        timeEntryId,
        userId: '1',
        userName: 'John Developer',
        userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=faces',
        content: 'We chose this palette to align with your brand guidelines while ensuring optimal accessibility scores.',
        timestamp: dayjs().subtract(1, 'day').toISOString(),
        isClient: false,
        isRead: true
      }
    ],
    [
      {
        id: crypto.randomUUID(),
        timeEntryId,
        userId: '3',
        userName: 'Mike Tech Lead',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=faces',
        content: 'Performance optimization complete. Load time reduced by 70%.',
        timestamp: dayjs().subtract(3, 'days').toISOString(),
        isClient: false,
        isRead: true
      }
    ]
  ];

  return discussions[variant % discussions.length];
};

const generateTimeEntries = (projectId: string, startDate: string): TimeEntry[] => {
  const priorities = ['low', 'medium', 'high', 'urgent'] as const;
  const statuses = ['pending-estimation', 'client-approved', 'in-progress', 'blocked', 'done'] as const;
  const descriptions = [
    'Implemented responsive dashboard layout',
    'API integration and error handling',
    'User authentication flow',
    'Performance optimization',
    'Documentation updates',
    'Bug fixes and improvements',
    'Feature implementation',
    'Code review and refactoring',
    'Testing and QA',
    'Deployment and monitoring'
  ];
  
  const entries: TimeEntry[] = [];
  let currentDate = dayjs(startDate);
  
  for (let i = 0; i < 365; i++) {
    if (Math.random() < 0.3) {
      const entriesCount = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < entriesCount; j++) {
        const id = crypto.randomUUID();
        entries.push({
          id,
          projectId,
          description: descriptions[Math.floor(Math.random() * descriptions.length)],
          hours: Math.floor(Math.random() * 6) + 2,
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          date: currentDate.format('YYYY-MM-DD'),
          comments: generateDiscussionHistory(id, i + j)
        });
      }
    }
    currentDate = currentDate.add(1, 'day');
  }

  return entries.sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
};

export const demoProjects: Project[] = [
  {
    id: '1',
    name: 'E-commerce Platform',
    client: 'TechCorp Inc.',
    type: 'time-based',
    totalHours: 2000,
    usedHours: 850,
    startDate: dayjs().subtract(12, 'month').format('YYYY-MM-DD'),
    endDate: dayjs().add(4, 'month').format('YYYY-MM-DD'),
    status: 'active',
    timeEntries: generateTimeEntries('1', dayjs().subtract(12, 'month').format('YYYY-MM-DD')),
    expenses: [
      {
        id: crypto.randomUUID(),
        projectId: '1',
        description: 'AWS Infrastructure',
        amount: 299.99,
        category: 'Hosting',
        date: dayjs().format('YYYY-MM-DD'),
        isRecurring: true,
        recurringInterval: 'monthly'
      }
    ],
    assignments: [
      { userId: '1', role: 'project-manager' },
      { userId: '2', role: 'developer' }
    ]
  },
  {
    id: '2',
    name: 'Mobile App Development',
    client: 'StartupX',
    type: 'fixed-price',
    budget: 75000,
    startDate: dayjs().subtract(6, 'month').format('YYYY-MM-DD'),
    endDate: dayjs().add(6, 'month').format('YYYY-MM-DD'),
    status: 'active',
    timeEntries: generateTimeEntries('2', dayjs().subtract(6, 'month').format('YYYY-MM-DD')),
    expenses: [
      {
        id: crypto.randomUUID(),
        projectId: '2',
        description: 'Development Tools',
        amount: 199.99,
        category: 'Software Licenses',
        date: dayjs().format('YYYY-MM-DD'),
        isRecurring: true,
        recurringInterval: 'monthly'
      }
    ],
    assignments: [
      { userId: '1', role: 'viewer' },
      { userId: '2', role: 'project-manager' }
    ]
  },
  {
    id: '3',
    name: 'Website Maintenance',
    client: 'Local Business Ltd.',
    type: 'time-based',
    totalHours: 500,
    usedHours: 125,
    startDate: dayjs().subtract(2, 'month').format('YYYY-MM-DD'),
    endDate: dayjs().add(10, 'month').format('YYYY-MM-DD'),
    status: 'active',
    timeEntries: generateTimeEntries('3', dayjs().subtract(2, 'month').format('YYYY-MM-DD')),
    expenses: [],
    assignments: [
      { userId: '2', role: 'developer' }
    ]
  },
  {
    id: '4',
    name: 'Custom CRM Development',
    client: 'Enterprise Corp',
    type: 'fixed-price',
    budget: 120000,
    startDate: dayjs().subtract(3, 'month').format('YYYY-MM-DD'),
    endDate: dayjs().add(9, 'month').format('YYYY-MM-DD'),
    status: 'active',
    timeEntries: generateTimeEntries('4', dayjs().subtract(3, 'month').format('YYYY-MM-DD')),
    expenses: [
      {
        id: crypto.randomUUID(),
        projectId: '4',
        description: 'Third-party API Integration',
        amount: 499.99,
        category: 'Services',
        date: dayjs().format('YYYY-MM-DD'),
        isRecurring: true,
        recurringInterval: 'monthly'
      }
    ],
    assignments: [
      { userId: '1', role: 'project-manager' }
    ]
  }
];