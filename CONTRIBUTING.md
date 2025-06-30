# Contributing to Neural ECM Repository

Thank you for your interest in contributing to the Neural ECM repository! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- Git

### Setup
1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/Neural_ECM.git
   cd Neural_ECM
   ```

3. Set up the development environment:
   ```bash
   # Install Python dependencies
   cd src/api
   pip install -r requirements.txt
   
   # Install Node.js dependencies
   cd ../web
   npm install
   ```

## 📝 Development Guidelines

### Code Style
- **Python**: Follow PEP 8 guidelines
- **JavaScript/React**: Use ESLint and Prettier configurations
- **Documentation**: Write clear, concise comments and docstrings

### Commit Messages
Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Pull Request Process
1. Create a feature branch from `main`
2. Make your changes
3. Add tests if applicable
4. Update documentation
5. Submit a pull request with a clear description

## 🧪 Testing

### API Testing
```bash
cd src/api
python -m pytest tests/
```

### Web Application Testing
```bash
cd src/web
npm test
```

## 📊 Data Contributions

### Adding New ECM Components
1. Update `data/ecm_components.json`
2. Include all required fields:
   - name
   - roles
   - genes
   - interaction_partners
   - receptors
   - interacting_cell_types
   - proteases

### Adding New Cell Types
1. Update `data/cell_types.json`
2. Include comprehensive information about:
   - ECM components produced
   - ECM degrading factors
   - ECM receptors

### Data Validation
All data contributions should be validated using the provided schema:
```bash
python src/utils/validate_data.py
```

## 🔧 Development Workflow

### Running the Application
1. Start the API server:
   ```bash
   cd src/api
   python app.py
   ```

2. Start the web application:
   ```bash
   cd src/web
   npm start
   ```

3. Access the application at `http://localhost:3000`

### Building for Production
```bash
cd src/web
npm run build
```

## 📚 Documentation

### Updating Documentation
- Keep `README.md` up to date
- Update API documentation in `docs/`
- Add inline code comments
- Update component documentation

### Adding New Features
When adding new features:
1. Update the README with usage instructions
2. Add API documentation
3. Include examples
4. Update the web interface if applicable

## 🐛 Bug Reports

When reporting bugs, please include:
- Description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, browser, etc.)
- Screenshots if applicable

## 💡 Feature Requests

When requesting features:
- Describe the feature clearly
- Explain the use case
- Provide examples if possible
- Consider implementation complexity

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

## 🤝 Questions?

If you have questions about contributing:
- Open an issue for general questions
- Check existing issues and pull requests
- Review the documentation

Thank you for contributing to the Neural ECM repository! 