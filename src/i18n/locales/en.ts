export default {
  translation: {
    common: {
      appTitle: 'Project Hours Manager',
      date: 'Date',
      hours: 'Hours',
      amount: 'Amount',
      category: 'Category',
      priority: 'Priority',
      status: 'Status',
      description: 'Description',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      activeProjects: 'Active Projects',
      backToProjects: 'Back to Projects',
      noProjects: 'No projects found',
      hoursRemaining: 'Hours Remaining',
      hoursUsed: 'Hours Used',
      totalHours: 'Total Hours',
      client: 'Client',
      projectStatus: 'Project Status',
      actions: 'Actions',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      details: 'Details',
      comments: 'Comments',
      addComment: 'Add Comment',
      recurring: 'Recurring',
      total: 'Total',
      daily: 'Daily',
      monthly: 'Monthly',
      yearly: 'Yearly',
      timeScale: 'Time Scale'
    },
    auth: {
      login: 'Login',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      emailPlaceholder: 'Enter your email',
      passwordPlaceholder: 'Enter your password',
      welcomeBack: 'Welcome Back',
      loginToContinue: 'Please login to continue',
      accountSettings: 'Account Settings',
      invalidCredentials: 'Invalid email or password',
      demoCredentials: 'Demo Credentials:',
      userProfile: 'User Profile',
      userSettings: 'User Settings'
    },
    menu: {
      messages: 'Messages',
      notifications: 'Notifications',
      emailUpdates: 'Email Updates',
      language: 'Language',
      english: 'English',
      spanish: 'Spanish',
      theme: 'Theme',
      settings: 'Settings',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode'
    },
    project: {
      requestMoreHours: 'Request More Hours',
      currentHoursInfo: 'Current total: {{current}} hours ({{remaining}} remaining)',
      additionalHours: 'Additional Hours Needed',
      enterAdditionalHours: 'Enter number of additional hours',
      requestReason: 'Reason for Request',
      enterRequestReason: 'Please explain why additional hours are needed...',
      neededBy: 'Needed By',
      submitRequest: 'Submit Request',
      hoursRequestSubmitted: 'Hours request submitted successfully',
      addTask: 'Add Task',
      addExpense: 'Add Expense',
      hoursOverview: 'Hours Overview',
      timeTracking: 'Time Tracking',
      expenses: 'Expenses',
      comments: 'Comments',
      details: 'Details',
      viewDetails: 'View Details',
      editDetails: 'Edit Details'
    },
    task: {
      taskDescription: 'Task Description',
      requestNewTask: 'Request New Task',
      submitRequest: 'Submit Request',
      taskDetails: 'Task Details',
      priority: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        urgent: 'Urgent'
      },
      status: {
        'pending-estimation': 'Pending Estimation',
        'client-approved': 'Client Approved',
        'in-progress': 'In Progress',
        'blocked': 'Blocked',
        'done': 'Done'
      }
    },
    expense: {
      recurringExpense: 'Recurring Expense',
      recurringInterval: 'Recurring Interval',
      intervals: {
        monthly: 'Monthly',
        quarterly: 'Quarterly',
        yearly: 'Yearly'
      },
      categories: {
        hosting: 'Hosting',
        licenses: 'Software Licenses',
        services: 'Third-party Services',
        infrastructure: 'Infrastructure',
        other: 'Other'
      }
    },
    validation: {
      hoursRequired: 'Please enter the number of hours needed',
      reasonRequired: 'Please provide a reason for the request',
      dateRequired: 'Please select a date',
      descriptionRequired: 'Please enter a description',
      amountRequired: 'Please enter an amount',
      categoryRequired: 'Please select a category',
      intervalRequired: 'Please select an interval',
      emailRequired: 'Please enter your email',
      emailInvalid: 'Please enter a valid email',
      passwordRequired: 'Please enter your password'
    },
    admin: {
      title: 'Admin Dashboard',
      menu: {
        projects: 'Projects',
        expenses: 'Expenses',
        users: 'Users',
        dashboard: 'Dashboard'
      },
      projects: {
        title: 'Project Management',
        create: 'Create Project',
        edit: 'Edit Project',
        status: 'Status',
        client: 'Client',
        budget: 'Budget',
        hours: 'Hours',
        actions: 'Actions',
        name: 'Project Name',
        startDate: 'Start Date',
        endDate: 'End Date'
      },
      expenses: {
        title: 'Expense Management',
        create: 'Register Expense',
        edit: 'Edit Expense',
        amount: 'Amount',
        category: 'Category',
        date: 'Date',
        recurring: 'Recurring',
        description: 'Description'
      },
      users: {
        title: 'User Management',
        create: 'Create User',
        edit: 'Edit User',
        role: 'Role',
        status: 'Status',
        lastLogin: 'Last Login',
        email: 'Email',
        name: 'Name'
      },
      common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        view: 'View',
        search: 'Search',
        filter: 'Filter',
        noData: 'No data available',
        confirmDelete: 'Are you sure you want to delete this item?'
      }
    }
  }
};