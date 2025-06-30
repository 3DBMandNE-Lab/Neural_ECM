import os
from datetime import datetime, timedelta
from typing import Dict, List, Any

class TrawlerConfig:
    """Configuration for the Neural ECM Knowledge Trawler"""
    
    # Data sources configuration
    DATA_SOURCES = {
        'pubmed': {
            'enabled': True,
            'base_url': 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/',
            'api_key': os.getenv('NCBI_API_KEY', ''),
            'search_terms': [
                'extracellular matrix brain',
                'neural ECM components',
                'brain ECM proteases',
                'ECM cell interactions',
                'matrix metalloproteinases brain',
                'hyaluronic acid brain',
                'laminin neural',
                'collagen brain',
                'tenascin neural',
                'aggrecan brain'
            ],
            'update_frequency_hours': 24,
            'max_results_per_search': 50
        },
        'arxiv': {
            'enabled': True,
            'categories': ['q-bio.QM', 'q-bio.CB', 'q-bio.NC'],
            'search_terms': [
                'extracellular matrix',
                'neural ECM',
                'brain matrix',
                'ECM components'
            ],
            'update_frequency_hours': 48,
            'max_results_per_search': 20
        },
        'uniprot': {
            'enabled': True,
            'base_url': 'https://rest.uniprot.org/uniprotkb/',
            'proteins_of_interest': [
                'COL1A1', 'COL1A2', 'COL2A1', 'COL3A1', 'COL4A1', 'COL4A2',
                'ELN', 'FN1', 'LAMA1', 'LAMB1', 'LAMC1', 'HAS1', 'HAS2', 'HAS3',
                'ACAN', 'VCAN', 'DCN', 'TNC', 'SPP1', 'HSPG2', 'VTN', 'BGN'
            ],
            'update_frequency_hours': 168,  # Weekly
            'max_results_per_search': 100
        },
        'string_db': {
            'enabled': True,
            'base_url': 'https://string-db.org/api/',
            'species': '9606',  # Human
            'update_frequency_hours': 168,  # Weekly
            'max_results_per_search': 50
        }
    }
    
    # Processing configuration
    PROCESSING = {
        'use_ai_processing': True,
        'openai_api_key': os.getenv('OPENAI_API_KEY', ''),
        'max_tokens_per_request': 4000,
        'confidence_threshold': 0.7,
        'batch_size': 10
    }
    
    # Data storage configuration
    STORAGE = {
        'data_dir': os.path.join(os.path.dirname(__file__), '..', '..', 'data'),
        'backup_dir': os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'backups'),
        'logs_dir': os.path.join(os.path.dirname(__file__), 'logs'),
        'max_backups': 10
    }
    
    # Web application integration
    WEB_INTEGRATION = {
        'api_url': 'http://localhost:5000',
        'web_dir': os.path.join(os.path.dirname(__file__), '..', 'web'),
        'auto_rebuild': True,
        'rebuild_command': 'npm run build'
    }
    
    # Monitoring and notifications
    MONITORING = {
        'enable_logging': True,
        'log_level': 'INFO',
        'enable_notifications': False,
        'notification_email': os.getenv('NOTIFICATION_EMAIL', ''),
        'health_check_interval_minutes': 30
    }
    
    # ECM-specific configuration
    ECM_CONFIG = {
        'components_file': 'ecm_components.json',
        'cell_types_file': 'cell_types.json',
        'interactions_file': 'interactions.json',
        'proteases_file': 'proteases.json',
        'genes_file': 'genes.json'
    }
    
    @classmethod
    def get_search_terms(cls) -> List[str]:
        """Get all search terms from all enabled sources"""
        terms = []
        for source_config in cls.DATA_SOURCES.values():
            if source_config.get('enabled', False):
                terms.extend(source_config.get('search_terms', []))
        return list(set(terms))  # Remove duplicates
    
    @classmethod
    def get_update_schedule(cls) -> Dict[str, int]:
        """Get update frequencies for all enabled sources"""
        schedule = {}
        for source_name, source_config in cls.DATA_SOURCES.items():
            if source_config.get('enabled', False):
                schedule[source_name] = source_config.get('update_frequency_hours', 24)
        return schedule
    
    @classmethod
    def validate_config(cls) -> List[str]:
        """Validate configuration and return list of issues"""
        issues = []
        
        # Check required API keys
        if cls.PROCESSING['use_ai_processing'] and not cls.PROCESSING['openai_api_key']:
            issues.append("OpenAI API key required for AI processing")
        
        # Check directories exist
        for dir_path in [cls.STORAGE['data_dir'], cls.STORAGE['backup_dir'], cls.STORAGE['logs_dir']]:
            if not os.path.exists(dir_path):
                try:
                    os.makedirs(dir_path, exist_ok=True)
                except Exception as e:
                    issues.append(f"Cannot create directory {dir_path}: {e}")
        
        return issues 