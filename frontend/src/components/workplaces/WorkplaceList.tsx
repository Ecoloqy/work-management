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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface Workplace {
  id: number;
  name: string;
  address: string;
  description: string;
}

export const WorkplaceList: React.FC = () => {
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          onClick={() => {/* TODO: Implement add workplace */}}
        >
          Dodaj miejsce pracy
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nazwa</TableCell>
              <TableCell>Adres</TableCell>
              <TableCell>Opis</TableCell>
              <TableCell align="right">Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {workplaces.map((workplace) => (
              <TableRow key={workplace.id}>
                <TableCell>{workplace.name}</TableCell>
                <TableCell>{workplace.address}</TableCell>
                <TableCell>{workplace.description}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Pracownicy">
                    <IconButton
                      onClick={() => {/* TODO: Implement employees view */}}
                      color="primary"
                    >
                      <PeopleIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Finanse">
                    <IconButton
                      onClick={() => {/* TODO: Implement finances view */}}
                      color="primary"
                    >
                      <MoneyIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edytuj">
                    <IconButton
                      onClick={() => {/* TODO: Implement edit */}}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Usuń">
                    <IconButton
                      onClick={() => handleDelete(workplace.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {workplaces.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Brak miejsc pracy
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}; 