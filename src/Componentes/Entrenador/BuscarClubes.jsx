import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Card, CardContent, Grid,
  Button, Chip, Alert, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField
} from '@mui/material';
import {
  Business as BusinessIcon, Email as EmailIcon, Phone as PhoneIcon,
  Send as SendIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../Autenticacion/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const BuscarClubes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clubes, setClubes] = useState([]);
  const [solicitudesEnviadas, setSolicitudesEnviadas] = useState([]);
  const [openSolicitudModal, setOpenSolicitudModal] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [mensajeSolicitud, setMensajeSolicitud] = useState('');

  useEffect(() => {
    if (user) {
      cargarClubes();
      cargarSolicitudesEnviadas();
    }
  }, [user]);

  const cargarClubes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/clubes');
      setClubes(response.data);
    } catch (error) {
      console.error('Error al cargar clubes:', error);
      setError('Error al cargar los clubes disponibles');
    } finally {
      setLoading(false);
    }
  };

  const cargarSolicitudesEnviadas = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/entrenador/solicitudes/${user.id}`);
      setSolicitudesEnviadas(response.data);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
    }
  };

  const handleEnviarSolicitud = (club) => {
    setSelectedClub(club);
    setMensajeSolicitud('');
    setOpenSolicitudModal(true);
  };

  const confirmarSolicitud = async () => {
    try {
      console.log('Enviando solicitud:', {
        entrenadorId: user.id,
        clubId: selectedClub._id,
        mensaje: mensajeSolicitud
      });
      console.log('Tipo de user.id:', typeof user.id);
      console.log('Tipo de selectedClub._id:', typeof selectedClub._id);

      const response = await axios.post('http://localhost:5000/api/entrenador/solicitar-club', {
        entrenadorId: user.id,
        clubId: selectedClub._id,
        mensaje: mensajeSolicitud
      });

      console.log('Respuesta del servidor:', response.data);

      Swal.fire({
        icon: 'success',
        title: '¡Solicitud enviada!',
        text: `Tu solicitud ha sido enviada a ${selectedClub.nombre}`,
        confirmButtonColor: '#800020'
      });

      setOpenSolicitudModal(false);
      cargarSolicitudesEnviadas(); // Recargar solicitudes
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
      console.error('Detalles del error:', error.response?.data);
      
      const errorMessage = error.response?.data?.error || 'No se pudo enviar la solicitud';
      const errorDetails = error.response?.data?.details || '';
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        footer: errorDetails ? `Detalles: ${errorDetails}` : undefined,
        confirmButtonColor: '#800020'
      });
    }
  };

  const obtenerEstadoSolicitud = (clubId) => {
    const solicitud = solicitudesEnviadas.find(s => s.clubId === clubId);
    if (!solicitud) return null;
    return solicitud.estado; // 'pendiente', 'aceptada', 'rechazada'
  };

  const renderEstadoSolicitud = (estado) => {
    switch (estado) {
      case 'pendiente':
        return <Chip label="Solicitud Pendiente" color="warning" size="small" />;
      case 'aceptada':
        return <Chip label="Solicitud Aceptada" color="success" size="small" />;
      case 'rechazada':
        return <Chip label="Solicitud Rechazada" color="error" size="small" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} sx={{ color: '#800020' }} />
      </Box>
    );
  }

  return (
    <>
      <style>
        {`
          body {
            margin: 0;
            padding: 0;
          }
        `}
      </style>
      <Container maxWidth="lg" sx={{ py: 4, background: '#F5E8C7', minHeight: '100vh' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <BusinessIcon sx={{ fontSize: 60, color: '#800020', mb: 2 }} />
          <Typography variant="h4" sx={{ color: '#800020', fontWeight: 'bold', mb: 2 }}>
            🏢 Buscar Clubes Disponibles
          </Typography>
          <Typography variant="h6" sx={{ color: '#7A4069' }}>
            Encuentra el club perfecto para tu carrera como entrenador
          </Typography>
          
          {/* Botón de prueba */}
          <Button
            variant="outlined"
            onClick={async () => {
              try {
                const response = await axios.get('http://localhost:5000/api/entrenadores/test');
                console.log('Test response:', response.data);
                Swal.fire({
                  icon: 'info',
                  title: 'Test Completado',
                  html: `
                    <p><strong>Colecciones:</strong> ${response.data.colecciones.join(', ')}</p>
                    <p><strong>Solicitudes:</strong> ${response.data.solicitudesCount}</p>
                    <p><strong>Test:</strong> ${response.data.testResult}</p>
                  `,
                  confirmButtonColor: '#800020'
                });
              } catch (error) {
                console.error('Error en test:', error);
                Swal.fire({
                  icon: 'error',
                  title: 'Error en Test',
                  text: error.response?.data?.error || 'Error desconocido',
                  confirmButtonColor: '#800020'
                });
              }
            }}
            sx={{ mt: 2 }}
          >
            🔧 Test del Sistema
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {clubes.length === 0 ? (
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: '#7A4069', mb: 2 }}>
              No hay clubes disponibles
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Por el momento no hay clubes registrados en el sistema
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {clubes.map((club) => {
              const estadoSolicitud = obtenerEstadoSolicitud(club._id);
              const yaSolicito = estadoSolicitud !== null;

              return (
                <Grid item xs={12} md={6} lg={4} key={club._id}>
                  <Card sx={{ 
                    height: '100%',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
                    transition: 'all 0.3s ease'
                  }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <BusinessIcon sx={{ fontSize: 40, color: '#800020', mr: 2 }} />
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#800020' }}>
                            {club.nombre}
                          </Typography>
                          {estadoSolicitud && renderEstadoSolicitud(estadoSolicitud)}
                        </Box>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <EmailIcon sx={{ fontSize: 16, mr: 1, color: '#7A4069' }} />
                          {club.email}
                        </Typography>
                        {club.telefono && (
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <PhoneIcon sx={{ fontSize: 16, mr: 1, color: '#7A4069' }} />
                            {club.telefono}
                          </Typography>
                        )}
                        {club.descripcion && (
                          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            {club.descripcion}
                          </Typography>
                        )}
                      </Box>

                      <Button
                        fullWidth
                        variant={yaSolicito ? "outlined" : "contained"}
                        startIcon={yaSolicito ? <CheckCircleIcon /> : <SendIcon />}
                        onClick={() => handleEnviarSolicitud(club)}
                        disabled={yaSolicito && estadoSolicitud !== 'rechazada'}
                        sx={{ 
                          backgroundColor: yaSolicito ? 'transparent' : '#800020',
                          borderColor: yaSolicito ? '#7A4069' : 'transparent',
                          color: yaSolicito ? '#7A4069' : 'white',
                          '&:hover': { 
                            backgroundColor: yaSolicito ? '#F5E8C7' : '#600018',
                            borderColor: yaSolicito ? '#5A3049' : 'transparent'
                          }
                        }}
                      >
                        {yaSolicito 
                          ? (estadoSolicitud === 'rechazada' ? 'Solicitar Nuevamente' : 'Solicitud Enviada')
                          : 'Enviar Solicitud'
                        }
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Modal de Solicitud */}
        <Dialog 
          open={openSolicitudModal} 
          onClose={() => setOpenSolicitudModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" sx={{ color: '#800020', fontWeight: 'bold' }}>
              Enviar Solicitud a {selectedClub?.nombre}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2, color: '#7A4069' }}>
              Escribe un mensaje explicando por qué quieres unirte a este club:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={mensajeSolicitud}
              onChange={(e) => setMensajeSolicitud(e.target.value)}
              placeholder="Describe tu experiencia, especialidades y por qué quieres unirte a este club..."
              variant="outlined"
            />
          </DialogContent>
                     <DialogActions>
             <Button 
               onClick={async () => {
                 try {
                   const response = await axios.post('http://localhost:5000/api/entrenador/verificar-datos', {
                     entrenadorId: user.id,
                     clubId: selectedClub._id
                   });
                   console.log('Verificación:', response.data);
                   Swal.fire({
                     icon: 'info',
                     title: 'Verificación',
                     html: `
                       <p><strong>Entrenador:</strong> ${response.data.entrenador.nombre}</p>
                       <p><strong>Club:</strong> ${response.data.club.nombre}</p>
                     `,
                     confirmButtonColor: '#800020'
                   });
                 } catch (error) {
                   console.error('Error en verificación:', error);
                   Swal.fire({
                     icon: 'error',
                     title: 'Error en Verificación',
                     text: error.response?.data?.error || 'Error desconocido',
                     confirmButtonColor: '#800020'
                   });
                 }
               }}
               sx={{ color: '#7A4069' }}
             >
               🔍 Verificar
             </Button>
             <Button 
               onClick={() => setOpenSolicitudModal(false)}
               sx={{ color: '#7A4069' }}
             >
               Cancelar
             </Button>
             <Button 
               onClick={confirmarSolicitud}
               variant="contained"
               disabled={!mensajeSolicitud.trim()}
               sx={{ 
                 backgroundColor: '#800020',
                 '&:hover': { backgroundColor: '#600018' }
               }}
             >
               Enviar Solicitud
             </Button>
           </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default BuscarClubes;
