import { usersByProject } from './UsersByProject';
import { userDistributionByType } from './UserDistributionByType';
import { daysSinceLastLogin } from './DaysSinceLastLogin';
import { daysSinceLastExecution } from './DaysSinceLastExecution';
import { rolesInProject } from './RolesInProject';
import { customFieldsByModule } from './CustomFieldsByModule';
import { autoLoggingAdoption } from './AutoLoggingAdoption';
import { teamMemberBreakdown } from './TeamMemberBreakdown';
import { featureUsageByProject } from './FeatureUsageByProject';
import type { GraphDefinition } from './types';

export const GRAPHS: GraphDefinition[] = [
  usersByProject,
  userDistributionByType,
  daysSinceLastLogin,
  daysSinceLastExecution,
  rolesInProject,
  customFieldsByModule,
  autoLoggingAdoption,
  teamMemberBreakdown,
  featureUsageByProject
];
