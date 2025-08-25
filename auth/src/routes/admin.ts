import { Router, Request, Response, NextFunction } from 'express';
import { KeycloakAdminClient } from '../services/KeycloakAdminClient';

const router = Router({ mergeParams: true });
const keycloakAdminClient = new KeycloakAdminClient();

// Placeholder admin check middleware
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // In a real app, you would validate the JWT and check for an admin role.
  // For now, we'll just assume the user is an admin.
  next();
};

router.use(isAdmin);

router.post('/teams', async (req, res) => {
  const { realm } = req.params as { realm: string };
  const { name, clientId } = req.body;
  try {
    await keycloakAdminClient.createGroup(realm, name);
    await keycloakAdminClient.createRole(realm, clientId, name);
    res.json({ success: true, data: 'Team created successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/teams/:teamName', async (req, res) => {
  const { realm, teamName } = req.params as { realm: string, teamName: string };
  const { name, clientId } = req.body;
  try {
    const group = await keycloakAdminClient.getGroupByName(realm, teamName);
    await keycloakAdminClient.deleteGroup(realm, group.id);
    await keycloakAdminClient.deleteRole(realm, clientId, name);
    res.json({ success: true, data: 'Team deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/teams/:teamName/users/:userId', async (req, res) => {
  const { realm, teamName, userId } = req.params as { realm: string, teamName: string, userId: string };
  const { roleName, clientId } = req.body;
  try {
    const group = await keycloakAdminClient.getGroupByName(realm, teamName);
    await keycloakAdminClient.assignUserToGroup(realm, userId, group.id);
    await keycloakAdminClient.assignRoleToUser(realm, clientId, userId, roleName);
    res.json({ success: true, data: 'User added to team successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/teams/:teamName/users/:userId', async (req, res) => {
  const { realm, teamName, userId } = req.params as { realm: string, teamName: string, userId: string };
  const { roleName, clientId } = req.body;
  try {
    const group = await keycloakAdminClient.getGroupByName(realm, teamName);
    await keycloakAdminClient.removeUserFromGroup(realm, userId, group.id);
    await keycloakAdminClient.removeRoleFromUser(realm, clientId, userId, roleName);
    res.json({ success: true, data: 'User removed from team successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/users/:userId/roles', async (req, res) => {
  const { realm, userId } = req.params as { realm: string, userId: string };
  const { roleName, clientId } = req.body;
  try {
    await keycloakAdminClient.assignRoleToUser(realm, clientId, userId, roleName);
    res.json({ success: true, data: 'Role assigned successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/users/:userId/roles/:roleName', async (req, res) => {
  const { realm, userId, roleName } = req.params as { realm: string, userId: string, roleName: string };
  const { clientId } = req.body;
  try {
    await keycloakAdminClient.removeRoleFromUser(realm, clientId, userId, roleName);
    res.json({ success: true, data: 'Role removed successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
