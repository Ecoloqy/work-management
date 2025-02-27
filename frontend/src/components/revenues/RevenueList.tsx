import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  AccountBalance as AccountBalanceIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useFormik } from 'formik';
import * as yup from 'yup';

interface Workplace {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
}

interface Revenue {
  id: string;
  workplace_id: string;
  workplace_name: string;
  employee_id?: string;
  employee_name?: string;
  description: string;
  amount: number;
  date: string;
  created_at: string;
}

interface RevenueFormData {
  type: string;
  workplace_id: string;
  employee_id: string;
  description: string;
  amount: string;
  date: string;
}

const validationSchema = yup.object().shape({
  type: yup.string().required('Typ jest wymagany'),
  workplace_id: yup.string(),
  employee_id: yup.string(),
  description: yup.string(),
  amount: yup.string().required('Kwota jest wymagana'),
  date: yup.string().required('Data jest wymagana'),
});

export const RevenueList: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState<Revenue | null>(null);
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    fetchRevenues();
    fetchWorkplaces();
    fetchEmployees();
  }, []);

  const fetchRevenues = async () => {
    try {
      const response = await axios.get<Revenue[]>('/api/revenues');
      setRevenues(response.data);
      setError(null);
    } catch (err) {
      setError('Nie udało się pobrać listy przychodów');
      console.error('Error fetching revenues:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkplaces = async () => {
    try {
      const response = await axios.get('/api/workplaces');
      setWorkplaces(response.data);
    } catch (err) {
      console.error('Error fetching workplaces:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/employees');
      const mappedEmployees = response.data.map((emp: any) => ({
        id: emp.id,
        firstName: emp.first_name,
        lastName: emp.last_name
      }));
      setEmployees(mappedEmployees);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Nie udało się pobrać listy pracowników');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten przychód?')) {
      return;
    }

    try {
      await axios.delete(`/api/revenues/${id}`);
      setRevenues(revenues.filter(revenue => revenue.id !== id));
      setError(null);
    } catch (err) {
      setError('Nie udało się usunąć przychodu');
      console.error('Error deleting revenue:', err);
    }
  };

  const formik = useFormik<RevenueFormData>({
    initialValues: {
      type: 'workplace',
      workplace_id: '',
      employee_id: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
    },
    validationSchema,
    validate: (values: RevenueFormData) => {
      const errors: Partial<RevenueFormData> = {};
      
      if (values.type === 'workplace' && !values.workplace_id) {
        errors.workplace_id = 'Miejsce pracy jest wymagane';
      }
      
      if (values.type === 'employee' && !values.employee_id) {
        errors.employee_id = 'Pracownik jest wymagany';
      }
      
      return errors;
    },
    onSubmit: async (values: RevenueFormData) => {
      try {
        const payload = {
          type: values.type,
          workplace_id: values.type === 'workplace' ? values.workplace_id : null,
          employee_id: values.type === 'employee' ? values.employee_id : null,
          description: values.description,
          amount: parseFloat(values.amount),
          date: values.date,
        };

        if (editingRevenue) {
          await axios.put(`/api/revenues/${editingRevenue.id}`, payload);
        } else {
          await axios.post('/api/revenues', payload);
        }
        
        await fetchRevenues();
        handleCloseModal();
      } catch (err) {
        setError('Nie udało się zapisać przychodu');
        console.error('Error saving revenue:', err);
      }
    },
  });

  const handleEdit = (revenue: Revenue) => {
    setEditingRevenue(revenue);
    const date = new Date(revenue.date);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    formik.setValues({
      type: revenue.employee_id ? 'employee' : 'workplace',
      workplace_id: revenue.workplace_id.toString(),
      employee_id: revenue.employee_id?.toString() || '',
      description: revenue.description,
      amount: revenue.amount.toString(),
      date: date.toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRevenue(null);
    formik.resetForm();
  };

  const renderMobileView = () => (
    <Grid container spacing={2}>
      {revenues.map((revenue) => (
        <Grid item xs={12} key={revenue.id}>
          <Card>
            <CardContent key={`revenue-content-${revenue.id}`}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6">
                  {revenue.workplace_name}
                </Typography>
                <Box>
                  <IconButton onClick={() => handleEdit(revenue)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(revenue.id)} color="error" size="small">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DescriptionIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2">{revenue.description}</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2">{new Date(revenue.date).toLocaleDateString('pl-PL')}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <AccountBalanceIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2" color="success.main">
                  {revenue.amount.toFixed(2)} zł
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
      {revenues.length === 0 && (
        <Grid item xs={12}>
          <Typography variant="body1" textAlign="center">
            Brak przychodów
          </Typography>
        </Grid>
      )}
    </Grid>
  );

  const renderDesktopView = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Przychód</TableCell>
            <TableCell>Opis</TableCell>
            <TableCell>Data</TableCell>
            <TableCell align="right">Kwota</TableCell>
            <TableCell align="right">Akcje</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {revenues.map((revenue) => (
            <TableRow key={revenue.id}>
              <TableCell>{revenue.workplace_name ?? revenue.employee_name}</TableCell>
              <TableCell>{revenue.description}</TableCell>
              <TableCell>{new Date(revenue.date).toLocaleDateString('pl-PL')}</TableCell>
              <TableCell align="right" sx={{ color: 'success.main' }}>{revenue.amount.toFixed(2)}</TableCell>
              <TableCell align="right">
                <Tooltip title="Edytuj">
                  <IconButton onClick={() => handleEdit(revenue)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Usuń">
                  <IconButton onClick={() => handleDelete(revenue.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
          {revenues.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                Brak przychodów
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
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
        <Typography variant="h4">Przychody</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsModalOpen(true)}
        >
          Dodaj
        </Button>
      </Box>

      {isMobile ? renderMobileView() : renderDesktopView()}

      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingRevenue ? 'Edytuj przychód' : 'Dodaj przychód'}
          </DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="normal">
              <InputLabel id="type-label">Typ przychodu</InputLabel>
              <Select
                labelId="type-label"
                name="type"
                value={formik.values.type}
                onChange={formik.handleChange}
                error={formik.touched.type && Boolean(formik.errors.type)}
                label="Typ przychodu"
              >
                <MenuItem value="workplace">Miejsce pracy</MenuItem>
                <MenuItem value="employee">Pracownik</MenuItem>
              </Select>
              {formik.touched.type && formik.errors.type && (
                <FormHelperText error>{formik.errors.type}</FormHelperText>
              )}
            </FormControl>

            {formik.values.type === 'workplace' && (
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
                {formik.touched.workplace_id && formik.errors.workplace_id && (
                  <FormHelperText error>{formik.errors.workplace_id}</FormHelperText>
                )}
              </FormControl>
            )}

            {formik.values.type === 'employee' && (
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
                      {employee.firstName} {employee.lastName}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.employee_id && formik.errors.employee_id && (
                  <FormHelperText error>{formik.errors.employee_id}</FormHelperText>
                )}
              </FormControl>
            )}

            <TextField
              fullWidth
              margin="normal"
              label="Opis"
              name="description"
              multiline
              rows={2}
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Kwota"
              name="amount"
              type="number"
              value={formik.values.amount}
              onChange={formik.handleChange}
              error={formik.touched.amount && Boolean(formik.errors.amount)}
              helperText={formik.touched.amount && formik.errors.amount}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Data"
              name="date"
              type="date"
              value={formik.values.date}
              onChange={formik.handleChange}
              error={formik.touched.date && Boolean(formik.errors.date)}
              helperText={formik.touched.date && formik.errors.date}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Anuluj</Button>
            <Button type="submit" variant="contained">
              {editingRevenue ? 'Zapisz' : 'Dodaj'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}; 