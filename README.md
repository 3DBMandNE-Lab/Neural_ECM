# Neural ECM Repository

A comprehensive resource for understanding the Extracellular Matrix (ECM) components in the brain, their molecular interactions, and cell type-specific functions. This repository provides both structured data and interactive tools for exploring neural ECM biology.

## 🌐 Live Demo

**Visit the live application**: [https://3dbmne-fr.github.io/Neural_ECM](https://3dbmne-fr.github.io/Neural_ECM)

## 📋 Overview

This repository contains detailed information about brain ECM components including:
- **ECM Components**: Collagen, Elastin, Fibronectin, Laminin, Hyaluronic Acid, and more
- **Molecular Interactions**: Genes, receptors, and interaction partners
- **Cell Type Specificity**: How different brain cells (neurons, astrocytes, microglia, etc.) interact with ECM
- **Proteolytic Regulation**: Enzymes that degrade and remodel ECM components
- **Interactive Web Application**: Modern UI for exploring and visualizing ECM data
- **REST API**: Programmatic access to all ECM data

## 🗂️ Repository Structure

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

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Clone the repository
git clone https://github.com/your-username/Neural_ECM.git
cd Neural_ECM

# Run the startup script
./start.sh
```

### Option 2: Manual Setup

#### Prerequisites
- Python 3.8+
- Node.js 16+
- npm

#### API Server
```bash
cd src/api
pip install -r requirements.txt
python app.py
```

#### Web Application
```bash
cd src/web
npm install
npm start
```

## 🌐 Web Application Features

### Dashboard
- Overview statistics and data distribution
- Interactive charts and visualizations
- Quick access to different sections

### ECM Components Explorer
- Browse all ECM components with detailed information
- Search functionality across components, roles, and genes
- Expandable sections for genes, interactions, receptors, and proteases

### Cell Types Analysis
- Detailed information about brain cell types
- ECM components produced by each cell type
- Degrading factors and receptor information
- Tabbed interface for easy navigation

### Network Visualization
- Interactive D3.js network graphs
- ECM-to-cell type interactions
- Protease target networks
- Clickable nodes with detailed information

### Analytics
- Statistical analysis of ECM data
- Protease activity rankings
- Data distribution charts
- Key insights and findings

## 🚀 GitHub Pages Deployment

### Automatic Deployment
```bash
# Deploy to GitHub Pages
./deploy.sh
```

### Manual Deployment
```bash
cd src/web
npm install
npm run build
npm run deploy
```

### GitHub Pages Setup
1. Go to your repository settings on GitHub
2. Navigate to "Pages" in the sidebar
3. Set source to "Deploy from a branch"
4. Select "gh-pages" branch and "/ (root)" folder
5. Click "Save"

The application will be available at: `https://your-username.github.io/Neural_ECM`

## 🔌 API Endpoints

The REST API provides programmatic access to all ECM data:

- `GET /api/ecm` - Get all ECM components
- `GET /api/ecm/{component_name}` - Get specific ECM component
- `GET /api/cell-types` - Get all cell types
- `GET /api/cell-types/{cell_type}` - Get specific cell type
- `GET /api/search?q={query}` - Search across all data
- `GET /api/interactions` - Get interaction networks
- `GET /api/proteases` - Get protease information
- `GET /api/stats` - Get dataset statistics

### Example API Usage
```bash
# Get all ECM components
curl http://localhost:5000/api/ecm

# Search for collagen-related data
curl "http://localhost:5000/api/search?q=collagen"

# Get interaction networks
curl http://localhost:5000/api/interactions
```

## 📊 Data Formats

The repository provides ECM data in multiple formats:

- **JSON**: Structured data for programmatic access
- **REST API**: HTTP endpoints for integration
- **Interactive Web UI**: Modern React application
- **Markdown**: Human-readable documentation

## 🔬 Research Applications

This repository supports various research applications:
- **Drug Discovery**: Target identification for ECM-related therapies
- **Disease Modeling**: Understanding ECM changes in neurological disorders
- **Tissue Engineering**: Scaffold design for neural tissue regeneration
- **Bioinformatics**: Integration with omics data analysis
- **Network Analysis**: Study of ECM interaction networks
- **Comparative Biology**: Cross-species ECM analysis

## 🛠️ Development

### Data Validation
```bash
python src/utils/validate_data.py
```

### Adding New Data
1. Update the appropriate JSON file in `data/`
2. Run validation: `python src/utils/validate_data.py`
3. Test the API endpoints
4. Update documentation if needed

### Contributing
Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📚 Documentation

- **Brain_ECM.md**: Comprehensive documentation of ECM components and interactions
- **API Documentation**: Available at `http://localhost:5000/` when running
- **Component Documentation**: Inline documentation in React components

## 🔗 Related Projects

- [Brain Cell Atlas](https://github.com/example/brain-cell-atlas)
- [ECM Network Analysis](https://github.com/example/ecm-network)
- [Neural Tissue Engineering](https://github.com/example/neural-tissue-eng)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📞 Support

For questions or support:
- Open an issue on GitHub
- Check the documentation in `docs/`
- Review the API documentation at `http://localhost:5000/`

---

**Maintained by**: 3DBM&NE_Fr  
**Last Updated**: 2025 