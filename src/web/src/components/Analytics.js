import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api } from '../utils/api';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [proteases, setProteases] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, proteasesResponse] = await Promise.all([
          api.get('/api/stats'),
          api.get('/api/proteases')
        ]);
        setStats(statsResponse.data);
        setProteases(proteasesResponse.data);
      } catch (err) {
        setError('Failed to load analytics data');
        console.error('Error fetching analytics data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

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

  const proteaseData = proteases ? Object.entries(proteases).map(([protease, data]) => ({
    name: protease,
    targets: data.targets.length
  })).sort((a, b) => b.targets - a.targets).slice(0, 10) : [];

  const topProteases = proteases ? Object.entries(proteases)
    .sort((a, b) => b[1].targets.length - a[1].targets.length)
    .slice(0, 5) : [];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        ECM Analytics & Insights
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Statistical analysis and insights about the Neural ECM components, their interactions, and regulatory mechanisms.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" component="div" color="primary">
                {stats?.total_ecm_components || 0}
              </Typography>
              <Typography color="textSecondary">
                Total ECM Components
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" component="div" color="primary">
                {stats?.total_cell_types || 0}
              </Typography>
              <Typography color="textSecondary">
                Cell Types Analyzed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" component="div" color="primary">
                {stats?.unique_gene_count || 0}
              </Typography>
              <Typography color="textSecondary">
                Unique Genes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" component="div" color="primary">
                {stats?.unique_protease_count || 0}
              </Typography>
              <Typography color="textSecondary">
                Unique Proteases
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Proteases by Target Count
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={proteaseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="targets" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Data Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'ECM Components', value: stats?.total_ecm_components || 0 },
                    { name: 'Cell Types', value: stats?.total_cell_types || 0 },
                    { name: 'Unique Genes', value: stats?.unique_gene_count || 0 },
                    { name: 'Unique Proteases', value: stats?.unique_protease_count || 0 }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Most Active Proteases
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          These proteases target the most ECM components, indicating their broad regulatory role.
        </Typography>
        
        <Grid container spacing={2}>
          {topProteases.map(([protease, data], index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {protease}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Targets: {data.targets.length} ECM components
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {data.targets.slice(0, 3).map((target, idx) => (
                      <Chip 
                        key={idx} 
                        label={target} 
                        size="small" 
                        sx={{ m: 0.5 }} 
                      />
                    ))}
                    {data.targets.length > 3 && (
                      <Chip 
                        label={`+${data.targets.length - 3} more`} 
                        size="small" 
                        variant="outlined"
                        sx={{ m: 0.5 }} 
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Key Insights
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="ECM Complexity"
              secondary={`The brain ECM consists of ${stats?.total_ecm_components || 0} distinct components, each with specific roles in neural function and development.`}
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Cell Type Diversity"
              secondary={`${stats?.total_cell_types || 0} different cell types interact with the ECM, each producing and responding to specific matrix components.`}
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Genetic Regulation"
              secondary={`${stats?.unique_gene_count || 0} unique genes are involved in ECM synthesis and regulation, highlighting the complex genetic control of matrix composition.`}
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Proteolytic Regulation"
              secondary={`${stats?.unique_protease_count || 0} different proteases regulate ECM turnover, with some targeting multiple components for coordinated matrix remodeling.`}
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default Analytics; 