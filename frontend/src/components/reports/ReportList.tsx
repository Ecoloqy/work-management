import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  useTheme,
  CircularProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';
import axios from 'axios';

interface ReportFilters {
  startDate: string;
  endDate: string;
  type: 'workplace' | 'employee' | 'all';
}

interface WorkplaceStats {
  name: string;
  total_costs: number;
  total_profit: number;
  total_revenues: number;
}

interface EmployeeStats {
  name: string;
  total_costs: number;
  total_revenues: number;
  total_profit: number;
  total_hours: number;
}

interface ReportData {
  workplaces: WorkplaceStats[];
  employees: EmployeeStats[];
}

export const ReportList: React.FC = () => {
  const theme = useTheme();
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: '',
    endDate: '',
    type: 'all',
  });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilterChange = (field: keyof ReportFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const generateReport = async () => {
    if (!filters.startDate || !filters.endDate) {
      setError('Wybierz zakres dat');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/reports/stats', {
        start_date: filters.startDate,
        end_date: filters.endDate,
        type: filters.type
      });
      setData(response.data);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Wystąpił błąd podczas generowania raportu');
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = async () => {
    if (!filters.startDate || !filters.endDate) {
      setError('Wybierz zakres dat');
      return;
    }

    try {
      const response = await axios.post('/api/reports/excel', {
        start_date: filters.startDate,
        end_date: filters.endDate,
        type: filters.type
      }, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `raport_${filters.startDate}_${filters.endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      setError('Wystąpił błąd podczas pobierania pliku Excel');
    }
  };

  const renderWorkplacesChart = () => {
    if (!data?.workplaces?.length) return null;

    return (
      <Box sx={{ mt: 4 }}>
        {data.workplaces.map((workplace, index) => {
          const totalStats = {
            name: workplace.name,
            costs: workplace.total_costs || 0,
            revenues: workplace.total_revenues || 0,
            profit: workplace.total_profit || 0
          };

          return (
            <Box key={index} sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                {workplace.name}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Koszty: {totalStats.costs.toFixed(2)} | 
                Przychody: {totalStats.revenues.toFixed(2)} | 
                Zysk: {totalStats.profit.toFixed(2)}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[totalStats]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => `${value.toFixed(2)}`}
                    labelFormatter={(name) => `Pracownik: ${name}`}
                  />
                  <Legend />
                  <Bar dataKey="costs" name="Koszty" fill={theme.palette.error.main} />
                  <Bar dataKey="revenues" name="Przychody" fill={theme.palette.success.main} />
                  <Bar dataKey="profit" name="Zysk" fill={theme.palette.primary.main} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )
        })}
      </Box>
    );
  };

  const renderEmployeesChart = () => {
    if (!data?.employees?.length) return null;

    return (
      <Box sx={{ mt: 4 }}>
        {data.employees.map((employee, index) => {
          const totalStats = {
            name: employee.name,
            costs: employee.total_costs || 0,
            revenues: employee.total_revenues || 0,
            profit: employee.total_profit || 0,
            hours: employee.total_hours || 0
          };

          return (
            <Box key={index} sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                {employee.name}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Koszty: {totalStats.costs.toFixed(2)} | 
                Przychody: {totalStats.revenues.toFixed(2)} | 
                Zysk: {totalStats.profit.toFixed(2)}
              </Typography>
              {totalStats.hours && (
                <Typography variant="subtitle2" gutterBottom color="textSecondary">
                  Godziny pracy: {totalStats.hours}
                </Typography>
              )}
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[totalStats]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => `${value.toFixed(2)}`}
                    labelFormatter={(name) => `Pracownik: ${name}`}
                  />
                  <Legend />
                  <Bar dataKey="costs" name="Koszty" fill={theme.palette.error.main} />
                  <Bar dataKey="revenues" name="Przychody" fill={theme.palette.success.main} />
                  <Bar dataKey="profit" name="Zysk" fill={theme.palette.primary.main} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Raporty</Typography>
      </Box>

      <Card>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Data początkowa"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: { xs: 2, md: 0 } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Data końcowa"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: { xs: 2, md: 0 } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth sx={{ mb: { xs: 2, md: 0 } }}>
                <InputLabel>Typ raportu</InputLabel>
                <Select
                  value={filters.type}
                  label="Typ raportu"
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <MenuItem value="all">Wszystko</MenuItem>
                  <MenuItem value="workplace">Miejsca pracy</MenuItem>
                  <MenuItem value="employee">Pracownicy</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ 
                display: 'flex', 
                gap: 1,
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: { xs: 'stretch', sm: 'flex-start' }
              }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AssessmentIcon />}
                  onClick={generateReport}
                  disabled={loading}
                  sx={{ mb: { xs: 1, sm: 0 } }}
                >
                  Generuj
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={downloadExcel}
                  disabled={loading}
                >
                  Excel
                </Button>
              </Box>
            </Grid>
          </Grid>

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {data && !loading && (
            <>
              {(filters.type === 'workplace' || filters.type === 'all') && renderWorkplacesChart()}
              {(filters.type === 'employee' || filters.type === 'all') && renderEmployeesChart()}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}; 