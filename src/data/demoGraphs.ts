import type { AutoLogging, CountRow, FeatureUsage, LastExecution, Project, RoleRow, Team, UserCountByProject, UserLogin, UsersByType } from '@/types/adminGraphs';

export interface DemoCustomer { id: number; name: string; projects: number; users: number; teams: number; }

export const DEMO_CUSTOMERS: DemoCustomer[] = [
  { id: 1, name: 'Acme Insurance', projects: 28, users: 96, teams: 7 },
  { id: 2, name: 'Globex Payments', projects: 12, users: 41, teams: 4 },
  { id: 3, name: 'Initech Health', projects: 45, users: 160, teams: 11 }
];

export interface DemoDataset {
  projects: Project[];
  userCount: UserCountByProject;
  usersByType: UsersByType;
  lastLogin: UserLogin[];
  lastExecution: (projectId: number) => LastExecution[];
  roles: (projectId: number) => RoleRow[];
  customFields: (projectId: number) => CountRow[];
  autoLogging: AutoLogging[];
  teams: Team[];
  featureUsage: FeatureUsage;
}

const PROJECT_WORDS = ['Payments', 'Mobile Banking', 'Core Platform', 'Onboarding Journey', 'Claims', 'Nightly Regression', 'API Gateway', 'Data Migration', 'Customer Portal', 'Reports', 'Identity', 'Inventory', 'Scheduler', 'Analytics', 'Checkout'];
const FIRST = ['Asha', 'Rahul', 'Priya', 'Vikram', 'Neha', 'Karthik', 'Divya', 'Suresh', 'Anitha', 'Manoj', 'Meera', 'Arjun'];
const LAST = ['Reddy', 'Sharma', 'Iyer', 'Nair', 'Patel', 'Rao', 'Menon', 'Gupta', 'Das', 'Pillai'];
const ROLES = ['Tester', 'Automation Engineer', 'Developer', 'Project Manager', 'Business Analyst', 'Viewer'];
const MODULES_WITH_FIELDS = ['Defect', 'Test Case', 'User Story', 'Task', 'Epic', 'Feature', 'Execution Plan'];
const TEAM_WORDS = ['Platform', 'QA Automation', 'Mobile', 'Payments', 'Data', 'Growth', 'Core', 'Support'];
export const FEATURE_MODULES = ['Epics', 'Features', 'User stories', 'Tasks', 'Defects', 'Test cases', 'Suites', 'Execution plans', 'Scheduler', 'Pipelines', 'Executions'];

const seeded = (seed: number) => {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
};

const DAY = 86400000;

export function demoDataset(customer: DemoCustomer): DemoDataset {
  const random = seeded(customer.id * 7919);
  const pick = <T,>(items: T[]) => items[Math.floor(random() * items.length)];
  const int = (max: number) => Math.floor(random() * max);
  const now = Date.now();

  const projects: Project[] = Array.from({ length: customer.projects }, (_, index) => ({ id: customer.id * 1000 + index + 1, name: `${pick(PROJECT_WORDS)} ${index + 1}` }));
  const users: UserLogin[] = Array.from({ length: customer.users }, (_, index) => ({
    id: index + 1,
    name: `${pick(FIRST)} ${pick(LAST)}`,
    email: `user${index + 1}@${customer.name.split(' ')[0].toLowerCase()}.example`,
    lastLoginAt: random() < 0.12 ? null : new Date(now - random() * random() * 180 * DAY).toISOString()
  }));
  const admins = Math.max(1, Math.round(customer.users * 0.08));

  const projectUsers = projects.map((project) => ({ _id: project.name, count: 1 + Math.floor(random() * random() * Math.min(60, customer.users)) }));
  const usage = projects.map((project) => {
    const counts = FEATURE_MODULES.map(() => (random() < 0.35 ? 0 : Math.floor(random() * random() * 700)));
    return { projectId: project.id, projectName: project.name, counts, total: counts.reduce((a, b) => a + b, 0), modulesUsed: counts.filter(Boolean).length };
  });
  const teams: Team[] = Array.from({ length: customer.teams }, (_, index) => ({
    _id: `${pick(TEAM_WORDS)} Team ${index + 1}`,
    teamId: 50 + index,
    members: users.slice(index * 5, index * 5 + 3 + int(14)).map((user) => ({ userId: user.id, name: user.name, email: user.email }))
  }));

  const perProject = <T,>(build: (seed: number) => T) => {
    const cache = new Map<number, T>();
    return (projectId: number) => {
      if (!cache.has(projectId)) cache.set(projectId, build(projectId));
      return cache.get(projectId) as T;
    };
  };

  return {
    projects,
    userCount: { projects: projectUsers, totalActiveUsers: customer.users, totalProjects: customer.projects },
    usersByType: {
      breakdown: [{ _id: 'Non-Admin', count: customer.users - admins }, { _id: 'Admin', count: admins }],
      totalUsers: customer.users,
      details: users.map((user, index) => ({ name: user.name, type: index < admins ? 'Admin' : 'Non-Admin' }))
    },
    lastLogin: users,
    lastExecution: perProject((projectId) => {
      const local = seeded(projectId);
      return users.slice(0, 8 + Math.floor(local() * 20)).map((user) => ({
        _id: user.id,
        createdAt: new Date(now - local() * local() * 120 * DAY).toISOString(),
        createdByName: user.name,
        code: `EX-${projectId}`,
        executionTypeCode: 'TC',
        result: local() < 0.8 ? 'PASSED' : 'FAILED'
      }));
    }),
    roles: perProject((projectId) => {
      const local = seeded(projectId * 3);
      return ROLES.map((role) => ({ _id: role, count: 1 + Math.floor(local() * 24), users: [] })).filter(() => local() < 0.85).sort((a, b) => b.count - a.count);
    }),
    customFields: perProject((projectId) => {
      const local = seeded(projectId * 5);
      return MODULES_WITH_FIELDS.map((module) => ({ _id: module, count: Math.floor(local() * 12) })).filter((row) => row.count > 0).sort((a, b) => b.count - a.count);
    }),
    autoLogging: [{
      autoLogging: projects.filter((_, index) => index % 3 === 0).length,
      total: projects.length,
      details: projects.map((project, index) => ({ name: project.name, mode: index % 3 === 0 ? 'Enabled' : 'Disabled' }))
    }],
    teams,
    featureUsage: { modules: FEATURE_MODULES, projects: usage, totals: FEATURE_MODULES.map((_, index) => usage.reduce((sum, row) => sum + row.counts[index], 0)) }
  };
}
