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
  LocationOn as LocationIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useFormik } from 'formik';
import * as yup from 'yup';

interface Workplace {
  id: number;
  name: string;
  location: string;
  description: string;
  monthly_costs: number;
  monthly_revenues: number;
}

interface WorkplaceFormData {
  name: string;
  location: string;
  description: string;
}

const validationSchema = yup.object({
  name: yup.string().required('Nazwa jest wymagana'),
  location: yup.string().required('Lokalizacja jest wymagana'),
  description: yup.string(),
});

export const WorkplaceList: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkplace, setEditingWorkplace] = useState<Workplace | null>(null);

  useEffect(() => {
    fetchWorkplaces();
  }, []);

  const fetchWorkplaces = async () => {
    try {
      const response = await axios.get<Workplace[]>('/api/workplaces');
      setWorkplaces(response.data);
      setError(null);
    } catch (err) {
      setError('Nie udało się pobrać listy miejsc pracy');
      console.error('Error fetching workplaces:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Czy na pewno chcesz usunąć to miejsce pracy?')) {
      return;
    }

    try {
      await axios.delete(`/api/workplaces/${id}`);
      setWorkplaces(workplaces.filter(wp => wp.id !== id));
      setError(null);
    } catch (err) {
      setError('Nie udało się usunąć miejsca pracy');
      console.error('Error deleting workplace:', err);
    }
  };

  const formik = useFormik<WorkplaceFormData>({
    initialValues: {
      name: '',
      location: '',
      description: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editingWorkplace) {
          // Edycja istniejącego miejsca pracy
          const response = await axios.put(`/api/workplaces/${editingWorkplace.id}`, {
            name: values.name,
            location: values.location,
            description: values.description,
          });
          setWorkplaces(workplaces.map(wp => 
            wp.id === editingWorkplace.id 
              ? { ...response.data, monthly_costs: wp.monthly_costs, monthly_revenues: wp.monthly_revenues }
              : wp
          ));
        } else {
          // Dodawanie nowego miejsca pracy
          const response = await axios.post('/api/workplaces', {
            name: values.name,
            location: values.location,
            description: values.description,
          });
          const newWorkplace = {
            ...response.data,
            monthly_costs: 0,
            monthly_revenues: 0
          };
          setWorkplaces([...workplaces, newWorkplace]);
        }
        setIsModalOpen(false);
        setEditingWorkplace(null);
        resetForm();
      } catch (err) {
        setError('Nie udało się zapisać miejsca pracy');
        console.error('Error saving workplace:', err);
      }
    },
  });

  const handleEdit = (workplace: Workplace) => {
    setEditingWorkplace(workplace);
    formik.setValues({
      name: workplace.name,
      location: workplace.location,
      description: workplace.description,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingWorkplace(null);
    formik.resetForm();
  };

  const renderMobileView = () => (
    <Grid container spacing={2}>
      {workplaces.map((workplace) => (
        <Grid item xs={12} key={workplace.id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6">
                  {workplace.name}
                </Typography>
                <Box>
                  <IconButton onClick={() => handleEdit(workplace)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(workplace.id)} color="error" size="small">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2">{workplace.location}</Typography>
              </Box>

              {workplace.description && (
                <Box sx={{ mt: 2, mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                    Opis:
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {workplace.description}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <AccountBalanceIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Koszty: {workplace.monthly_costs.toFixed(2)} zł
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Przychody: {workplace.monthly_revenues.toFixed(2)} zł
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
      {workplaces.length === 0 && (
        <Grid item xs={12}>
          <Typography variant="body1" textAlign="center">
            Brak miejsc pracy
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
            <TableCell>Nazwa</TableCell>
            <TableCell>Lokalizacja</TableCell>
            <TableCell>Opis</TableCell>
            <TableCell align="right">Koszty (PLN)</TableCell>
            <TableCell align="right">Przychody (PLN)</TableCell>
            <TableCell align="right">Akcje</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {workplaces.map((workplace) => (
            <TableRow key={workplace.id}>
              <TableCell>{workplace.name}</TableCell>
              <TableCell>{workplace.location}</TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    maxWidth: 300,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {workplace.description || '-'}
                </Typography>
              </TableCell>
              <TableCell align="right">{workplace.monthly_costs.toFixed(2)}</TableCell>
              <TableCell align="right">{workplace.monthly_revenues.toFixed(2)}</TableCell>
              <TableCell align="right">
                <Tooltip title="Edytuj">
                  <IconButton onClick={() => handleEdit(workplace)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Usuń">
                  <IconButton onClick={() => handleDelete(workplace.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
          {workplaces.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                Brak miejsc pracy
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
        <Typography variant="h4">Lista miejsc pracy</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsModalOpen(true)}
        >
          Dodaj miejsce pracy
        </Button>
      </Box>

      {isMobile ? renderMobileView() : renderDesktopView()}

      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingWorkplace ? 'Edytuj miejsce pracy' : 'Dodaj miejsce pracy'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              margin="normal"
              label="Nazwa"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Lokalizacja"
              name="location"
              value={formik.values.location}
              onChange={formik.handleChange}
              error={formik.touched.location && Boolean(formik.errors.location)}
              helperText={formik.touched.location && formik.errors.location}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Opis"
              name="description"
              multiline
              rows={4}
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Anuluj</Button>
            <Button type="submit" variant="contained">
              {editingWorkplace ? 'Zapisz' : 'Dodaj'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}; 