"use client";
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Typography, Container, Paper, Button } from '@mui/material';
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
    textAlign: 'center',
}));

const LogoTypography = styled(Typography)(({ theme }) => ({
    fontWeight: 700,
    fontSize: '2.5rem',
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(1),
}));

const TitleTypography = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    fontSize: '1.5rem',
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(3),
    textTransform: 'uppercase',
}));

const ActionButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(2),
    borderRadius: Number(theme.shape.borderRadius) * 1.5,
    padding: theme.spacing(1.5),
    fontWeight: 600,
    width: '100%',
}));

const TestPageContent = () => {
    const searchParams = useSearchParams();
    // Soportar tanto ?click=1234 como ?trace_id=1234
    const clickId = searchParams.get('click') || searchParams.get('trace_id');

    const handleTestInstall = () => {
        if (!clickId) {
            alert("No click ID found in URL parameters.");
            return;
        }
        // Redirige al tracking de Install
        window.location.href = `https://ad.laikad.com/tracking?trace_id=${clickId}`;
    };

    const handleTestEvent = () => {
        if (!clickId) {
            alert("No click ID found in URL parameters.");
            return;
        }
        // Redirige al tracking de Event
        window.location.href = `https://ad.laikad.com/tracking?event=TEST&trace_id=${clickId}`;
    };

    return (
        <StyledContainer maxWidth={false} disableGutters>
            <StyledPaper elevation={3}>
                <LogoTypography variant="h1">
                    Laikad
                </LogoTypography>
                <TitleTypography variant="h2">
                    Test Conversion !
                </TitleTypography>

                {clickId ? (
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                        Ready to test conversion for Trace ID: <strong>{clickId}</strong>
                    </Typography>
                ) : (
                    <Typography variant="body2" color="error" sx={{ mb: 3 }}>
                        Warning: No &#39;click&#39; parameter found in the URL.
                    </Typography>
                )}

                <Box sx={{ mt: 2 }}>
                    <ActionButton
                        variant="contained"
                        color="primary"
                        onClick={handleTestInstall}
                        disabled={!clickId}
                    >
                        Test Install
                    </ActionButton>

                    <ActionButton
                        variant="contained"
                        color="secondary"
                        onClick={handleTestEvent}
                        disabled={!clickId}
                        sx={{ mt: 2 }}
                    >
                        Test Install - EVENT
                    </ActionButton>
                </Box>
            </StyledPaper>
        </StyledContainer>
    );
};

export default function TestPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TestPageContent />
        </Suspense>
    );
}
