import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CellTower as CellIcon,
  Science as ScienceIcon,
  Build as BuildIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';

const CellTypes = () => {
  const [cellTypesData, setCellTypesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCellType, setSelectedCellType] = useState(0);

  useEffect(() => {
    async function loadCellTypes() {
      try {
        const res = await fetch(process.env.PUBLIC_URL + '/cell_types.json');
        const data = await res.json();
        setCellTypesData(data.cell_types || []);
      } catch (err) {
        setError('Failed to load cell types data');
        console.error('Error loading cell types data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCellTypes();
  }, []);

  const handleCellTypeChange = (event, newValue) => {
    setSelectedCellType(newValue);
  };

  const getCellTypeIcon = (cellTypeName) => {
    switch (cellTypeName.toLowerCase()) {
      case 'neurons':
        return <PsychologyIcon color="primary" />;
      case 'astrocytes':
        return <CellIcon color="primary" />;
      case 'microglia':
        return <BuildIcon color="primary" />;
      case 'oligodendrocytes':
        return <ScienceIcon color="primary" />;
      case 'endothelial cells':
        return <CellIcon color="primary" />;
      default:
        return <CellIcon color="primary" />;
    }
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
        Brain Cell Types & ECM Interactions
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Explore how different cell types in the brain interact with the extracellular matrix, 
        including what they produce, degrade, and how they respond to ECM signals.
      </Typography>

      {/* Cell Type Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={selectedCellType} 
          onChange={handleCellTypeChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {cellTypesData.map((cellType, index) => (
            <Tab 
              key={index}
              icon={getCellTypeIcon(cellType.name)}
              label={cellType.name}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>

      {/* Selected Cell Type Details */}
      {cellTypesData.length > 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  {getCellTypeIcon(cellTypesData[selectedCellType].name)}
                  <Typography variant="h5" sx={{ ml: 1 }}>
                    {cellTypesData[selectedCellType].name}
                  </Typography>
                </Box>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">ECM Components Produced</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {cellTypesData[selectedCellType].ecm_components_produced?.map((component, idx) => (
                        <ListItem key={idx}>
                          <ListItemText 
                            primary={component.component}
                            secondary={component.function}
                          />
                          {component.genes && (
                            <Box>
                              {component.genes.map((gene, geneIdx) => (
                                <Chip key={geneIdx} label={gene} size="small" sx={{ m: 0.5 }} />
                              ))}
                            </Box>
                          )}
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">ECM Degrading Factors</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {cellTypesData[selectedCellType].ecm_degrading_factors?.map((factor, idx) => (
                        <ListItem key={idx}>
                          <ListItemText 
                            primary={factor.factor}
                            secondary={factor.function}
                          />
                          {factor.specific_enzymes && (
                            <Box>
                              {factor.specific_enzymes.map((enzyme, enzymeIdx) => (
                                <Chip 
                                  key={enzymeIdx} 
                                  label={typeof enzyme === 'string' ? enzyme : enzyme.name} 
                                  size="small" 
                                  color="warning"
                                  sx={{ m: 0.5 }} 
                                />
                              ))}
                            </Box>
                          )}
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ECM Receptors & Interactions
                </Typography>

                {cellTypesData[selectedCellType].ecm_receptors?.map((category, idx) => (
                  <Accordion key={idx}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1">{category.category}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        {category.receptors?.map((receptor, receptorIdx) => (
                          <ListItem key={receptorIdx}>
                            <ListItemText 
                              primary={receptor.name}
                              secondary={receptor.function}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* All Cell Types Overview */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          All Cell Types Overview
        </Typography>
        <Grid container spacing={2}>
          {cellTypesData.map((cellType, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    {getCellTypeIcon(cellType.name)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {cellType.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Produces: {cellType.ecm_components_produced?.length || 0} components
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Degrades: {cellType.ecm_degrading_factors?.length || 0} factors
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Receptors: {cellType.ecm_receptors?.reduce((acc, cat) => acc + (cat.receptors?.length || 0), 0)} total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default CellTypes; 