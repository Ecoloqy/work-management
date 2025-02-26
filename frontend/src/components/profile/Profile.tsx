import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';

const validationSchema = yup.object({
  firstName: yup.string().required('Imię jest wymagane'),
  lastName: yup.string().required('Nazwisko jest wymagane'),
  email: yup.string().email('Nieprawidłowy email').required('Email jest wymagany'),
  currentPassword: yup.string().min(6, 'Minimum 6 znaków'),
  newPassword: yup.string().min(6, 'Minimum 6 znaków'),
  confirmPassword: yup.string().oneOf([yup.ref('newPassword')], 'Hasła muszą być takie same'),
});

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const formik = useFormik({
    initialValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Update profile info
        if (values.firstName !== user?.firstName ||
            values.lastName !== user?.lastName ||
            values.email !== user?.email) {
          await axios.put('/api/users/profile', {
            first_name: values.firstName,
            last_name: values.lastName,
            email: values.email,
          });
        }

        // Update password if provided
        if (values.currentPassword && values.newPassword) {
          await axios.put('/api/users/profile/password', {
            current_password: values.currentPassword,
            new_password: values.newPassword,
          });
        }

        setMessage({ type: 'success', text: 'Profil został zaktualizowany' });
        formik.resetForm({
          values: {
            ...values,
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          },
        });
      } catch (error) {
        setMessage({ type: 'error', text: 'Nie udało się zaktualizować profilu' });
      }
    },
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mój profil
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="firstName"
                label="Imię"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                helperText={formik.touched.firstName && formik.errors.firstName}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="lastName"
                label="Nazwisko"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={formik.touched.lastName && formik.errors.lastName}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="email"
                label="Email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" gutterBottom>
            Zmiana hasła
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="currentPassword"
                label="Obecne hasło"
                type="password"
                value={formik.values.currentPassword}
                onChange={formik.handleChange}
                error={formik.touched.currentPassword && Boolean(formik.errors.currentPassword)}
                helperText={formik.touched.currentPassword && formik.errors.currentPassword}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="newPassword"
                label="Nowe hasło"
                type="password"
                value={formik.values.newPassword}
                onChange={formik.handleChange}
                error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
                helperText={formik.touched.newPassword && formik.errors.newPassword}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="confirmPassword"
                label="Potwierdź nowe hasło"
                type="password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
            >
              Zapisz zmiany
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}; 