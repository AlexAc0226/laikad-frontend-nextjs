"use client";
import React, { useState } from 'react';
import { Box, Typography, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Container, Paper, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  width: '100%',
  maxWidth: 500,
  borderRadius: Number(theme.shape.borderRadius) * 2,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  background: 'white',
}));

const LogoTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '2.5rem',
  color: theme.palette.primary.main,
  textAlign: 'center',
  marginBottom: theme.spacing(1),
}));

const SubtitleTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 400,
  fontSize: '1.2rem',
  color: theme.palette.text.secondary,
  textAlign: 'center',
  marginBottom: theme.spacing(3),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiOutlinedInput-root': {
    borderRadius: Number(theme.shape.borderRadius) * 1.5,
  },
}));

const RunButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  padding: theme.spacing(1.5),
  fontWeight: 600,
}));

const TestLinkOffer: React.FC = () => {
  const [link, setLink] = useState('');
  const [type, setType] = useState('Install');
  const [isLoading, setIsLoading] = useState(false);

  const handleLinkChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLink(event.target.value);
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setType(event.target.value);
  };

  const handleRunClick = async () => {
    if (!link) return;
    
    setIsLoading(true);
    try {
      // Asegurar que la URL sea válida
      let urlObj: URL;
      try {
        urlObj = new URL(link.startsWith('http') ? link : `https://${link}`);
      } catch (err) {
        throw new Error('Por favor ingresa una URL válida');
      }

      // Si es un evento, añadimos o reemplazamos el parámetro event
      if (type === 'Event') {
        urlObj.searchParams.set('event', 'TEST');
      }

      // Abrir la URL en una nueva pestaña para simular el Install/Event
      window.open(urlObj.toString(), '_blank');
      
    } catch (error) {
      console.error('Error:', error);
      alert((error as Error).message || 'Invalid URL');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StyledContainer>
      <StyledPaper elevation={3}>
        <LogoTypography variant="h1">
          Laikad
        </LogoTypography>
        <SubtitleTypography variant="h2">
          Test Link
        </SubtitleTypography>
        <Box component="form" noValidate>
          <StyledTextField
            fullWidth
            label="Offer Link"
            variant="outlined"
            multiline
            rows={4}
            value={link}
            onChange={handleLinkChange}
            placeholder="https://your-offer-link.com"
          />
          <FormControl component="fieldset">
            <FormLabel component="legend">Link Type</FormLabel>
            <RadioGroup
              row
              aria-label="link-type"
              name="link-type"
              value={type}
              onChange={handleTypeChange}
            >
              <FormControlLabel value="Install" control={<Radio color="primary" />} label="Install" />
              <FormControlLabel value="Event" control={<Radio color="primary" />} label="Event" />
            </RadioGroup>
          </FormControl>
          <RunButton
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleRunClick}
            disabled={isLoading || !link}
          >
            {isLoading ? 'Running...' : 'Run'}
          </RunButton>
        </Box>
      </StyledPaper>
    </StyledContainer>
  );
};

export default TestLinkOffer;