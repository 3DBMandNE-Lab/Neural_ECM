import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import {
  Science as ScienceIcon,
  CellTower as CellIcon,
  NetworkCheck as NetworkIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';

import Dashboard from './components/Dashboard';
import ECMExplorer from './components/ECMExplorer';
import CellTypes from './components/CellTypes';
import NetworkView from './components/NetworkView';
import Analytics from './components/Analytics';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <ScienceIcon sx={{ mr: 2 }} />
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Neural ECM Explorer
              </Typography>
            </Toolbar>
          </AppBar>
          
          <Container maxWidth="xl" sx={{ mt: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs 
                value={currentTab} 
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab 
                  icon={<AnalyticsIcon />} 
                  label="Dashboard" 
                  component={Link} 
                  to="/" 
                  onClick={() => setCurrentTab(0)}
                />
                <Tab 
                  icon={<ScienceIcon />} 
                  label="ECM Components" 
                  component={Link} 
                  to="/ecm" 
                  onClick={() => setCurrentTab(1)}
                />
                <Tab 
                  icon={<CellIcon />} 
                  label="Cell Types" 
                  component={Link} 
                  to="/cell-types" 
                  onClick={() => setCurrentTab(2)}
                />
                <Tab 
                  icon={<NetworkIcon />} 
                  label="Network View" 
                  component={Link} 
                  to="/network" 
                  onClick={() => setCurrentTab(3)}
                />
              </Tabs>
            </Box>

            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/ecm" element={<ECMExplorer />} />
              <Route path="/cell-types" element={<CellTypes />} />
              <Route path="/network" element={<NetworkView />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App; 