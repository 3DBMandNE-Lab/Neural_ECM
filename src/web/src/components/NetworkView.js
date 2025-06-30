import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import * as d3 from 'd3';

const NetworkView = () => {
  const [interactions, setInteractions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [networkType, setNetworkType] = useState('ecm_to_cell');
  const [selectedNode, setSelectedNode] = useState(null);
  const svgRef = useRef();

  useEffect(() => {
    async function loadInteractions() {
      try {
        const [ecmRes, cellRes] = await Promise.all([
          fetch(process.env.PUBLIC_URL + '/ecm_components.json'),
          fetch(process.env.PUBLIC_URL + '/cell_types.json')
        ]);
        const ecmData = await ecmRes.json();
        const cellData = await cellRes.json();
        const ecmComponents = ecmData.ecm_components || [];
        const cellTypes = cellData.cell_types || [];
        const interactions = {
          ecm_to_cell: {},
          cell_to_ecm: {},
          protease_network: {}
        };
        // ECM to cell type interactions
        for (const component of ecmComponents) {
          interactions.ecm_to_cell[component.name] = {
            cell_types: component.interacting_cell_types || [],
            receptors: component.receptors || [],
            interaction_partners: component.interaction_partners || []
          };
        }
        // Cell type to ECM interactions
        for (const cell of cellTypes) {
          interactions.cell_to_ecm[cell.name] = {
            produces: (cell.ecm_components_produced || []).map(c => c.component),
            degrades: (cell.ecm_degrading_factors || []).map(f => f.factor),
            receptors: []
          };
          for (const receptorCategory of cell.ecm_receptors || []) {
            for (const receptor of receptorCategory.receptors || []) {
              interactions.cell_to_ecm[cell.name].receptors.push(receptor.name);
            }
          }
        }
        // Protease network
        for (const component of ecmComponents) {
          for (const protease of component.proteases || []) {
            if (!interactions.protease_network[protease]) {
              interactions.protease_network[protease] = [];
            }
            interactions.protease_network[protease].push(component.name);
          }
        }
        setInteractions(interactions);
      } catch (err) {
        setError('Failed to load interaction data');
        console.error('Error loading interaction data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInteractions();
  }, []);

  useEffect(() => {
    if (!interactions || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 600;

    // Create nodes and links based on network type
    let nodes = [];
    let links = [];

    if (networkType === 'ecm_to_cell') {
      // ECM components to cell types
      Object.keys(interactions.ecm_to_cell).forEach(ecm => {
        nodes.push({ id: ecm, group: 'ecm', type: 'ECM Component' });
        interactions.ecm_to_cell[ecm].cell_types.forEach(cell => {
          if (!nodes.find(n => n.id === cell)) {
            nodes.push({ id: cell, group: 'cell', type: 'Cell Type' });
          }
          links.push({ source: ecm, target: cell, type: 'interacts_with' });
        });
      });
    } else if (networkType === 'protease_network') {
      // Proteases to their targets
      Object.keys(interactions.protease_network).forEach(protease => {
        nodes.push({ id: protease, group: 'protease', type: 'Protease' });
        interactions.protease_network[protease].forEach(target => {
          if (!nodes.find(n => n.id === target)) {
            nodes.push({ id: target, group: 'ecm', type: 'ECM Component' });
          }
          links.push({ source: protease, target: target, type: 'degrades' });
        });
      });
    }

    // Create simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Create SVG
    const g = svg.append("g");

    // Create links
    const link = g.append("g")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);

    // Create nodes
    const node = g.append("g")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", d => d.group === 'ecm' ? 8 : d.group === 'cell' ? 6 : 5)
      .attr("fill", d => {
        switch (d.group) {
          case 'ecm': return "#1976d2";
          case 'cell': return "#4caf50";
          case 'protease': return "#ff9800";
          default: return "#9e9e9e";
        }
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Add labels
    const label = g.append("g")
      .selectAll("text")
      .data(nodes)
      .enter().append("text")
      .text(d => d.id)
      .attr("font-size", "10px")
      .attr("dx", 12)
      .attr("dy", 4)
      .attr("fill", "#333");

    // Add tooltips
    node.append("title")
      .text(d => `${d.id} (${d.type})`);

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      label
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    });

    // Node click handler
    node.on("click", (event, d) => {
      setSelectedNode(d);
    });

    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [interactions, networkType]);

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
        Interaction Network Visualization
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Explore the complex network of interactions between ECM components, cell types, and proteases.
        Click on nodes to see detailed information.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Network Type</InputLabel>
          <Select
            value={networkType}
            label="Network Type"
            onChange={(e) => setNetworkType(e.target.value)}
          >
            <MenuItem value="ecm_to_cell">ECM to Cell Types</MenuItem>
            <MenuItem value="protease_network">Protease Network</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Network Graph
          </Typography>
          <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
            <svg
              ref={svgRef}
              width="800"
              height="600"
              style={{ display: 'block', margin: 'auto' }}
            />
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Legend:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip label="ECM Components" size="small" sx={{ bgcolor: '#1976d2', color: 'white' }} />
              <Chip label="Cell Types" size="small" sx={{ bgcolor: '#4caf50', color: 'white' }} />
              <Chip label="Proteases" size="small" sx={{ bgcolor: '#ff9800', color: 'white' }} />
            </Box>
          </Box>
        </Paper>

        {selectedNode && (
          <Card sx={{ width: 300 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Node Details
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Name:</strong> {selectedNode.id}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Type:</strong> {selectedNode.type}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Group:</strong> {selectedNode.group}
              </Typography>
              
              {interactions && networkType === 'ecm_to_cell' && interactions.ecm_to_cell[selectedNode.id] && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Interactions:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Cell Types:</strong> {interactions.ecm_to_cell[selectedNode.id].cell_types.join(', ')}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Receptors:</strong> {interactions.ecm_to_cell[selectedNode.id].receptors.join(', ')}
                  </Typography>
                </Box>
              )}
              
              {interactions && networkType === 'protease_network' && interactions.protease_network[selectedNode.id] && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Targets:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {interactions.protease_network[selectedNode.id].join(', ')}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default NetworkView; 