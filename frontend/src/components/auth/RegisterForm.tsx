import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Box, Button, TextField, Typography, Container, Alert } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

const validationSchema = yup.object({
  email: yup.string().email('Wprowadź poprawny email').required('Email jest wymagany'),
  password: yup.string().min(6, 'Minimum 6 znaków').required('Hasło jest wymagane'),
  firstName: yup.string().required('Imię jest wymagane'),
  lastName: yup.string().required('Nazwisko jest wymagane'),
});

export const RegisterForm: React.FC = () => {
  const { register } = useAuth();
  
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        await register(values.email, values.password, values.firstName, values.lastName);
      } catch (error) {
        setStatus('Błąd rejestracji. Spróbuj ponownie.');
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
        </Box>
      </Box>
    </Container>
  );
}; 