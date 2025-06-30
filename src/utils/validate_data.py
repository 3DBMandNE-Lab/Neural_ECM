#!/usr/bin/env python3
"""
Data validation utility for Neural ECM repository.
Validates JSON data files against expected schemas.
"""

import json
import os
import sys
from typing import Dict, List, Any, Optional
from pathlib import Path

def validate_ecm_components(data: Dict[str, Any]) -> List[str]:
    """Validate ECM components data structure."""
    errors = []
    
    if not isinstance(data, dict):
        errors.append("Root data must be a dictionary")
        return errors
    
    if 'ecm_components' not in data:
        errors.append("Missing 'ecm_components' key")
        return errors
    
    if not isinstance(data['ecm_components'], list):
        errors.append("'ecm_components' must be a list")
        return errors
    
    required_fields = ['name', 'roles', 'genes', 'interaction_partners', 'receptors', 'interacting_cell_types', 'proteases']
    
    for i, component in enumerate(data['ecm_components']):
        if not isinstance(component, dict):
            errors.append(f"Component {i} must be a dictionary")
            continue
        
        for field in required_fields:
            if field not in component:
                errors.append(f"Component {i} ({component.get('name', 'unknown')}) missing required field: {field}")
        
        # Validate specific field types
        if 'name' in component and not isinstance(component['name'], str):
            errors.append(f"Component {i} name must be a string")
        
        if 'roles' in component and not isinstance(component['roles'], list):
            errors.append(f"Component {i} roles must be a list")
        
        if 'genes' in component and not isinstance(component['genes'], (list, dict)):
            errors.append(f"Component {i} genes must be a list or dictionary")
        
        if 'interaction_partners' in component and not isinstance(component['interaction_partners'], list):
            errors.append(f"Component {i} interaction_partners must be a list")
        
        if 'receptors' in component and not isinstance(component['receptors'], list):
            errors.append(f"Component {i} receptors must be a list")
        
        if 'interacting_cell_types' in component and not isinstance(component['interacting_cell_types'], list):
            errors.append(f"Component {i} interacting_cell_types must be a list")
        
        if 'proteases' in component and not isinstance(component['proteases'], list):
            errors.append(f"Component {i} proteases must be a list")
    
    return errors

def validate_cell_types(data: Dict[str, Any]) -> List[str]:
    """Validate cell types data structure."""
    errors = []
    
    if not isinstance(data, dict):
        errors.append("Root data must be a dictionary")
        return errors
    
    if 'cell_types' not in data:
        errors.append("Missing 'cell_types' key")
        return errors
    
    if not isinstance(data['cell_types'], list):
        errors.append("'cell_types' must be a list")
        return errors
    
    for i, cell_type in enumerate(data['cell_types']):
        if not isinstance(cell_type, dict):
            errors.append(f"Cell type {i} must be a dictionary")
            continue
        
        if 'name' not in cell_type:
            errors.append(f"Cell type {i} missing required field: name")
        
        if 'name' in cell_type and not isinstance(cell_type['name'], str):
            errors.append(f"Cell type {i} name must be a string")
        
        # Validate optional fields if present
        if 'ecm_components_produced' in cell_type:
            if not isinstance(cell_type['ecm_components_produced'], list):
                errors.append(f"Cell type {i} ecm_components_produced must be a list")
        
        if 'ecm_degrading_factors' in cell_type:
            if not isinstance(cell_type['ecm_degrading_factors'], list):
                errors.append(f"Cell type {i} ecm_degrading_factors must be a list")
        
        if 'ecm_receptors' in cell_type:
            if not isinstance(cell_type['ecm_receptors'], list):
                errors.append(f"Cell type {i} ecm_receptors must be a list")
    
    return errors

def validate_file(filepath: Path) -> List[str]:
    """Validate a JSON file based on its filename."""
    try:
        with open(filepath, 'r') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        return [f"Invalid JSON in {filepath}: {e}"]
    except FileNotFoundError:
        return [f"File not found: {filepath}"]
    
    if filepath.name == 'ecm_components.json':
        return validate_ecm_components(data)
    elif filepath.name == 'cell_types.json':
        return validate_cell_types(data)
    else:
        return [f"Unknown file type: {filepath.name}"]

def main():
    """Main validation function."""
    # Get the data directory path
    script_dir = Path(__file__).parent
    data_dir = script_dir.parent.parent / 'data'
    
    if not data_dir.exists():
        print(f"Error: Data directory not found: {data_dir}")
        sys.exit(1)
    
    all_errors = []
    
    # Validate all JSON files in the data directory
    for json_file in data_dir.glob('*.json'):
        print(f"Validating {json_file.name}...")
        errors = validate_file(json_file)
        if errors:
            all_errors.extend([f"{json_file.name}: {error}" for error in errors])
        else:
            print(f"✓ {json_file.name} is valid")
    
    if all_errors:
        print("\nValidation errors found:")
        for error in all_errors:
            print(f"  - {error}")
        sys.exit(1)
    else:
        print("\n✓ All data files are valid!")
        sys.exit(0)

if __name__ == "__main__":
    main() 