import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  useMediaQuery,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  monthly_costs: number;
  monthly_revenues: number;
}

interface Workplace {
  id: number;
  name: string;
  location: string;
  description: string;
  monthly_costs: number;
  monthly_revenues: number;
}

export const Dashboard: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [employeesRes, workplacesRes] = await Promise.all([
          axios.get('/api/employees'),
          axios.get('/api/workplaces')
        ]);
        
        // Mapowanie danych z backendu
        const mappedEmployees = employeesRes.data.map((emp: any) => ({
          id: emp.id,
          firstName: emp.first_name,
          lastName: emp.last_name,
          email: emp.email,
          phone: emp.phone,
          monthly_costs: emp.monthly_costs || 0,
          monthly_revenues: emp.monthly_revenues || 0
        }));
        
        setEmployees(mappedEmployees);
        setWorkplaces(workplacesRes.data);
        setError(null);
      } catch (error) {
        console.error('Błąd podczas pobierania danych:', error);
        setError('Nie udało się pobrać danych. Spróbuj ponownie później.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNavigateToEmployees = () => {
    navigate('/dashboard/employees');
  };

  const handleNavigateToWorkplaces = () => {
    navigate('/dashboard/workplaces');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Panel główny
          </Typography>
        </Grid>
        
        {/* Sekcja pracowników */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                  Pracownicy
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PeopleIcon />}
                  onClick={handleNavigateToEmployees}
                  size="small"
                >
                  Zobacz wszystkich
                </Button>
              </Box>
              <Box sx={{ 
                maxHeight: isMobile ? '200px' : '400px', 
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#888',
                  borderRadius: '4px',
                },
              }}>
                {employees.length > 0 ? (
                  employees.slice(0, 5).map((employee) => (
                    <Card key={employee.id} sx={{ mb: 1, backgroundColor: theme.palette.grey[50] }}>
                      <CardContent>
                        <Typography variant="subtitle1">
                          {employee.firstName} {employee.lastName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {employee.email}
                        </Typography>
                        <Typography variant="body2">
                          Koszty: {employee.monthly_costs?.toFixed(2) || '0.00'} zł | 
                          Przychody: {employee.monthly_revenues?.toFixed(2) || '0.00'} zł
                        </Typography>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                    Brak pracowników
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sekcja miejsc pracy */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                  Miejsca pracy
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<BusinessIcon />}
                  onClick={handleNavigateToWorkplaces}
                  size="small"
                >
                  Zobacz wszystkie
                </Button>
              </Box>
              <Box sx={{ 
                maxHeight: isMobile ? '200px' : '400px', 
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#888',
                  borderRadius: '4px',
                },
              }}>
                {workplaces.length > 0 ? (
                  workplaces.slice(0, 5).map((workplace) => (
                    <Card key={workplace.id} sx={{ mb: 1, backgroundColor: theme.palette.grey[50] }}>
                      <CardContent>
                        <Typography variant="subtitle1">
                          {workplace.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Lokalizacja: {workplace.location}
                        </Typography>
                        <Typography variant="body2">
                          Koszty: {workplace.monthly_costs?.toFixed(2) || '0.00'} zł | 
                          Przychody: {workplace.monthly_revenues?.toFixed(2) || '0.00'} zł
                        </Typography>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                    Brak miejsc pracy
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}; 