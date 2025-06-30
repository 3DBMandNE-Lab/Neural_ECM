# Neural ECM Repository

A comprehensive resource for understanding the Extracellular Matrix (ECM) components in the brain, their molecular interactions, and cell type-specific functions. This repository provides both structured data and interactive tools for exploring neural ECM biology.

## Live Application

[https://3dbmne-fr.github.io/Neural_ECM](https://3DBMandNE-Lab.github.io/Neural_ECM)

## Overview

This repository contains detailed information about brain ECM components including:
- **ECM Components**: Collagen, Elastin, Fibronectin, Laminin, Hyaluronic Acid, and more
- **Molecular Interactions**: Genes, receptors, and interaction partners
- **Cell Type Specificity**: How different brain cells (neurons, astrocytes, microglia, etc.) interact with ECM
- **Proteolytic Regulation**: Enzymes that degrade and remodel ECM components
- **Interactive Web Application**: Modern UI for exploring and visualizing ECM data
- **REST API**: Programmatic access to all ECM data

## Repository Structure

```
Neural_ECM/
├── docs/
│   └── Brain_ECM.md          # Comprehensive ECM documentation
├── src/
│   ├── api/                  # REST API for ECM data
│   │   ├── app.py           # Flask API server
│   │   └── requirements.txt # Python dependencies
│   ├── web/                 # Interactive web application
│   │   ├── src/
│   │   │   ├── components/  # React components
│   │   │   ├── data/        # JSON data files
│   │   │   ├── utils/       # API utilities
│   │   │   ├── App.js       # Main React app
│   │   │   └── index.js     # React entry point
│   │   └── package.json     # Node.js dependencies
│   └── utils/               # Data processing utilities
│       └── validate_data.py # Data validation script
├── data/
│   ├── ecm_components.json  # Structured ECM component data
│   └── cell_types.json      # Cell type-specific information
├── start.sh                 # Quick startup script
├── deploy.sh                # GitHub Pages deployment script
├── CONTRIBUTING.md          # Contribution guidelines
├── README.md               # This file
└── LICENSE                 # MIT License
```
---
## Author
**Ambra Stella Boecke**, 
3DBM, Neurosurgery, 
University Hospital of Freiburg
