export interface Project { id: number; name: string; }
export interface UserCountByProject { projects: { _id: string; count: number }[]; totalActiveUsers: number; totalProjects: number; }
export interface UsersByType { breakdown: { _id: string; count: number }[]; totalUsers: number; details: { name: string; type: string }[]; }
export interface UserLogin { id: number; name: string; email: string; lastLoginAt: string | null; }
export interface RoleRow { _id: string; count: number; users: string[]; }
export interface CountRow { _id: string; count: number; }
export interface AutoLogging { autoLogging: number; total: number; details: { name: string; mode: string }[]; }
export interface Team { _id: string; teamId: number; members: { userId: number; name: string; email: string }[]; }
export interface LastExecution { _id: number; createdAt: string; createdByName: string; code: string; executionTypeCode: string; result: string; }
export interface FeatureUsage { modules: string[]; projects: { projectId: number; projectName: string; counts: number[]; total: number; modulesUsed: number }[]; totals: number[]; }
