import os
import json
import random
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "careershala-secret-key")

def load_sectors():
    try:
        with open('static/sectors.json', 'r', encoding='utf-8') as f:
            sectors = json.load(f)
            
            # Add default icon path to all sectors
            for category in sectors.values():
                for sector in category:
                    if not sector.get('icon'):
                        sector['icon'] = '/static/media/sectors/default.png'
            return sectors
            
    except Exception as e:
        print(f"Error loading sectors: {e}")
        return {}

@app.route('/')
def index():
    """Main page route"""
    sectors_data = load_sectors()
    
    # Get 3 random sectors from all categories
    all_sectors = []
    for category, sectors in sectors_data.items():
        for sector in sectors:
            sector['category'] = category
            all_sectors.append(sector)
    
    random_sectors = random.sample(all_sectors, min(3, len(all_sectors)))
    
    return render_template('index.html', random_sectors=random_sectors)

@app.route('/self')
def self_page():
    return render_template('self.html')

@app.route('/world')
def world_page():
    return render_template('world.html')

@app.route('/api/sectors')
def get_all_sectors():
    """API endpoint to get all sectors organized by category"""
    sectors_data = load_sectors()
    return jsonify(sectors_data)

@app.route('/api/sector/<sector_id>')
def get_sector_detail(sector_id):
    """API endpoint to get detailed information for a specific sector"""
    try:
        # First find which category the sector belongs to
        sectors_data = load_sectors()
        sector_category = None
        
        for category, sectors in sectors_data.items():
            for sector in sectors:
                if sector['id'] == sector_id:
                    sector_category = category
                    break
            if sector_category:
                break
        
        if not sector_category:
            return jsonify({'error': 'Sector not found'}), 404
        
        # Try to load detailed sector data from JSON file
        category_folder = sector_category.replace(' ', '_').replace('-', '_')
        file_path = f'data/{category_folder}/{sector_id}.json'
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                sector_detail = json.load(f)
                return jsonify(sector_detail)
        except FileNotFoundError:
            # Return basic info if detailed file doesn't exist
            return jsonify({
                'sector_id': sector_id,
                'message': 'Detailed information coming soon',
                'careers': [],
                'common_info': None
            })
            
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/sector/<sector_id>')
def sector_detail(sector_id):
    """Individual sector page"""
    sectors_data = load_sectors()
    
    # Find the sector across all categories
    sector = None
    category = None
    # category = get_category_by_sector_id(sectors_data, sector_id)
    # if not category:
    #     return "Sector not found", 404
    
    for cat, sectors in sectors_data.items():
        for s in sectors:
            if s['id'] == sector_id:
                sector = s
                category = cat.lower()
                break
        if sector:
            break
    
    if not sector:
        return "Sector not found", 404
    
    
    return render_template('sector_detail.html', sector=sector, category=category)
def get_category_by_sector_id(sectors_data, sector_id):
    return next(
        (category for category, sectors in sectors_data.items() 
                for s in sectors 
                if s['id'] == sector_id),
        None  # Return None if sector_id not found
    )
# s=load_sectors()
print(get_category_by_sector_id(load_sectors(),'media_journalism').lower())

@app.route('/careers')
def careers():
    sector_id = request.args.get('sector')
    category_name = request.args.get('category')
    print(sector_id)
    # Load sector data
    sectors_data = load_sectors()
    sector = next(
    (s for cat in sectors_data.values() for s in cat if s['id'] == sector_id),
    None
)
    category_folder = get_category_by_sector_id(sectors_data=sectors_data,sector_id=sector_id).lower()
    # print(sector)
    if not category_folder:
        return "Sector not found", 404
        
    # Load detailed sector data
    
    file_path = f'data/{category_folder}/{sector_id}.json'
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            sector_data = json.load(f)
          
        # Find matching category
        category_data = next(
            (cat for cat in sector_data.get('career_categories', []) 
             if cat['category'] == category_name),
            None
        )
        print(category_data)
        return render_template(
            'careers.html',
            sector=sector,
            category=category_data,
            sector_data=sector_data
        )
        
    except Exception as e:
        return f"Error loading careers: {str(e)}", 500

@app.route('/career-detail')
def career_detail():
    """Career detail page"""
    return render_template('career-detail.html')

@app.route('/institutions')
def institutions():
    """Institutions page"""
    return render_template('institutions.html')
@app.route('/sectors')
def sector_listing():
    """New route for direct institution search flow"""
    state = request.args.get('state')
    direct_mode = request.args.get('direct') == 'true'
    
    sectors_data = load_sectors()
    return render_template(
        'sectors.html', 
        sectors_data=sectors_data,
        state=state,
        direct_mode=direct_mode
    )
@app.route('/api/institutions')
def get_institutions():
    """Modified to handle both flows"""
    sector_id = request.args.get('sector')
    category = request.args.get('category')
    career = request.args.get('career')
    state = request.args.get('state')

    try:
        # Load sector data
        sectors_data = load_sectors()
        sector = next(
            (s for cat in sectors_data.values() 
             for s in cat if s['id'] == sector_id), 
            None
        )
        if not sector:
            return jsonify({'error': 'Sector not found'}), 404

        # Load detailed sector data
        category_folder = sector['category'].replace(' ', '_')
        file_path = f'data/{category_folder}/{sector_id}.json'
        
        with open(file_path, 'r', encoding='utf-8') as f:
            sector_data = json.load(f)

        # Find matching career
        institutions = []
        for cat in sector_data.get('career_categories', []):
            if not category or cat['category'] == category:
                for cr in cat.get('careers', []):
                    if not career or cr['name'] == career or cr.get('hindi_name') == career:
                        if state:
                            institutions.extend(cr.get('institutions', {}).get(state, []))
                        else:
                            # Get all institutions if no state specified
                            for state_inst in cr.get('institutions', {}).values():
                                institutions.extend(state_inst)

        return jsonify({
            'institutions': institutions,
            'sector_name': sector_data.get('sector_name'),
            'category': category,
            'career': career,
            'state': state
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
