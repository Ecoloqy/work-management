import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Alert,
  Paper,
  Grid,
  Divider
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
}

interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const profileValidationSchema = yup.object({
  email: yup.string().email('Wprowadź poprawny adres email').required('Email jest wymagany'),
  firstName: yup.string().required('Imię jest wymagane'),
  lastName: yup.string().required('Nazwisko jest wymagane'),
});

const passwordValidationSchema = yup.object({
  currentPassword: yup.string()
    .required('Aktualne hasło jest wymagane'),
  newPassword: yup.string()
    .required('Nowe hasło jest wymagane')
    .min(8, 'Hasło musi mieć co najmniej 8 znaków')
    .matches(/[a-z]/, 'Hasło musi zawierać przynajmniej jedną małą literę')
    .matches(/[A-Z]/, 'Hasło musi zawierać przynajmniej jedną wielką literę')
    .matches(/\d/, 'Hasło musi zawierać przynajmniej jedną cyfrę')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Hasło musi zawierać przynajmniej jeden znak specjalny'),
  confirmPassword: yup.string()
    .required('Potwierdzenie hasła jest wymagane')
    .oneOf([yup.ref('newPassword')], 'Hasła muszą być identyczne'),
});

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const profileFormik = useFormik<UserProfile>({
    initialValues: {
      email: '',
      firstName: '',
      lastName: '',
    },
    validationSchema: profileValidationSchema,
    onSubmit: async (values) => {
      try {
        await axios.put('/api/users/profile', {
          email: values.email,
          first_name: values.firstName,
          last_name: values.lastName,
        });
        setProfileSuccess('Dane profilu zostały zaktualizowane');
        setProfileError(null);
      } catch (error) {
        setProfileError('Nie udało się zaktualizować profilu');
        setProfileSuccess(null);
      }
    },
  });

  const passwordFormik = useFormik<PasswordChange>({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await axios.put('/api/users/profile/password', {
          current_password: values.currentPassword,
          new_password: values.newPassword,
        });
        setPasswordSuccess('Hasło zostało zmienione');
        setPasswordError(null);
        resetForm();
      } catch (error: any) {
        setPasswordError(error.response?.data?.error || 'Nie udało się zmienić hasła');
        setPasswordSuccess(null);
      }
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/users/profile');
        profileFormik.setValues({
          email: response.data.email,
          firstName: response.data.first_name,
          lastName: response.data.last_name,
        });
      } catch (error) {
        setProfileError('Nie udało się pobrać danych profilu');
      }
    };
    fetchProfile();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mój Profil
      </Typography>

      <Grid container spacing={3}>
        {/* Formularz edycji profilu */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Dane konta
            </Typography>
            <Box component="form" onSubmit={profileFormik.handleSubmit} sx={{ mt: 1 }}>
              {profileError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {profileError}
                </Alert>
              )}
              {profileSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {profileSuccess}
                </Alert>
              )}

              <TextField
                margin="normal"
                fullWidth
                label="Email"
                name="email"
                value={profileFormik.values.email}
                onChange={profileFormik.handleChange}
                error={profileFormik.touched.email && Boolean(profileFormik.errors.email)}
                helperText={profileFormik.touched.email && profileFormik.errors.email}
              />

              <TextField
                margin="normal"
                fullWidth
                label="Imię"
                name="firstName"
                value={profileFormik.values.firstName}
                onChange={profileFormik.handleChange}
                error={profileFormik.touched.firstName && Boolean(profileFormik.errors.firstName)}
                helperText={profileFormik.touched.firstName && profileFormik.errors.firstName}
              />

              <TextField
                margin="normal"
                fullWidth
                label="Nazwisko"
                name="lastName"
                value={profileFormik.values.lastName}
                onChange={profileFormik.handleChange}
                error={profileFormik.touched.lastName && Boolean(profileFormik.errors.lastName)}
                helperText={profileFormik.touched.lastName && profileFormik.errors.lastName}
              />

              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 3 }}
                disabled={profileFormik.isSubmitting}
              >
                Zapisz zmiany
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Formularz zmiany hasła */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Zmiana hasła
            </Typography>
            <Box component="form" onSubmit={passwordFormik.handleSubmit} sx={{ mt: 1 }}>
              {passwordError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {passwordError}
                </Alert>
              )}
              {passwordSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {passwordSuccess}
                </Alert>
              )}

              <TextField
                margin="normal"
                fullWidth
                label="Aktualne hasło"
                name="currentPassword"
                type="password"
                value={passwordFormik.values.currentPassword}
                onChange={passwordFormik.handleChange}
                error={passwordFormik.touched.currentPassword && Boolean(passwordFormik.errors.currentPassword)}
                helperText={passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword}
              />

              <TextField
                margin="normal"
                fullWidth
                label="Nowe hasło"
                name="newPassword"
                type="password"
                value={passwordFormik.values.newPassword}
                onChange={passwordFormik.handleChange}
                error={passwordFormik.touched.newPassword && Boolean(passwordFormik.errors.newPassword)}
                helperText={passwordFormik.touched.newPassword && passwordFormik.errors.newPassword}
              />

              <TextField
                margin="normal"
                fullWidth
                label="Potwierdź nowe hasło"
                name="confirmPassword"
                type="password"
                value={passwordFormik.values.confirmPassword}
                onChange={passwordFormik.handleChange}
                error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
                helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
              />

              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 3 }}
                disabled={passwordFormik.isSubmitting}
              >
                Zmień hasło
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 