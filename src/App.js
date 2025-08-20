import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ShortenerPage from "./pages/ShortenerPage";
import StatisticsPage from "./pages/StatisticsPage";
import RedirectHandler from "./pages/RedirectHandler";
import { CssBaseline, AppBar, Toolbar, Typography, Container } from "@mui/material";
export default function App() {
  return (
    <Router>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">URL Shortener</Typography>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 3 }}>
        <Routes>
          <Route path="/" element={<ShortenerPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/:code" element={<RedirectHandler />} />
        </Routes>
      </Container>
    </Router>
  );
}
