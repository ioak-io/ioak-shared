import { Router, Request, Response, NextFunction } from 'express';
import { KeycloakAdminClient } from '../services/KeycloakAdminClient';
import { jwtDecode } from 'jwt-decode';

const router = Router({ mergeParams: true });
const keycloakAdminClient = new KeycloakAdminClient();

// Function to extract token from request
const getTokenFromHeader = (req: Request) => {
  const authorization = req.headers.authorization;
  if (authorization && authorization.split(' ')[0] === 'Bearer') {
    return authorization.split(' ')[1];
  }
  return null;
};

// isAdmin check middleware
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const token = getTokenFromHeader(req);
  if (!token) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const decoded: any = jwtDecode(token);
    if (decoded.resource_access?.["realm-management"]?.roles?.includes('realm-admin')) {
      next();
    } else {
      res.status(403).send('Forbidden');
    }
  } catch (error) {
    res.status(401).send('Unauthorized');
  }
};

router.use(isAdmin);

router.post('/team/:teamName', async (req, res) => {
  const { realm, teamName } = req.params as { realm: string, teamName: string };
  const { clientId, roles: desiredRoles, groups: desiredGroups } = req.body;

  // Validate teamName
  if (!/^[a-z]+$/.test(teamName)) {
    return res.status(400).json({ success: false, error: 'Team name must be lowercase alphabetic characters only.' });
  }

  try {
    const teamNamePrefix = `${teamName}-`;

    // --- Handle Groups ---
    const existingGroups = await keycloakAdminClient.getGroupsByPrefix(realm, teamNamePrefix);
    const desiredGroupNames = desiredGroups.map((g: any) => `${teamNamePrefix}${g.name}`);

    // Delete groups no longer desired
    for (const existingGroup of existingGroups) {
      if (!desiredGroupNames.includes(existingGroup.name)) {
        await keycloakAdminClient.deleteGroup(realm, existingGroup.id);
      }
    }

    // Create new groups and get IDs for existing ones
    const managedGroups: { [key: string]: any } = {};
    for (const desiredGroup of desiredGroups) {
      const groupFullName = `${teamNamePrefix}${desiredGroup.name}`;
      let group = existingGroups.find((g: any) => g.name === groupFullName);
      if (!group) {
        group = await keycloakAdminClient.createGroup(realm, groupFullName);
      }
      managedGroups[groupFullName] = group;
    }

    // --- Handle Roles ---
    const existingRoles = await keycloakAdminClient.getRolesByPrefix(realm, clientId, teamNamePrefix);
    const desiredRoleNames = desiredRoles.map((r: string) => `${teamNamePrefix}${r}`);

    // Delete roles no longer desired
    for (const existingRole of existingRoles) {
      if (!desiredRoleNames.includes(existingRole.name)) {
        await keycloakAdminClient.deleteRole(realm, clientId, existingRole.name);
      }
    }

    // Create new roles
    const createdOrExistingRoles: { [key: string]: any } = {};
    for (const desiredRole of desiredRoles) {
      const roleFullName = `${teamNamePrefix}${desiredRole}`;
      let role = await keycloakAdminClient.findRoleByName(realm, clientId, roleFullName);
      if (!role) {
        role = await keycloakAdminClient.createRole(realm, clientId, roleFullName);
      }
      createdOrExistingRoles[roleFullName] = role;
    }

    // --- Link Roles to Groups ---
    for (const desiredGroup of desiredGroups) {
      const groupFullName = `${teamNamePrefix}${desiredGroup.name}`;
      const group = managedGroups[groupFullName];
      if (!group) continue; // Should not happen if logic above is correct

      const existingGroupRoles = await keycloakAdminClient.getGroupRoles(realm, group.id, clientId);
      const existingGroupRoleNames = existingGroupRoles.map((r: any) => r.name);

      // Add roles to group
      for (const roleName of desiredGroup.roles) {
        const roleFullName = `${teamNamePrefix}${roleName}`;
        if (!existingGroupRoleNames.includes(roleFullName)) {
          await keycloakAdminClient.assignRoleToGroup(realm, group.id, clientId, roleFullName);
        }
      }

      // Remove roles from group
      for (const existingRoleName of existingGroupRoleNames) {
        if (!desiredGroup.roles.map((r: string) => `${teamNamePrefix}${r}`).includes(existingRoleName) && existingRoleName.startsWith(teamNamePrefix)) {
          await keycloakAdminClient.removeRoleFromGroup(realm, group.id, clientId, existingRoleName);
        }
      }
    }

    res.json({ success: true, data: 'Team, groups, and roles managed successfully', createdRoles: desiredRoleNames, createdGroups: desiredGroups.map((g: any) => ({ name: `${teamNamePrefix}${g.name}`, roles: g.roles.map((r: string) => `${teamNamePrefix}${r}`) })) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/team/:teamName', async (req, res) => {
  const { realm, teamName } = req.params as { realm: string, teamName: string };
  const { clientId } = req.body;
  try {
    const groups = await keycloakAdminClient.getGroupsByPrefix(realm, `${teamName}-`);
    const deletedGroups: string[] = [];
    for (const group of groups) {
      await keycloakAdminClient.deleteGroup(realm, group.id);
      deletedGroups.push(group.name);
    }
    const roles = await keycloakAdminClient.getRolesByPrefix(realm, clientId, `${teamName}-`);
    const deletedRoles: string[] = [];
    for (const role of roles) {
      await keycloakAdminClient.deleteRole(realm, clientId, role.name);
      deletedRoles.push(role.name);
    }
    res.json({ success: true, data: 'Teams and roles deleted successfully', deletedGroups, deletedRoles });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/team/:teamName/users/:userId', async (req, res) => {
  const { realm, teamName, userId } = req.params as { realm: string, teamName: string, userId: string };
  const groupNames: string[] = req.body;
  try {
    for (const groupName of groupNames) {
      let processedGroupName = groupName;
      if (processedGroupName.startsWith(`${teamName}-`)) {
        processedGroupName = processedGroupName.substring(teamName.length + 1);
      }
      processedGroupName = `${teamName}-${processedGroupName}`;
      const group = await keycloakAdminClient.getGroupByName(realm, processedGroupName);
      await keycloakAdminClient.assignUserToGroup(realm, userId, group.id);
    }
    res.json({ success: true, data: 'User added to teams successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/team/:teamName/users/:userId', async (req, res) => {
  const { realm, teamName, userId } = req.params as { realm: string, teamName: string, userId: string };
  const groupNames: string[] = req.body;
  try {
    for (const groupName of groupNames) {
      let processedGroupName = groupName;
      if (processedGroupName.startsWith(`${teamName}-`)) {
        processedGroupName = processedGroupName.substring(teamName.length + 1);
      }
      processedGroupName = `${teamName}-${processedGroupName}`;
      const group = await keycloakAdminClient.getGroupByName(realm, processedGroupName);
      await keycloakAdminClient.removeUserFromGroup(realm, userId, group.id);
    }
    res.json({ success: true, data: 'User removed from teams successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
