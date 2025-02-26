import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, TextField, Typography, Container, Alert, Link } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

const validationSchema = yup.object({
  email: yup.string().email('Wprowadź poprawny email').required('Email jest wymagany'),
  password: yup.string()
    .required('Hasło jest wymagane')
    .min(8, 'Hasło musi mieć co najmniej 8 znaków')
    .matches(/[a-z]/, 'Hasło musi zawierać przynajmniej jedną małą literę')
    .matches(/[A-Z]/, 'Hasło musi zawierać przynajmniej jedną wielką literę')
    .matches(/\d/, 'Hasło musi zawierać przynajmniej jedną cyfrę')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Hasło musi zawierać przynajmniej jeden znak specjalny'),
  confirmPassword: yup.string()
    .required('Potwierdzenie hasła jest wymagane')
    .oneOf([yup.ref('password')], 'Hasła muszą być identyczne'),
  firstName: yup.string().required('Imię jest wymagane'),
  lastName: yup.string().required('Nazwisko jest wymagane'),
});

export const RegisterForm: React.FC = () => {
  const { register } = useAuth();
  
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        await register(values.email, values.password, values.firstName, values.lastName);
      } catch (error: any) {
        setStatus(error.response?.data?.error || 'Błąd rejestracji. Spróbuj ponownie.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Rejestracja</Typography>
        
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
          {formik.status && <Alert severity="error" sx={{ mb: 2 }}>{formik.status}</Alert>}
          
          <TextField
            margin="normal"
            fullWidth
            label="Imię"
            name="firstName"
            value={formik.values.firstName}
            onChange={formik.handleChange}
            error={formik.touched.firstName && Boolean(formik.errors.firstName)}
            helperText={formik.touched.firstName && formik.errors.firstName}
            InputLabelProps={{
              shrink: true,
            }}
            autoComplete="given-name"
          />
          
          <TextField
            margin="normal"
            fullWidth
            label="Nazwisko"
            name="lastName"
            value={formik.values.lastName}
            onChange={formik.handleChange}
            error={formik.touched.lastName && Boolean(formik.errors.lastName)}
            helperText={formik.touched.lastName && formik.errors.lastName}
            InputLabelProps={{
              shrink: true,
            }}
            autoComplete="family-name"
          />
          
          <TextField
            margin="normal"
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            InputLabelProps={{
              shrink: true,
            }}
            autoComplete="email"
            onAnimationStart={(e) => {
              if (e.animationName === 'mui-auto-fill') {
                formik.setFieldTouched('email', true, false);
              }
            }}
          />
          
          <TextField
            margin="normal"
            fullWidth
            label="Hasło"
            name="password"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            InputLabelProps={{
              shrink: true,
            }}
            autoComplete="new-password"
            onAnimationStart={(e) => {
              if (e.animationName === 'mui-auto-fill') {
                formik.setFieldTouched('password', true, false);
              }
            }}
          />

          <TextField
            margin="normal"
            fullWidth
            label="Potwierdź hasło"
            name="confirmPassword"
            type="password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
            InputLabelProps={{
              shrink: true,
            }}
            autoComplete="new-password"
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={formik.isSubmitting}
          >
            Zarejestruj się
          </Button>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Masz już konto? Zaloguj się
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}; 