import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Alert,
  Tooltip as MuiTooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import { adminApi, AdminUserPayload, DailyAnalyticsEntry } from '../../services/adminService';
import type { User } from '../../types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';

interface UserFormState {
  name: string;
  email: string;
  password: string;
  age?: number;
  role: 'admin' | 'user';
}

const emptyForm: UserFormState = {
  name: '',
  email: '',
  password: '',
  role: 'user',
};

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<DailyAnalyticsEntry[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [analyticsRange, setAnalyticsRange] = useState(7);
  const [formState, setFormState] = useState<UserFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      setError(null);
      setSuccessMessage(null);
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Benutzer konnten nicht geladen werden.');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const loadAnalytics = useCallback(
    async (range = analyticsRange) => {
      try {
        setAnalyticsLoading(true);
        setAnalyticsError(null);
        const response = await adminApi.getDailyAnalytics({ range });
        setAnalytics(response.data);
      } catch (err: any) {
        setAnalyticsError(err?.response?.data?.message ?? 'Analytics konnten nicht geladen werden.');
      } finally {
        setAnalyticsLoading(false);
      }
    },
    [analyticsRange]
  );

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleOpenCreate = () => {
    setFormState(emptyForm);
    setCreateDialogOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setFormState({
      name: user.name,
      email: user.email,
      password: '',
      age: user.age,
      role: user.role,
    });
    setEditDialogOpen(true);
  };

  const handleCloseDialogs = () => {
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setSelectedUser(null);
    setFormState(emptyForm);
  };

  const handleFormChange = (field: keyof UserFormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'age' ? Number(event.target.value) : event.target.value;
    setFormState((prev) => ({
      ...prev,
      [field]: value === '' ? undefined : value,
    }));
  };

  const handleCreateUser = async () => {
    try {
      setSaving(true);
      const payload: AdminUserPayload = {
        name: formState.name.trim(),
        email: formState.email.trim().toLowerCase(),
        password: formState.password,
        age: formState.age,
        role: formState.role,
      };
      await adminApi.createUser(payload);
      await loadUsers();
      setSuccessMessage('Benutzer wurde erstellt.');
      handleCloseDialogs();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Benutzer konnte nicht erstellt werden.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) {
      return;
    }
    try {
      setSaving(true);
      const payload: AdminUserPayload = {
        name: formState.name.trim(),
        email: formState.email.trim().toLowerCase(),
        age: formState.age,
        role: formState.role,
      };
      if (formState.password) {
        payload.password = formState.password;
      }
      await adminApi.updateUser(selectedUser._id, payload);
      await loadUsers();
      setSuccessMessage('Benutzer wurde aktualisiert.');
      handleCloseDialogs();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Benutzer konnte nicht aktualisiert werden.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      setError(null);
      setSuccessMessage(null);
      setDeletingUserId(user._id);
      await adminApi.deleteUser(user._id);
      setSuccessMessage(`Benutzer "${user.name}" wurde gelöscht.`);
      await loadUsers();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Benutzer konnte nicht gelöscht werden.');
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleRangeChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const range = Number(event.target.value);
    setAnalyticsRange(range);
    await loadAnalytics(range);
  };

  const analyticsSummary = useMemo(() => {
    if (!analytics.length) {
      return { active: 0, completed: 0, aborted: 0 };
    }
    return analytics.reduce(
      (acc, day) => ({
        active: acc.active + day.dailyActiveUsers,
        completed: acc.completed + day.completedExercises,
        aborted: acc.aborted + day.abortedExercises,
      }),
      { active: 0, completed: 0, aborted: 0 }
    );
  }, [analytics]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Verwalte Benutzer und analysiere tägliche Aktivitäten.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => loadAnalytics()} disabled={analyticsLoading}>
            Analytics aktualisieren
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Benutzer anlegen
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Benutzerverwaltung
                </Typography>
                <IconButton aria-label="Benutzer neu laden" onClick={loadUsers}>
                  <RefreshIcon />
                </IconButton>
              </Stack>
              {usersLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : users.length === 0 ? (
                <Typography color="text.secondary">Keine Benutzer gefunden.</Typography>
              ) : (
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                  <Box component="thead" sx={{ backgroundColor: 'grey.100' }}>
                    <Box component="tr">
                      <Box component="th" sx={{ textAlign: 'left', p: 1.5 }}>Name</Box>
                      <Box component="th" sx={{ textAlign: 'left', p: 1.5 }}>E-Mail</Box>
                      <Box component="th" sx={{ textAlign: 'left', p: 1.5 }}>Rolle</Box>
                      <Box component="th" sx={{ textAlign: 'left', p: 1.5 }}>Level</Box>
                      <Box component="th" sx={{ textAlign: 'left', p: 1.5 }}>Punkte</Box>
                      <Box component="th" sx={{ textAlign: 'center', p: 1.5 }}>Aktionen</Box>
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {users.map((userItem) => (
                      <Box component="tr" key={userItem._id} sx={{ '&:nth-of-type(even)': { backgroundColor: 'grey.50' } }}>
                        <Box component="td" sx={{ p: 1.5 }}>{userItem.name}</Box>
                        <Box component="td" sx={{ p: 1.5 }}>{userItem.email}</Box>
                        <Box component="td" sx={{ p: 1.5, textTransform: 'capitalize' }}>{userItem.role}</Box>
                        <Box component="td" sx={{ p: 1.5 }}>{userItem.level}</Box>
                        <Box component="td" sx={{ p: 1.5 }}>{userItem.points}</Box>
                        <Box component="td" sx={{ p: 1.5 }}>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="center">
                            <MuiTooltip title="Benutzer bearbeiten">
                              <span>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<EditIcon />}
                                  onClick={() => handleOpenEdit(userItem)}
                                >
                                  Bearbeiten
                                </Button>
                              </span>
                            </MuiTooltip>
                            <MuiTooltip title="Benutzer löschen">
                              <span>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="error"
                                  startIcon={deletingUserId === userItem._id ? undefined : <DeleteIcon />}
                                  onClick={() => handleDeleteUser(userItem)}
                                  disabled={deletingUserId === userItem._id}
                                >
                                  {deletingUserId === userItem._id ? <CircularProgress size={18} color="inherit" /> : 'Löschen'}
                                </Button>
                              </span>
                            </MuiTooltip>
                          </Stack>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Analytics Übersicht
                </Typography>
                <TextField
                  select
                  size="small"
                  label="Zeitraum"
                  value={analyticsRange}
                  onChange={handleRangeChange}
                >
                  {[7, 14, 30].map((range) => (
                    <MenuItem key={range} value={range}>
                      Letzte {range} Tage
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              {analyticsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : analyticsError ? (
                <Alert severity="error">{analyticsError}</Alert>
              ) : (
                <Stack spacing={2}>
                  <Typography variant="body1">
                    Gesamt aktive Nutzer: <strong>{analyticsSummary.active}</strong>
                  </Typography>
                  <Typography variant="body1">
                    Abgeschlossene Übungen: <strong>{analyticsSummary.completed}</strong>
                  </Typography>
                  <Typography variant="body1">
                    Abgebrochene Übungen: <strong>{analyticsSummary.aborted}</strong>
                  </Typography>
                </Stack>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Daily Active Users
              </Typography>
              {analyticsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <RechartsTooltip labelFormatter={(label) => `Tag: ${label}`} />
                      <Legend />
                      <Line type="monotone" dataKey="dailyActiveUsers" name="Aktive Nutzer" stroke="#2d7d7d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Abgeschlossene vs. Abgebrochene Übungen
              </Typography>
              {analyticsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <RechartsTooltip labelFormatter={(label) => `Tag: ${label}`} />
                      <Legend />
                      <Bar dataKey="completedExercises" name="Abgeschlossen" fill="#4caf50" />
                      <Bar dataKey="abortedExercises" name="Abgebrochen" fill="#f44336" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={createDialogOpen} onClose={handleCloseDialogs} fullWidth maxWidth="sm">
        <DialogTitle>Benutzer erstellen</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={formState.name} onChange={handleFormChange('name')} fullWidth required />
            <TextField label="E-Mail" type="email" value={formState.email} onChange={handleFormChange('email')} fullWidth required />
            <TextField label="Passwort" type="password" value={formState.password} onChange={handleFormChange('password')} fullWidth required />
            <TextField label="Alter" type="number" value={formState.age ?? ''} onChange={handleFormChange('age')} fullWidth />
            <TextField select label="Rolle" value={formState.role} onChange={handleFormChange('role')} fullWidth>
              <MenuItem value="user">Benutzer</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Abbrechen</Button>
          <Button variant="contained" onClick={handleCreateUser} disabled={saving}>
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={handleCloseDialogs} fullWidth maxWidth="sm">
        <DialogTitle>Benutzer bearbeiten</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={formState.name} onChange={handleFormChange('name')} fullWidth required />
            <TextField label="E-Mail" type="email" value={formState.email} onChange={handleFormChange('email')} fullWidth required />
            <TextField
              label="Neues Passwort"
              type="password"
              value={formState.password}
              onChange={handleFormChange('password')}
              fullWidth
              helperText="Leer lassen, um das Passwort nicht zu ändern"
            />
            <TextField label="Alter" type="number" value={formState.age ?? ''} onChange={handleFormChange('age')} fullWidth />
            <TextField select label="Rolle" value={formState.role} onChange={handleFormChange('role')} fullWidth>
              <MenuItem value="user">Benutzer</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Abbrechen</Button>
          <Button variant="contained" onClick={handleUpdateUser} disabled={saving}>
            Aktualisieren
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
