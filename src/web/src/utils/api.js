import axios from 'axios';

// Check if we're running on GitHub Pages (static hosting)
const isGitHubPages = window.location.hostname === '3dbmne-fr.github.io';

// Base API URL - use localhost for development, or a deployed API for production
const API_BASE_URL = isGitHubPages 
  ? 'https://your-api-domain.com' // Replace with actual deployed API URL
  : 'http://localhost:5000';

// Static data fallback for GitHub Pages
import ecmComponentsData from '../data/ecm_components.json';
import cellTypesData from '../data/cell_types.json';

// Helper function to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// API wrapper that falls back to static data on GitHub Pages
export const api = {
  async get(endpoint) {
    if (isGitHubPages) {
      // Use static data on GitHub Pages
      await delay(100); // Simulate network delay
      
      switch (endpoint) {
        case '/api/ecm':
          return { data: ecmComponentsData };
        case '/api/cell-types':
          return { data: cellTypesData };
        case '/api/stats':
          return { data: generateStats() };
        case '/api/interactions':
          return { data: generateInteractions() };
        case '/api/proteases':
          return { data: generateProteases() };
        default:
          throw new Error(`Endpoint ${endpoint} not found`);
      }
    } else {
      // Use actual API for local development
      return axios.get(`${API_BASE_URL}${endpoint}`);
    }
  },

  async search(query) {
    if (isGitHubPages) {
      await delay(100);
      return { data: performStaticSearch(query) };
    } else {
      return axios.get(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`);
    }
  }
};

// Generate statistics from static data
function generateStats() {
  const stats = {
    total_ecm_components: ecmComponentsData.ecm_components.length,
    total_cell_types: cellTypesData.cell_types.length,
    total_genes: 0,
    total_proteases: 0,
    unique_proteases: new Set(),
    unique_genes: new Set()
  };

  // Count genes and proteases
  ecmComponentsData.ecm_components.forEach(component => {
    const genes = component.genes;
    if (typeof genes === 'object' && !Array.isArray(genes)) {
      Object.values(genes).flat().forEach(gene => {
        stats.total_genes++;
        stats.unique_genes.add(gene);
      });
    } else if (Array.isArray(genes)) {
      genes.forEach(gene => {
        stats.total_genes++;
        stats.unique_genes.add(gene);
      });
    }

    component.proteases.forEach(protease => {
      stats.total_proteases++;
      stats.unique_proteases.add(protease);
    });
  });

  return {
    ...stats,
    unique_proteases: Array.from(stats.unique_proteases),
    unique_genes: Array.from(stats.unique_genes),
    unique_protease_count: stats.unique_proteases.size,
    unique_gene_count: stats.unique_genes.size
  };
}

// Generate interactions from static data
function generateInteractions() {
  const interactions = {
    ecm_to_cell: {},
    cell_to_ecm: {},
    protease_network: {}
  };

  // Build ECM to cell type interactions
  ecmComponentsData.ecm_components.forEach(component => {
    interactions.ecm_to_cell[component.name] = {
      cell_types: component.interacting_cell_types || [],
      receptors: component.receptors || [],
      interaction_partners: component.interaction_partners || []
    };
  });

  // Build cell type to ECM interactions
  cellTypesData.cell_types.forEach(cellType => {
    interactions.cell_to_ecm[cellType.name] = {
      produces: cellType.ecm_components_produced?.map(comp => comp.component) || [],
      degrades: cellType.ecm_degrading_factors?.map(factor => factor.factor) || [],
      receptors: []
    };

    // Collect all receptors for this cell type
    cellType.ecm_receptors?.forEach(category => {
      category.receptors?.forEach(receptor => {
        interactions.cell_to_ecm[cellType.name].receptors.push(receptor.name);
      });
    });
  });

  // Build protease network
  ecmComponentsData.ecm_components.forEach(component => {
    component.proteases.forEach(protease => {
      if (!interactions.protease_network[protease]) {
        interactions.protease_network[protease] = [];
      }
      interactions.protease_network[protease].push(component.name);
    });
  });

  return interactions;
}

// Generate proteases from static data
function generateProteases() {
  const proteaseData = {};

  ecmComponentsData.ecm_components.forEach(component => {
    component.proteases.forEach(protease => {
      if (!proteaseData[protease]) {
        proteaseData[protease] = {
          targets: [],
          functions: []
        };
      }
      proteaseData[protease].targets.push(component.name);
    });
  });

  return proteaseData;
}

// Perform static search
function performStaticSearch(query) {
  const results = {
    ecm_components: [],
    cell_types: [],
    genes: [],
    proteases: []
  };

  const queryLower = query.toLowerCase();

  // Search in ECM components
  ecmComponentsData.ecm_components.forEach(component => {
    if (component.name.toLowerCase().includes(queryLower) ||
        component.roles.some(role => role.toLowerCase().includes(queryLower))) {
      results.ecm_components.push(component);
    }
  });

  // Search in cell types
  cellTypesData.cell_types.forEach(cellType => {
    if (cellType.name.toLowerCase().includes(queryLower)) {
      results.cell_types.push(cellType);
    }
  });

  // Search for genes
  ecmComponentsData.ecm_components.forEach(component => {
    const genes = component.genes;
    if (typeof genes === 'object' && !Array.isArray(genes)) {
      Object.values(genes).flat().forEach(gene => {
        if (gene.toLowerCase().includes(queryLower)) {
          results.genes.push({
            gene: gene,
            component: component.name
          });
        }
      });
    } else if (Array.isArray(genes)) {
      genes.forEach(gene => {
        if (gene.toLowerCase().includes(queryLower)) {
          results.genes.push({
            gene: gene,
            component: component.name
          });
        }
      });
    }
  });

  // Search for proteases
  ecmComponentsData.ecm_components.forEach(component => {
    component.proteases.forEach(protease => {
      if (protease.toLowerCase().includes(queryLower)) {
        results.proteases.push({
          protease: protease,
          component: component.name
        });
      }
    });
  });

  return results;
} 