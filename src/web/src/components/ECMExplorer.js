import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Science as ScienceIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import ecmDataJson from '../data/ecm_components.json';

const ECMExplorer = () => {
  const [ecmData, setEcmData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    // Load ECM data from local JSON file
    try {
      setEcmData(ecmDataJson.ecm_components || []);
      setFilteredData(ecmDataJson.ecm_components || []);
    } catch (err) {
      setError('Failed to load ECM data');
      console.error('Error loading ECM data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const filtered = ecmData.filter(component => 
      component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.roles.some(role => role.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (Array.isArray(component.genes) && component.genes.some(gene => gene.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (typeof component.genes === 'object' && Object.values(component.genes).flat().some(gene => gene.toLowerCase().includes(searchTerm.toLowerCase())))
    );
    setFilteredData(filtered);
  }, [searchTerm, ecmData]);

  const renderGenes = (genes) => {
    if (Array.isArray(genes)) {
      return genes.map((gene, index) => (
        <Chip key={index} label={gene} size="small" sx={{ m: 0.5 }} />
      ));
    } else if (typeof genes === 'object') {
      return Object.entries(genes).map(([type, geneList]) => (
        <Box key={type} sx={{ mb: 1 }}>
          <Typography variant="subtitle2" color="textSecondary">
            {type}:
          </Typography>
          {geneList.map((gene, index) => (
            <Chip key={index} label={gene} size="small" sx={{ m: 0.5 }} />
          ))}
        </Box>
      ));
    }
    return null;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        ECM Components Explorer
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Explore the extracellular matrix components found in the brain, their molecular interactions, 
        and cellular functions.
      </Typography>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <SearchIcon color="action" />
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search ECM components, roles, or genes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
          />
        </Box>
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          Found {filteredData.length} component{filteredData.length !== 1 ? 's' : ''}
        </Typography>
      </Paper>

      {/* ECM Components Grid */}
      <Grid container spacing={3}>
        {filteredData.map((component, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <ScienceIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    {component.name}
                  </Typography>
                  {component.type && (
                    <Chip 
                      label={component.type} 
                      size="small" 
                      color="secondary" 
                      sx={{ ml: 'auto' }}
                    />
                  )}
                </Box>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Roles & Functions</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {component.roles.map((role, idx) => (
                        <ListItem key={idx}>
                          <ListItemText primary={role} />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Genes</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      {renderGenes(component.genes)}
                    </Box>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Interaction Partners</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      {component.interaction_partners?.map((partner, idx) => (
                        <Chip key={idx} label={partner} size="small" sx={{ m: 0.5 }} />
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Receptors</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      {component.receptors?.map((receptor, idx) => (
                        <Chip key={idx} label={receptor} size="small" sx={{ m: 0.5 }} />
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Interacting Cell Types</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      {component.interacting_cell_types?.map((cellType, idx) => (
                        <Chip key={idx} label={cellType} size="small" sx={{ m: 0.5 }} />
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Proteases</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      {component.proteases?.map((protease, idx) => (
                        <Chip key={idx} label={protease} size="small" color="warning" sx={{ m: 0.5 }} />
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredData.length === 0 && searchTerm && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No ECM components found matching "{searchTerm}"
        </Alert>
      )}
    </Box>
  );
};

export default ECMExplorer; 