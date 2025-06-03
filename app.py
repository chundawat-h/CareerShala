import os
import json
import logging
# import flask_cors
from flask import Flask, render_template, jsonify, request
import pandas as pd
# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

# Helper function to load JSON data
def load_json_data(filename, state=None):
    """Load JSON data from the data directory or state-specific folder"""
    if state:
        # Map state names to folder names
        state_folder_map = {
            'Delhi': 'delhi',
            'Madhyapradesh': 'madhyapradesh', 
            'Bangalore': 'bangalore',
            'Haryana': 'haryana',
            'Uttarakhand': 'uttarakhand'
        }
        folder_name = state_folder_map.get(state, state.lower())
        file_path = f'data/{folder_name}/{filename}'
    else:
        file_path = f'data/{filename}'
    
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return json.load(file)
    except FileNotFoundError:
        app.logger.error(f"Data file {filename} not found in path {file_path}")
        return {}
    except json.JSONDecodeError as e:
        app.logger.error(f"Error parsing JSON from {file_path}: {e}")
        return {}

# Main page routes
@app.route('/')
def index():
    """Homepage with state selection"""
    return render_template('index.html')

@app.route('/sectors')
def sectors():
    """Sectors page for selected state"""
    state = request.args.get('state')
    if not state:
        return render_template('sectors.html', error="No state selected")
    return render_template('sectors.html', state=state)

@app.route('/careers')
def careers():
    """Careers page for selected sector"""
    state = request.args.get('state')
    sector = request.args.get('sector')
    if not state or not sector:
        return render_template('careers.html', error="Missing state or sector")
    return render_template('careers.html', state=state, sector=sector)

@app.route('/career-detail')
def career_detail():
    """Career detail page"""
    state = request.args.get('state')
    sector = request.args.get('sector')
    career = request.args.get('career')
    if not all([state, sector, career]):
        return render_template('career-detail.html', error="Missing required parameters")
    return render_template('career-detail.html', state=state, sector=sector, career=career)

@app.route('/institutions')
def institutions():
    """Institutions page"""
    return render_template('institutions.html')

# API Routes
@app.route('/api/sectors')
def api_sectors():
    """Get sectors for a specific state"""
    state = request.args.get('state')
    if not state:
        return jsonify({'error': 'State parameter is required'}), 400
    
    # Get available sectors for the state
    
    try:        
        Allsectors = pd.read_json('data/sectors.json')
        sectors = Allsectors[state.capitalize()].to_list()
            
    except Exception as e:
        app.logger.error(f"Error loading sectors for state {state}: {e}")
    
    return jsonify({
        'state': state,
        'sectors': sectors
    })

@app.route('/api/careers/<sector>')
def api_careers(sector):
    """Get careers for a specific sector"""
    state = request.args.get('state')
    if not state:
        return jsonify({'error': 'State parameter is required'}), 400
    
    # Load sector data from state-specific folder
    sector_data = load_json_data(f'{sector}.json', state)
    if not sector_data:
        return jsonify({
            'state': state,
            'sector': sector,
            'careers': []
        })
    
    # Extract careers from all categories
    all_careers = []
    for category in sector_data.get('career_categories', []):
        for career in category.get('careers', []):
            career_item = {
                'id': career['id'],
                'name': career['name'],
                'description': f"Stream: {career['stream']} | Duration: {career['duration']}",
                'category': category['category'],
                'courses': career['courses']
            }
            all_careers.append(career_item)
    
    return jsonify({
        'state': state,
        'sector': sector,
        'careers': all_careers
    })

@app.route('/api/career-path/<career>')
def api_career_path(career):
    """Get detailed career path information"""
    state = request.args.get('state')
    sector = request.args.get('sector')
    
    if not state or not sector:
        # Try to find in any available state/sector
        for state_name in ['Mumbai', 'Delhi', 'Haryana', 'Uttarakhand']:
            for sector_name in ['media_journalism', 'technology', 'healthcare', 'education']:
                sector_data = load_json_data(f'{sector_name}.json', state_name)
                if sector_data and career in sector_data.get('career_paths', {}):
                    career_info = sector_data['career_paths'][career]
                    return jsonify({
                        'career': career,
                        'path': career_info
                    })
    else:
        # Load from specific state and sector
        sector_data = load_json_data(f'{sector}.json', state)
        if sector_data and career in sector_data.get('career_paths', {}):
            career_info = sector_data['career_paths'][career]
            return jsonify({
                'career': career,
                'path': career_info
            })
    
    return jsonify({'error': 'Career path data not available yet. More sectors coming soon!'}), 404

@app.route('/api/institutions/<career>')
def api_institutions(career):
    """Get institutions for a specific career and state"""
    state = request.args.get('state')
    if not state:
        return jsonify({'error': 'State parameter is required'}), 400
    
    # Check if it's a media-journalism career
    media_data = load_json_data('media_journalism.json')
    if media_data:
        institutions = media_data.get('institutions', {})
        
        # Return all institutions with state information
        all_institutions = []
        states_data = institutions.get('states', {})
        
        for state_name, inst_list in states_data.items():
            for inst_name in inst_list:
                all_institutions.append({
                    'name': inst_name,
                    'state': state_name,
                    'type': 'Government' if 'Government' in inst_name or 'University' in inst_name else 'Private',
                    'courses': ['Mass Communication', 'Journalism', 'Digital Media'],
                    'fees': '₹50K-3 Lakhs',
                    'ranking': 'Top Institution',
                    'website': '#'
                })
        
        return jsonify({
            'career': career,
            'state': state,
            'institutions': all_institutions,
            'available_states': list(states_data.keys())
        })
    
    # Handle existing careers
    institutions_data = load_json_data('institutions.json')
    career_institutions = institutions_data.get(career, {})
    state_institutions = career_institutions.get(state, [])
    
    return jsonify({
        'career': career,
        'state': state,
        'institutions': state_institutions
    })

@app.route('/api/institutions/all')
def api_all_institutions():
    """Get all institutions"""
    state = request.args.get('state', 'all')
    
    # Load from media-journalism data
    media_data = load_json_data('media_journalism.json')
    if media_data:
        institutions = media_data.get('institutions', {})
        
        # Extract all institutions with state information
        all_institutions = []
        states_data = institutions.get('states', {})
        
        for state_name, inst_list in states_data.items():
            for inst_name in inst_list:
                all_institutions.append({
                    'name': inst_name,
                    'location': state_name,
                    'type': 'Government' if 'Government' in inst_name or 'University' in inst_name else 'Private',
                    'courses': ['Mass Communication', 'Journalism', 'Digital Media'],
                    'website': 'example.edu'
                })
        
        # Filter by state if specified
        if state.lower() != 'all':
            filtered_institutions = [inst for inst in all_institutions if inst.get('location', '').lower() == state.lower()]
        else:
            filtered_institutions = all_institutions
        
        return jsonify({
            'state': state,
            'institutions': filtered_institutions
        })
    
    return jsonify({
        'state': state,
        'institutions': []
    })

@app.route('/data/<state>/<sector>.json')
def serve_sector_data(state, sector):
    """Serve sector JSON data for a specific state"""
    sector_data = load_json_data(f'{sector}.json', state)
    if sector_data:
        return jsonify(sector_data)
    return jsonify({'error': 'Data not found'}), 404

# Error handlers
@app.errorhandler(404)
def page_not_found(e):
    return render_template('base.html', error="Page not found"), 404

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('base.html', error="Internal server error"), 500

if __name__ == '__main__':
    app.run(debug=True)
