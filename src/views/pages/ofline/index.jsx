import React from "react";
import { Card, Typography, Button } from "antd";
import { Box, Container } from "@mui/material";
import { CloudOffOutlined } from "@mui/icons-material";

const { Title, Text } = Typography;

const OfflinePage = () => {
  return (
    <Container 
      maxWidth="sm" 
      style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh", 
        textAlign: "center"
      }}
    >
      <Card 
        style={{ 
          padding: "30px", 
          borderRadius: "12px", 
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
        }}
      >
        <CloudOffOutlined style={{ fontSize: "80px", color: "#ff4d4f" }} />
        <Title level={2} style={{ marginTop: "20px" }}>
          Estás desconectado
        </Title>
        <Text type="secondary">
          No se pudo establecer conexión a Internet. Verifica tu red e inténtalo de nuevo.
        </Text>
        <Box mt={3}>
          <img
            src="https://st4.depositphotos.com/5722118/40843/v/950/depositphotos_408438278-stock-illustration-coloring-page-outline-cartoon-rocket.jpg"
            alt="Imagen de fondo"
            style={{ borderRadius: "8px", maxWidth: "100%" }}
          />
        </Box>
        <Box mt={3}>
          <Button type="primary" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </Box>
      </Card>
    </Container>
  );
};

export default OfflinePage;
