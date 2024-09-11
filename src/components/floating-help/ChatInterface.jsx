import React, { useState, useEffect } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import {
  Box, Button, Paper, Typography, CircularProgress,
  IconButton, Tooltip, Grid, Card, CardContent, Avatar, TextField, Slide, Fade
} from '@mui/material';
import { GET_CHAT_HELPER, CHECK_USER_FEEDBACK, INSERT_FEEDBACK } from '/src/graphql/queries';
import HighlightedText from './HighlightedText';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import SearchIcon from '@mui/icons-material/Search';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

const ChatInterface = () => {
  const [fetchChatHelper, { data: chatData, loading: chatLoading }] = useLazyQuery(GET_CHAT_HELPER);
  const [checkUserFeedback, { data: feedbackData }] = useLazyQuery(CHECK_USER_FEEDBACK);
  const [insertFeedback] = useMutation(INSERT_FEEDBACK);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const storedFavorites = localStorage.getItem('favorites');
    return storedFavorites ? JSON.parse(storedFavorites) : {};
  });
  const [favoritesOpen, setFavoritesOpen] = useState(false);

  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    fetchChatHelper();
  }, [fetchChatHelper]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleSelectQuestion = async (faq) => {
    setSelectedQuestion(faq);

    if (userId && faq?.id) {
      await checkUserFeedback({
        variables: {
          user_id: userId,
          question_id: faq.id,
        },
      });
    }

    setFeedbackGiven(false); // Reset feedback when a new question is selected
  };

  const handleBackToQuestions = () => {
    setSelectedQuestion(null);
  };

  const handleFavoriteToggle = (id) => {
    setFavorites((prevFavorites) => ({
      ...prevFavorites,
      [id]: !prevFavorites[id],
    }));
  };

  const handleFeedback = async (wasHelpful) => {
    if (!userId || !selectedQuestion?.id) {
      console.error('User ID or Question ID is not available');
      return;
    }

    const input = {
      user_id: userId,
      question_id: selectedQuestion.id,
      was_helpful: wasHelpful,
    };

    try {
      setFeedbackSubmitting(true);
      await insertFeedback({
        variables: {
          input,
        },
      });
      setFeedbackGiven(true);
      console.log('Feedback enviado exitosamente');
    } catch (error) {
      console.error('Error enviando feedback:', error);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  if (chatLoading) {
    return <CircularProgress />;
  }

  if (!chatData) {
    return <Typography>No data found</Typography>;
  }

  // Agrupa las preguntas por categoría
  const groupedFaqData = chatData.web_services_chat_helper
    .filter(faq => faq.status === 'active')
    .reduce((acc, faq) => {
      if (faq.category in acc) {
        acc[faq.category].push(faq);
      } else {
        acc[faq.category] = [faq];
      }
      return acc;
    }, {});

  const userHasGivenFeedback = feedbackData?.web_services_user_feedback?.length > 0;

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 80,
        right: 16,
        width: 320,
        maxHeight: 500,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 2,
      }}
    >
      <TextField
        variant="outlined"
        size="small"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          ),
        }}
        sx={{ mb: 2 }}
      />

      <Box sx={{ overflowY: 'auto', mb: 1, flexGrow: 1 }}>
        {selectedQuestion === null ? (
          Object.keys(groupedFaqData).length > 0 ? (
            <Grid container spacing={2}>
              {Object.keys(groupedFaqData).map((category, categoryIndex) => (
                <Grid item xs={12} key={categoryIndex}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: '#f5f5f5',
                      boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: '0px 8px 16px rgba(0,0,0,0.2)',
                      },
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {category}
                    </Typography>
                    <Grid container spacing={1}>
                      {groupedFaqData[category].map((faq) => (
                        <Grid item xs={12} key={faq.id}>
                          <Paper
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              p: 1,
                              borderRadius: 1,
                              backgroundColor: '#ffffff',
                              boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                            }}
                          >
                            <Tooltip title="Marca tus preguntas favoritas para acceder a ellas más rápido">
                              <IconButton
                                size="small"
                                onClick={() => handleFavoriteToggle(faq.id)}
                                sx={{ mr: 1 }}
                              >
                                {favorites[faq.id] ? <StarIcon color="primary" /> : <StarBorderIcon />}
                              </IconButton>
                            </Tooltip>
                            <Button
                              variant="text"
                              onClick={() => handleSelectQuestion(faq)}
                              fullWidth
                              sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
                            >
                              <HighlightedText text={faq.question} highlight={searchTerm} />
                            </Button>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" align="center">
              No se encontraron coincidencias.
            </Typography>
          )
        ) : (
          <Fade in={Boolean(selectedQuestion)}>
            <Box>
              <Card sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <QuestionAnswerIcon />
                    </Avatar>
                    <Typography variant="h6" gutterBottom>
                      {selectedQuestion.question}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    paragraph
                    sx={{
                      fontSize: '1.1rem',
                      color: 'text.primary',
                      lineHeight: 1.5,
                      mb: 3,
                    }}
                  >
                    {selectedQuestion.answer}
                  </Typography>

                  {!feedbackGiven && !userHasGivenFeedback && (
                    <>
                      <Typography variant="body2" align="center">
                        ¿Te fue útil esta respuesta?
                      </Typography>
                      <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                        <Grid item>
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() => handleFeedback(true)}
                            disabled={feedbackSubmitting}
                            startIcon={<ThumbUpIcon />}
                            size="small"
                          >
                            {feedbackSubmitting ? <CircularProgress size={20} /> : 'Sí'}
                          </Button>
                        </Grid>
                        <Grid item>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => handleFeedback(false)}
                            disabled={feedbackSubmitting}
                            startIcon={<ThumbDownIcon />}
                            size="small"
                          >
                            {feedbackSubmitting ? <CircularProgress size={20} /> : 'No'}
                          </Button>
                        </Grid>
                      </Grid>
                    </>
                  )}
                  {userHasGivenFeedback && (
                    <Typography variant="caption" align="center" color="primary" sx={{ mt: 2, display: 'block' }}>
                      Feedback registrado.
                    </Typography>
                  )}

                  <Button
                    variant="outlined"
                    onClick={handleBackToQuestions}
                    sx={{ mt: 2, mx: 'auto', display: 'block', width: 'fit-content' }}
                    size="small"
                  >
                    Volver
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </Fade>
        )}
      </Box>

      <Slide direction="up" in={favoritesOpen} mountOnEnter unmountOnExit>
        <Box>
          <Typography variant="h6" gutterBottom>Favoritos</Typography>
          {Object.keys(favorites).filter(id => favorites[id]).length > 0 ? (
            Object.keys(favorites).filter(id => favorites[id]).map((id) => {
              const faq = chatData.web_services_chat_helper.find(f => f.id === id);
              return (
                <Button
                  key={id}
                  variant="text"
                  onClick={() => handleSelectQuestion(faq)}
                  fullWidth
                  sx={{ textTransform: 'none', justifyContent: 'flex-start', mb: 1 }}
                >
                  {faq?.question || 'Pregunta desconocida'}
                </Button>
              );
            })
          ) : (
            <Typography variant="body2">No tienes preguntas favoritas.</Typography>
          )}
        </Box>
      </Slide>
      <Button
        variant="outlined"
        onClick={() => setFavoritesOpen(!favoritesOpen)}
        fullWidth
      >
        {favoritesOpen ? 'Cerrar Favoritos' : 'Ver Favoritos'}
      </Button>
    </Paper>
  );
};

export default ChatInterface;
