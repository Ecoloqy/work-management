import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
  useMediaQuery,
  useTheme,
  IconButton,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

interface Workplace {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
}

interface Schedule {
  id: string;
  workplace_id: string;
  workplace_name: string;
  employee_id: string;
  employee_name: string;
  date: string;
  hours: number;
  created_at: string;
}

interface ScheduleFormData {
  workplace_id: string;
  employee_id: string;
  date: string;
  hours: number;
}

const validationSchema = yup.object({
  workplace_id: yup.string().required('Miejsce pracy jest wymagane'),
  employee_id: yup.string().required('Pracownik jest wymagany'),
  date: yup.string().required('Data jest wymagana'),
  hours: yup.number()
    .required('Liczba godzin jest wymagana')
    .min(0.5, 'Minimalna liczba godzin to 0.5')
    .max(24, 'Maksymalna liczba godzin to 24')
});

export const ScheduleList: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik<ScheduleFormData>({
    initialValues: {
      workplace_id: '',
      employee_id: '',
      date: '',
      hours: 8
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        if (editingSchedule) {
          await axios.put(`/api/schedules/${editingSchedule.id}`, values);
        } else {
          await axios.post('/api/schedules', values);
        }
        fetchSchedules();
        handleCloseModal();
      } catch (error: any) {
        console.error('Błąd podczas zapisywania grafiku:', error);
        setError(error.response?.data?.error || 'Wystąpił błąd podczas zapisywania grafiku');
      }
    },
  });

  useEffect(() => {
    fetchSchedules();
    fetchWorkplaces();
    fetchEmployees();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get('/api/schedules');
      setSchedules(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Błąd podczas pobierania grafików:', error);
      setError('Nie udało się pobrać grafików');
      setLoading(false);
    }
  };

  const fetchWorkplaces = async () => {
    try {
      const response = await axios.get('/api/workplaces');
      setWorkplaces(response.data);
    } catch (error) {
      console.error('Błąd podczas pobierania miejsc pracy:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Błąd podczas pobierania pracowników:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten grafik?')) {
      try {
        await axios.delete(`/api/schedules/${id}`);
        fetchSchedules();
      } catch (error) {
        console.error('Błąd podczas usuwania grafiku:', error);
        setError('Nie udało się usunąć grafiku');
      }
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    formik.setValues({
      workplace_id: schedule.workplace_id,
      employee_id: schedule.employee_id,
      date: schedule.date.split('T')[0],
      hours: schedule.hours
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSchedule(null);
    formik.resetForm();
  };

  const renderMobileView = () => (
    <Box>
      {schedules.map((schedule) => (
        <Card key={schedule.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {schedule.workplace_name}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Pracownik: {schedule.employee_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Data: {new Date(schedule.date).toLocaleDateString('pl-PL')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Godziny: {schedule.hours}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <IconButton size="small" onClick={() => handleEdit(schedule)}>
                <EditIcon />
              </IconButton>
              <IconButton size="small" onClick={() => handleDelete(schedule.id)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  const renderDesktopView = () => (
    <Grid container spacing={3}>
      {schedules.map((schedule) => (
        <Grid item xs={12} md={6} lg={4} key={schedule.id}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {schedule.workplace_name}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Pracownik: {schedule.employee_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Data: {new Date(schedule.date).toLocaleDateString('pl-PL')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Godziny: {schedule.hours}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <IconButton size="small" onClick={() => handleEdit(schedule)}>
                  <EditIcon />
                </IconButton>
                <IconButton size="small" onClick={() => handleDelete(schedule.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  if (loading) {
    return <Typography>Ładowanie...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Grafik</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsModalOpen(true)}
        >
          Dodaj
        </Button>
      </Box>

      {schedules.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
          Brak zaplanowanych grafików
        </Typography>
      ) : (
        isMobile ? renderMobileView() : renderDesktopView()
      )}

      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingSchedule ? 'Edytuj grafik' : 'Dodaj grafik'}
          </DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="normal">
              <InputLabel id="workplace-label">Miejsce pracy</InputLabel>
              <Select
                labelId="workplace-label"
                name="workplace_id"
                value={formik.values.workplace_id}
                onChange={formik.handleChange}
                error={formik.touched.workplace_id && Boolean(formik.errors.workplace_id)}
                label="Miejsce pracy"
              >
                {workplaces.map((workplace) => (
                  <MenuItem key={workplace.id} value={workplace.id}>
                    {workplace.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel id="employee-label">Pracownik</InputLabel>
              <Select
                labelId="employee-label"
                name="employee_id"
                value={formik.values.employee_id}
                onChange={formik.handleChange}
                error={formik.touched.employee_id && Boolean(formik.errors.employee_id)}
                label="Pracownik"
              >
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {`${employee.first_name} ${employee.last_name}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              margin="normal"
              label="Data"
              type="date"
              name="date"
              value={formik.values.date}
              onChange={formik.handleChange}
              error={formik.touched.date && Boolean(formik.errors.date)}
              helperText={formik.touched.date && formik.errors.date}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Liczba godzin"
              type="number"
              name="hours"
              value={formik.values.hours}
              onChange={formik.handleChange}
              error={formik.touched.hours && Boolean(formik.errors.hours)}
              helperText={formik.touched.hours && formik.errors.hours}
              inputProps={{
                step: 0.5,
                min: 0.5,
                max: 24
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Anuluj</Button>
            <Button type="submit" variant="contained">
              {editingSchedule ? 'Zapisz' : 'Dodaj'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}; 