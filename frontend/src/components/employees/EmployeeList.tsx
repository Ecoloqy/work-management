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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useFormik } from 'formik';
import * as yup from 'yup';

interface EmployeeResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  monthly_costs: number;
  monthly_revenues: number;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  monthly_costs: number;
  monthly_revenues: number;
}

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const validationSchema = yup.object({
  firstName: yup.string().required('Imię jest wymagane'),
  lastName: yup.string().required('Nazwisko jest wymagane'),
  email: yup.string().email('Nieprawidłowy format email').required('Email jest wymagany'),
  phone: yup.string(),
});

export const EmployeeList: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get<EmployeeResponse[]>('/api/employees');
      const mappedEmployees = response.data.map(emp => ({
        id: emp.id,
        firstName: emp.first_name,
        lastName: emp.last_name,
        email: emp.email,
        phone: emp.phone,
        monthly_costs: emp.monthly_costs || 0,
        monthly_revenues: emp.monthly_revenues || 0
      }));
      setEmployees(mappedEmployees);
      setError(null);
    } catch (err) {
      setError('Nie udało się pobrać listy pracowników');
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tego pracownika?')) {
      return;
    }

    try {
      await axios.delete(`/api/employees/${id}`);
      setEmployees(employees.filter(emp => emp.id !== id));
      setError(null);
    } catch (err) {
      setError('Nie udało się usunąć pracownika');
      console.error('Error deleting employee:', err);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    formik.setValues({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone || '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    formik.resetForm();
  };

  const formik = useFormik<EmployeeFormData>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editingEmployee) {
          // Edycja istniejącego pracownika
          const response = await axios.put(`/api/employees/${editingEmployee.id}`, {
            first_name: values.firstName,
            last_name: values.lastName,
            email: values.email,
            phone: values.phone,
          });
          setEmployees(employees.map(emp => 
            emp.id === editingEmployee.id 
              ? { 
                  ...response.data,
                  firstName: response.data.first_name,
                  lastName: response.data.last_name,
                  monthly_costs: emp.monthly_costs,
                  monthly_revenues: emp.monthly_revenues
                }
              : emp
          ));
        } else {
          // Dodawanie nowego pracownika
          const response = await axios.post('/api/employees', {
            first_name: values.firstName,
            last_name: values.lastName,
            email: values.email,
            phone: values.phone,
          });
          const newEmployee = {
            ...response.data,
            firstName: response.data.first_name,
            lastName: response.data.last_name,
            monthly_costs: 0,
            monthly_revenues: 0
          };
          setEmployees([...employees, newEmployee]);
        }
        setIsModalOpen(false);
        setEditingEmployee(null);
        resetForm();
      } catch (err) {
        setError('Nie udało się zapisać pracownika');
        console.error('Error saving employee:', err);
      }
    },
  });

  const renderMobileView = () => (
    <Grid container spacing={2}>
      {employees.map((employee) => (
        <Grid item xs={12} key={employee.id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6">
                  {employee.firstName} {employee.lastName}
                </Typography>
                <Box>
                  <IconButton onClick={() => handleEdit(employee)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(employee.id)} color="error" size="small">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmailIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2">{employee.email}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PhoneIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2">{employee.phone || 'Brak numeru'}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <AccountBalanceIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Koszty: {employee.monthly_costs.toFixed(2)} zł
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Przychody: {employee.monthly_revenues.toFixed(2)} zł
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
      {employees.length === 0 && (
        <Grid item xs={12}>
          <Typography variant="body1" textAlign="center">
            Brak pracowników
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
            <TableCell>Imię i nazwisko</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Telefon</TableCell>
            <TableCell align="right">Koszty</TableCell>
            <TableCell align="right">Przychody</TableCell>
            <TableCell align="right">Akcje</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>
                {employee.firstName} {employee.lastName}
              </TableCell>
              <TableCell>{employee.email}</TableCell>
              <TableCell>{employee.phone}</TableCell>
              <TableCell align="right">{employee.monthly_costs.toFixed(2)}</TableCell>
              <TableCell align="right">{employee.monthly_revenues.toFixed(2)}</TableCell>
              <TableCell align="right">
                <Tooltip title="Edytuj">
                  <IconButton onClick={() => handleEdit(employee)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Usuń">
                  <IconButton onClick={() => handleDelete(employee.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
          {employees.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                Brak pracowników
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
        <Typography variant="h4">Pracownicy</Typography>
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
            {editingEmployee ? 'Edytuj pracownika' : 'Dodaj pracownika'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              margin="normal"
              label="Imię"
              name="firstName"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              error={formik.touched.firstName && Boolean(formik.errors.firstName)}
              helperText={formik.touched.firstName && formik.errors.firstName}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Nazwisko"
              name="lastName"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Telefon"
              name="phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              helperText={formik.touched.phone && formik.errors.phone}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Anuluj</Button>
            <Button type="submit" variant="contained">
              {editingEmployee ? 'Zapisz' : 'Dodaj'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}; 