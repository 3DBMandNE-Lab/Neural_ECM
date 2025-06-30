from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
from typing import Dict, List, Any

app = Flask(__name__)
CORS(app)

# Load data files
def load_json_data(filename: str) -> Dict[str, Any]:
    """Load JSON data from the data directory"""
    data_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', filename)
    with open(data_path, 'r') as f:
        return json.load(f)

# Load data on startup
try:
    ecm_data = load_json_data('ecm_components.json')
    cell_types_data = load_json_data('cell_types.json')
except FileNotFoundError as e:
    print(f"Warning: Could not load data file: {e}")
    ecm_data = {"ecm_components": [], "metadata": {}}
    cell_types_data = {"cell_types": [], "metadata": {}}

@app.route('/')
def home():
    """API home endpoint with available routes"""
    return jsonify({
        "message": "Neural ECM API",
        "version": "1.0.0",
        "endpoints": {
            "/api/ecm": "Get all ECM components",
            "/api/ecm/<component_name>": "Get specific ECM component",
            "/api/cell-types": "Get all cell types",
            "/api/cell-types/<cell_type>": "Get specific cell type",
            "/api/search": "Search across all data",
            "/api/interactions": "Get interaction networks",
            "/api/proteases": "Get protease information"
        }
    })

@app.route('/api/ecm')
def get_ecm_components():
    """Get all ECM components"""
    return jsonify(ecm_data)

@app.route('/api/ecm/<component_name>')
def get_ecm_component(component_name: str):
    """Get specific ECM component by name"""
    for component in ecm_data.get('ecm_components', []):
        if component['name'].lower() == component_name.lower():
            return jsonify(component)
    return jsonify({"error": "Component not found"}), 404

@app.route('/api/cell-types')
def get_cell_types():
    """Get all cell types"""
    return jsonify(cell_types_data)

@app.route('/api/cell-types/<cell_type>')
def get_cell_type(cell_type: str):
    """Get specific cell type by name"""
    for cell in cell_types_data.get('cell_types', []):
        if cell['name'].lower() == cell_type.lower():
            return jsonify(cell)
    return jsonify({"error": "Cell type not found"}), 404

@app.route('/api/search')
def search():
    """Search across all data"""
    query = request.args.get('q', '').lower()
    if not query:
        return jsonify({"error": "Query parameter 'q' is required"}), 400
    
    results = {
        "ecm_components": [],
        "cell_types": [],
        "genes": [],
        "proteases": []
    }
    
    # Search in ECM components
    for component in ecm_data.get('ecm_components', []):
        if (query in component['name'].lower() or 
            any(query in role.lower() for role in component.get('roles', [])) or
            any(query in gene.lower() for gene in component.get('genes', []))):
            results["ecm_components"].append(component)
    
    # Search in cell types
    for cell_type in cell_types_data.get('cell_types', []):
        if query in cell_type['name'].lower():
            results["cell_types"].append(cell_type)
    
    # Search for genes across all data
    for component in ecm_data.get('ecm_components', []):
        genes = component.get('genes', [])
        if isinstance(genes, dict):
            for gene_list in genes.values():
                for gene in gene_list:
                    if query in gene.lower():
                        results["genes"].append({
                            "gene": gene,
                            "component": component['name']
                        })
        elif isinstance(genes, list):
            for gene in genes:
                if query in gene.lower():
                    results["genes"].append({
                        "gene": gene,
                        "component": component['name']
                    })
    
    # Search for proteases
    for component in ecm_data.get('ecm_components', []):
        proteases = component.get('proteases', [])
        for protease in proteases:
            if query in protease.lower():
                results["proteases"].append({
                    "protease": protease,
                    "component": component['name']
                })
    
    return jsonify(results)

@app.route('/api/interactions')
def get_interactions():
    """Get interaction networks between ECM components and cell types"""
    interactions = {
        "ecm_to_cell": {},
        "cell_to_ecm": {},
        "protease_network": {}
    }
    
    # Build ECM to cell type interactions
    for component in ecm_data.get('ecm_components', []):
        component_name = component['name']
        interactions["ecm_to_cell"][component_name] = {
            "cell_types": component.get('interacting_cell_types', []),
            "receptors": component.get('receptors', []),
            "interaction_partners": component.get('interaction_partners', [])
        }
    
    # Build cell type to ECM interactions
    for cell_type in cell_types_data.get('cell_types', []):
        cell_name = cell_type['name']
        interactions["cell_to_ecm"][cell_name] = {
            "produces": [comp['component'] for comp in cell_type.get('ecm_components_produced', [])],
            "degrades": [factor['factor'] for factor in cell_type.get('ecm_degrading_factors', [])],
            "receptors": []
        }
        
        # Collect all receptors for this cell type
        for receptor_category in cell_type.get('ecm_receptors', []):
            for receptor in receptor_category.get('receptors', []):
                interactions["cell_to_ecm"][cell_name]["receptors"].append(receptor['name'])
    
    # Build protease network
    for component in ecm_data.get('ecm_components', []):
        component_name = component['name']
        proteases = component.get('proteases', [])
        for protease in proteases:
            if protease not in interactions["protease_network"]:
                interactions["protease_network"][protease] = []
            interactions["protease_network"][protease].append(component_name)
    
    return jsonify(interactions)

@app.route('/api/proteases')
def get_proteases():
    """Get all protease information organized by target"""
    protease_data = {}
    
    for component in ecm_data.get('ecm_components', []):
        component_name = component['name']
        proteases = component.get('proteases', [])
        
        for protease in proteases:
            if protease not in protease_data:
                protease_data[protease] = {
                    "targets": [],
                    "functions": []
                }
            protease_data[protease]["targets"].append(component_name)
    
    return jsonify(protease_data)

@app.route('/api/stats')
def get_stats():
    """Get statistics about the dataset"""
    stats = {
        "total_ecm_components": len(ecm_data.get('ecm_components', [])),
        "total_cell_types": len(cell_types_data.get('cell_types', [])),
        "total_genes": 0,
        "total_proteases": 0,
        "unique_proteases": set(),
        "unique_genes": set()
    }
    
    # Count genes and proteases
    for component in ecm_data.get('ecm_components', []):
        genes = component.get('genes', [])
        if isinstance(genes, dict):
            for gene_list in genes.values():
                stats["total_genes"] += len(gene_list)
                stats["unique_genes"].update(gene_list)
        elif isinstance(genes, list):
            stats["total_genes"] += len(genes)
            stats["unique_genes"].update(genes)
        
        proteases = component.get('proteases', [])
        stats["total_proteases"] += len(proteases)
        stats["unique_proteases"].update(proteases)
    
    stats["unique_proteases"] = list(stats["unique_proteases"])
    stats["unique_genes"] = list(stats["unique_genes"])
    stats["unique_protease_count"] = len(stats["unique_proteases"])
    stats["unique_gene_count"] = len(stats["unique_genes"])
    
    return jsonify(stats)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 