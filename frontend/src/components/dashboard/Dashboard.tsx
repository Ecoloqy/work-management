import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Typography, Grid, Paper, useTheme } from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { EmployeeList } from '../employees/EmployeeList';
import { WorkplaceList } from '../workplaces/WorkplaceList';
import { Profile } from '../profile/Profile';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  const theme = useTheme();
  
  return (
    <Paper
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        height: 140,
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
          transition: 'all 0.3s',
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -10,
          right: -10,
          opacity: 0.2,
          transform: 'rotate(30deg)',
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ mt: 'auto' }}>
        {value}
      </Typography>
    </Paper>
  );
};

const DashboardHome: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Panel główny
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Pracownicy"
            value="0"
            icon={<PeopleIcon sx={{ fontSize: 100 }} />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Miejsca pracy"
            value="0"
            icon={<BusinessIcon sx={{ fontSize: 100 }} />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Przychody (PLN)"
            value="0.00"
            icon={<MoneyIcon sx={{ fontSize: 100 }} />}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export const Dashboard: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardHome />} />
      <Route path="employees/*" element={<EmployeeList />} />
      <Route path="workplaces/*" element={<WorkplaceList />} />
      <Route path="profile" element={<Profile />} />
    </Routes>
  );
}; 