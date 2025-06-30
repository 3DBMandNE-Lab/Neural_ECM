import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Science as ScienceIcon,
  CellTower as CellIcon,
  NetworkCheck as NetworkIcon,
  Analytics as AnalyticsIcon,
  Search as SearchIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const [ecmRes, cellRes] = await Promise.all([
          fetch(process.env.PUBLIC_URL + '/ecm_components.json'),
          fetch(process.env.PUBLIC_URL + '/cell_types.json')
        ]);
        const ecmData = await ecmRes.json();
        const cellData = await cellRes.json();
        const ecmComponents = ecmData.ecm_components || [];
        const cellTypes = cellData.cell_types || [];
        const uniqueGenes = new Set();
        const uniqueProteases = new Set();
        let totalGenes = 0;
        let totalProteases = 0;
        for (const component of ecmComponents) {
          const genes = component.genes || [];
          if (Array.isArray(genes)) {
            totalGenes += genes.length;
            genes.forEach(g => uniqueGenes.add(g));
          } else if (typeof genes === 'object') {
            for (const geneList of Object.values(genes)) {
              totalGenes += geneList.length;
              geneList.forEach(g => uniqueGenes.add(g));
            }
          }
          const proteases = component.proteases || [];
          totalProteases += proteases.length;
          proteases.forEach(p => uniqueProteases.add(p));
        }
        const stats = {
          total_ecm_components: ecmComponents.length,
          total_cell_types: cellTypes.length,
          total_genes: totalGenes,
          total_proteases: totalProteases,
          unique_proteases: Array.from(uniqueProteases),
          unique_genes: Array.from(uniqueGenes),
          unique_protease_count: uniqueProteases.size,
          unique_gene_count: uniqueGenes.size
        };
        setStats(stats);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const pieData = stats ? [
    { name: 'ECM Components', value: stats.total_ecm_components },
    { name: 'Cell Types', value: stats.total_cell_types },
    { name: 'Unique Genes', value: stats.unique_gene_count },
    { name: 'Unique Proteases', value: stats.unique_protease_count }
  ] : [];

  const barData = stats ? [
    { name: 'ECM Components', count: stats.total_ecm_components },
    { name: 'Cell Types', count: stats.total_cell_types },
    { name: 'Total Genes', count: stats.total_genes },
    { name: 'Total Proteases', count: stats.total_proteases }
  ] : [];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="error">
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Neural ECM Dashboard
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Welcome to the Neural Extracellular Matrix Explorer. This dashboard provides an overview of ECM components, 
        cell types, and their interactions in the brain.
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ScienceIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats?.total_ecm_components || 0}
                  </Typography>
                  <Typography color="textSecondary">
                    ECM Components
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CellIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats?.total_cell_types || 0}
                  </Typography>
                  <Typography color="textSecondary">
                    Cell Types
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AnalyticsIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats?.unique_gene_count || 0}
                  </Typography>
                  <Typography color="textSecondary">
                    Unique Genes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <NetworkIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats?.unique_protease_count || 0}
                  </Typography>
                  <Typography color="textSecondary">
                    Unique Proteases
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Data Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Component Counts
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <SearchIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Search ECM Components" 
              secondary="Find specific ECM components and their properties"
            />
            <Chip label="Explore" color="primary" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CellIcon />
            </ListItemIcon>
            <ListItemText 
              primary="View Cell Types" 
              secondary="Explore how different cell types interact with ECM"
            />
            <Chip label="View" color="primary" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <NetworkIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Network Analysis" 
              secondary="Visualize interaction networks between components"
            />
            <Chip label="Analyze" color="primary" />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default Dashboard; 