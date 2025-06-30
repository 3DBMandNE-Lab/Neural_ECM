import requests
import time
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import xml.etree.ElementTree as ET

@dataclass
class PubMedArticle:
    """Data class for PubMed article information"""
    pmid: str
    title: str
    abstract: str
    authors: List[str]
    journal: str
    publication_date: str
    keywords: List[str]
    doi: Optional[str] = None
    mesh_terms: List[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'pmid': self.pmid,
            'title': self.title,
            'abstract': self.abstract,
            'authors': self.authors,
            'journal': self.journal,
            'publication_date': self.publication_date,
            'keywords': self.keywords,
            'doi': self.doi,
            'mesh_terms': self.mesh_terms or []
        }

class PubMedTrawler:
    """Trawler for PubMed database to find ECM-related research"""
    
    def __init__(self, api_key: str = '', base_url: str = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/'):
        self.api_key = api_key
        self.base_url = base_url
        self.logger = logging.getLogger(__name__)
        
    def search_articles(self, query: str, max_results: int = 50, days_back: int = 30) -> List[PubMedArticle]:
        """Search PubMed for articles matching the query"""
        try:
            # Calculate date range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days_back)
            date_range = f"{start_date.strftime('%Y/%m/%d')}:{end_date.strftime('%Y/%m/%d')}[dp]"
            
            # Build search query with date filter
            full_query = f"({query}) AND {date_range}"
            
            # Search for article IDs
            search_params = {
                'db': 'pubmed',
                'term': full_query,
                'retmax': max_results,
                'retmode': 'xml',
                'sort': 'date'
            }
            
            if self.api_key:
                search_params['api_key'] = self.api_key
                
            response = requests.get(f"{self.base_url}esearch.fcgi", params=search_params)
            response.raise_for_status()
            
            # Parse search results
            root = ET.fromstring(response.content)
            id_list = root.find('.//IdList')
            if id_list is None:
                self.logger.warning(f"No articles found for query: {query}")
                return []
                
            pmids = [id_elem.text for id_elem in id_list.findall('Id')]
            
            if not pmids:
                return []
                
            # Fetch article details
            articles = self._fetch_article_details(pmids)
            
            self.logger.info(f"Found {len(articles)} articles for query: {query}")
            return articles
            
        except Exception as e:
            self.logger.error(f"Error searching PubMed: {e}")
            return []
    
    def _fetch_article_details(self, pmids: List[str]) -> List[PubMedArticle]:
        """Fetch detailed information for a list of PMIDs"""
        articles = []
        
        # Process in batches to avoid overwhelming the API
        batch_size = 20
        for i in range(0, len(pmids), batch_size):
            batch_pmids = pmids[i:i + batch_size]
            
            try:
                # Fetch article details
                fetch_params = {
                    'db': 'pubmed',
                    'id': ','.join(batch_pmids),
                    'retmode': 'xml',
                    'rettype': 'abstract'
                }
                
                if self.api_key:
                    fetch_params['api_key'] = self.api_key
                    
                response = requests.get(f"{self.base_url}efetch.fcgi", params=fetch_params)
                response.raise_for_status()
                
                # Parse article details
                batch_articles = self._parse_article_xml(response.content)
                articles.extend(batch_articles)
                
                # Rate limiting
                time.sleep(0.1)
                
            except Exception as e:
                self.logger.error(f"Error fetching article details for batch {i//batch_size}: {e}")
                continue
                
        return articles
    
    def _parse_article_xml(self, xml_content: bytes) -> List[PubMedArticle]:
        """Parse PubMed XML response into Article objects"""
        articles = []
        
        try:
            root = ET.fromstring(xml_content)
            
            for article_elem in root.findall('.//PubmedArticle'):
                try:
                    # Extract basic information
                    pmid = self._extract_text(article_elem, './/PMID')
                    title = self._extract_text(article_elem, './/ArticleTitle')
                    abstract = self._extract_text(article_elem, './/AbstractText')
                    journal = self._extract_text(article_elem, './/Journal/Title')
                    
                    # Extract authors
                    authors = []
                    for author_elem in article_elem.findall('.//Author'):
                        last_name = self._extract_text(author_elem, 'LastName')
                        first_name = self._extract_text(author_elem, 'ForeName')
                        if last_name and first_name:
                            authors.append(f"{first_name} {last_name}")
                    
                    # Extract publication date
                    pub_date = self._extract_publication_date(article_elem)
                    
                    # Extract keywords
                    keywords = []
                    for keyword_elem in article_elem.findall('.//Keyword'):
                        if keyword_elem.text:
                            keywords.append(keyword_elem.text)
                    
                    # Extract DOI
                    doi = self._extract_text(article_elem, './/ELocationID[@EIdType="doi"]')
                    
                    # Extract MeSH terms
                    mesh_terms = []
                    for mesh_elem in article_elem.findall('.//MeshHeading/DescriptorName'):
                        if mesh_elem.text:
                            mesh_terms.append(mesh_elem.text)
                    
                    if pmid and title:  # Only include articles with at least PMID and title
                        article = PubMedArticle(
                            pmid=pmid,
                            title=title,
                            abstract=abstract or '',
                            authors=authors,
                            journal=journal or '',
                            publication_date=pub_date,
                            keywords=keywords,
                            doi=doi,
                            mesh_terms=mesh_terms
                        )
                        articles.append(article)
                        
                except Exception as e:
                    self.logger.warning(f"Error parsing individual article: {e}")
                    continue
                    
        except Exception as e:
            self.logger.error(f"Error parsing PubMed XML: {e}")
            
        return articles
    
    def _extract_text(self, element, xpath: str) -> str:
        """Extract text from XML element using XPath"""
        found = element.find(xpath)
        return found.text if found is not None and found.text else ''
    
    def _extract_publication_date(self, article_elem) -> str:
        """Extract publication date from article element"""
        # Try to get the most recent publication date
        pub_dates = article_elem.findall('.//PubDate')
        if not pub_dates:
            return ''
            
        # Use the first available date
        pub_date = pub_dates[0]
        year = self._extract_text(pub_date, 'Year')
        month = self._extract_text(pub_date, 'Month')
        day = self._extract_text(pub_date, 'Day')
        
        if year:
            date_parts = [year]
            if month:
                date_parts.append(month)
            if day:
                date_parts.append(day)
            return '-'.join(date_parts)
        
        return ''
    
    def extract_ecm_insights(self, articles: List[PubMedArticle]) -> Dict[str, Any]:
        """Extract ECM-related insights from articles"""
        insights = {
            'new_components': [],
            'new_interactions': [],
            'new_proteases': [],
            'new_cell_types': [],
            'updated_functions': [],
            'research_trends': []
        }
        
        # Keywords and patterns to look for
        ecm_components = [
            'collagen', 'elastin', 'fibronectin', 'laminin', 'hyaluronic acid',
            'aggrecan', 'versican', 'decorin', 'tenascin', 'osteopontin',
            'perlecan', 'vitronectin', 'biglycan'
        ]
        
        proteases = [
            'mmp', 'matrix metalloproteinase', 'adamts', 'cathepsin',
            'plasmin', 'elastase', 'hyaluronidase'
        ]
        
        cell_types = [
            'neuron', 'astrocyte', 'microglia', 'oligodendrocyte',
            'fibroblast', 'endothelial', 'epithelial', 'chondrocyte'
        ]
        
        for article in articles:
            text_to_search = f"{article.title} {article.abstract}".lower()
            
            # Check for new ECM components
            for component in ecm_components:
                if component in text_to_search:
                    insights['new_components'].append({
                        'component': component,
                        'article': article.pmid,
                        'title': article.title,
                        'date': article.publication_date
                    })
            
            # Check for proteases
            for protease in proteases:
                if protease in text_to_search:
                    insights['new_proteases'].append({
                        'protease': protease,
                        'article': article.pmid,
                        'title': article.title,
                        'date': article.publication_date
                    })
            
            # Check for cell types
            for cell_type in cell_types:
                if cell_type in text_to_search:
                    insights['new_cell_types'].append({
                        'cell_type': cell_type,
                        'article': article.pmid,
                        'title': article.title,
                        'date': article.publication_date
                    })
        
        return insights 