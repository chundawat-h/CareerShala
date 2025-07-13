// CareerShala JavaScript functionality

let allSectorsData = {};
let sectorsLoaded = false;

// Global error handlers
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});

window.addEventListener('error', function(event) {
    console.error('JavaScript error:', event.error);
});

// Smooth scroll to sections
function scrollToSectors() {
    document.getElementById('featured').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Show all sectors function
async function showAllSectors() {
    const allSectorsSection = document.getElementById('all-sectors');
    const featuredSectors = document.getElementById('featured');
    const exploreBtn = document.getElementById('explore-more-btn');
    
    if (!exploreBtn || !allSectorsSection) {
        console.error('Required elements not found');
        return;
    }
    
    // Show loading state
    exploreBtn.innerHTML = '<span class="animate-spin rounded-full h-4 w-4 border-b-2 border-current inline-block mr-2"></span>Loading...';
    exploreBtn.disabled = true;
    
    try {
        if (!sectorsLoaded) {
            // Fetch all sectors data
            const response = await fetch('/api/sectors');
            if (!response.ok) {
                throw new Error('Failed to fetch sectors data');
            }
            

            allSectorsData = await response.json();
            sectorsLoaded = true;
            console.log(allSectorsData)
            // Render all sectors
            renderAllSectors();
        }
        
        // Show the all sectors section
        allSectorsSection.classList.remove('hidden');
        featuredSectors.classList.add('hidden');
        
        // Hide the explore button
        exploreBtn.style.display = 'none';
        
        // Scroll to all sectors
        setTimeout(() => {
            allSectorsSection.scrollIntoView({ 
                behavior: 'smooth' 
            });
        }, 100);
        
    } catch (error) {
        console.error('Error loading sectors:', error);
        exploreBtn.innerHTML = '<i class="fas fa-exclamation-triangle mr-2"></i>Error Loading';
        exploreBtn.className = 'bg-red-500 text-white px-8 py-3 rounded-lg font-medium';
        
        setTimeout(() => {
            exploreBtn.innerHTML = '<i class="fas fa-plus mr-2"></i>Explore All Sectors';
            exploreBtn.className = 'border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-lg font-medium transition-all';
            exploreBtn.disabled = false;
        }, 3000);
    }
}

// Render all sectors organized by categories
function renderAllSectors() {
    const container = document.getElementById('sectors-container');
    
    if (!container) {
        console.error('sectors-container not found');
        return;
    }
    
    if (!allSectorsData || typeof allSectorsData !== 'object') {
        console.error('Invalid sectors data:', allSectorsData);
        container.innerHTML = '<p class="text-center text-gray-600">Error loading sectors data</p>';
        return;
    }
    
    container.innerHTML = '';
    // Category color mapping with Tailwind classes
    const categoryColors = {
    'Art': 'bg-green-100',
    'Skill': 'bg-blue-100',
    'Traditional': 'bg-red-100',
    'Non_traditional': 'bg-yellow-100',
    'Academic': 'bg-purple-100'
    };
    console.log(allSectorsData)
    
    // Create rows for each category
    Object.entries(allSectorsData).forEach(([category, sectors]) => {
        if (!Array.isArray(sectors) || sectors.length === 0) {
            console.warn(`No sectors found for category: ${category}`);
            return;
        }
        
        const categoryRow = document.createElement('div');
        categoryRow.className = `mb-12 px-4 py-6 rounded-lg ${categoryColors[category] || 'bg-gray-100'}`; // background applies here

        
        
        // Horizontal scrolling container
        const scrollContainer = document.createElement('div');
        scrollContainer.className = 'flex gap-6 overflow-x-auto pb-4 px-4 scroll-smooth horizontal-scroll';
        scrollContainer.style.cssText = 'scrollbar-width: none; -ms-overflow-style: none;';
        scrollContainer.style.setProperty('scrollbar-width', 'none');
        
        scrollContainer.classList.add('flex', 'flex-row');

        
        // Create sector cards
        sectors.forEach(sector => {
            if (sector && sector.id && sector.name) {
                const sectorCard = createSectorCard(sector, category, true);
                scrollContainer.appendChild(sectorCard);
            } else {
                console.warn('Invalid sector data:', sector);
            }
        });
        
        // categoryRow.appendChild(categoryTitle);
        categoryRow.appendChild(scrollContainer);
        container.appendChild(categoryRow);
    });
    
}


function createSectorCard(sector, category, isHorizontal = false) {
    if (!sector || !sector.id || !sector.name) {
        console.error('Invalid sector data for card creation:', sector);
        return document.createElement('div');
    }
    console.log(sector.icon)
    const cardDiv = document.createElement('div');
    cardDiv.className = isHorizontal ? 'flex-none w-44 h-44 md:w-56 md:h-56' : 'w-full h-40';
    
    const sectorIcon = sector.icon || 'static/media/sectors/default.png';
    const sectorName = sector.name || 'Unknown Sector';
    const sectorId = sector.id || '';
    
    const cardHTML = `
        <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-100 h-full flex flex-col justify-center items-center p-4" onclick="window.location.href='/sector/${sectorId}'">
            <div class="mb-3">
                <img src="${sectorIcon}" alt="${sectorName}" class="w-12 h-12 md:w-16 md:h-16 object-contain" 
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iOCIgZmlsbD0iIzM0MzQzNCIvPgo8cGF0aCBkPSJNNDAgMjBWNjBNMjAgNDBINjAiIHN0cm9rZT0iIzY2NjY2NiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHN2Zz4K'">
            </div>
            <h5 class="text-sm md:text-base font-bold text-gray-800 text-center leading-tight">${sectorName}</h5>
        </div>
    `;
    
    cardDiv.innerHTML = cardHTML;
    return cardDiv;
}

// Add horizontal scroll functionality with mouse wheel
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling for horizontal containers
    document.addEventListener('wheel', function(e) {
        const hoveredElement = document.elementFromPoint(e.clientX, e.clientY);
        const scrollContainer = hoveredElement?.closest('.horizontal-scroll');
        
        if (scrollContainer) {
            e.preventDefault();
            scrollContainer.scrollLeft += e.deltaY;
        }
    });
    
    // Add touch/drag scrolling for mobile
    let isDown = false;
    let startX;
    let scrollLeft;
    
    document.addEventListener('mousedown', function(e) {
        const scrollContainer = e.target.closest('.horizontal-scroll');
        if (scrollContainer) {
            isDown = true;
            startX = e.pageX - scrollContainer.offsetLeft;
            scrollLeft = scrollContainer.scrollLeft;
            scrollContainer.style.cursor = 'grabbing';
        }
    });
    
    document.addEventListener('mouseleave', function() {
        isDown = false;
        document.querySelectorAll('.horizontal-scroll').forEach(container => {
            container.style.cursor = 'grab';
        });
    });
    
    document.addEventListener('mouseup', function() {
        isDown = false;
        document.querySelectorAll('.horizontal-scroll').forEach(container => {
            container.style.cursor = 'grab';
        });
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDown) return;
        const scrollContainer = e.target.closest('.horizontal-scroll');
        if (scrollContainer) {
            e.preventDefault();
            const x = e.pageX - scrollContainer.offsetLeft;
            const walk = (x - startX) * 2;
            scrollContainer.scrollLeft = scrollLeft - walk;
        }
    });
});

// Institution exploration functionality
function showInstitutionExplorer() {
    const modalHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" id="institutionModal" onclick="closeInstitutionModal(event)">
            <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
                <div class="p-6 border-b">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold text-gray-800">संस्थान खोजें</h2>
                        <button onclick="closeInstitutionModal()" class="text-gray-500 hover:text-gray-700 text-2xl">×</button>
                    </div>
                </div>
                <div class="p-6">
                    <div id="sector-selection">
                        <h3 class="text-lg font-semibold mb-4 text-gray-800">सेक्टर चुनें:</h3>
                        <div id="modal-sectors-container">
                            <div class="text-center py-8">
                                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                <p class="mt-3 text-gray-600">सेक्टर लोड हो रहे हैं...</p>
                            </div>
                        </div>
                    </div>
                    
                    <div id="category-selection" class="hidden">
                        <h3 class="text-lg font-semibold mb-4 text-gray-800">करियर श्रेणी चुनें:</h3>
                        <div id="modal-categories-container"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('institutionModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    loadSectorsForInstitutionModal();
}

function closeInstitutionModal(event) {
    if (event && event.target !== event.currentTarget) return;
    const modal = document.getElementById('institutionModal');
    if (modal) {
        modal.remove();
    }
}

async function loadSectorsForInstitutionModal() {
    try {
        const response = await fetch('/api/sectors');
        if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch sectors`);
        
        const sectorsData = await response.json();
        if (!sectorsData || typeof sectorsData !== 'object') {
            throw new Error('Invalid sectors data received');
        }
        
        renderSectorsInModal(sectorsData);
    } catch (error) {
        console.error('Error loading sectors for modal:', error);
        const container = document.getElementById('modal-sectors-container');
        if (container) {
            container.innerHTML = '<p class="text-red-600 text-center py-4">सेक्टर लोड करने में त्रुटि हुई। कृपया पुनः प्रयास करें।</p>';
        }
    }
}

function renderSectorsInModal(sectorsData) {
    const container = document.getElementById('modal-sectors-container');
    let sectorsHTML = '<div class="grid grid-cols-2 md:grid-cols-4 gap-4">';
    
    const allSectors = [];
    Object.entries(sectorsData).forEach(([category, sectors]) => {
        sectors.forEach(sector => {
            allSectors.push({...sector, category});
        });
    });
    
    allSectors.forEach(sector => {
        sectorsHTML += `
            <div class="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow h-32 flex flex-col items-center justify-center text-center" 
                 onclick="selectSectorForInstitution('${sector.id}', '${sector.name}', '${sector.category}')">
                <div class="mb-2">
                    <img src="${sector.icon}" alt="${sector.name}" class="w-8 h-8 object-contain mx-auto">
                </div>
                <h6 class="text-sm font-semibold text-gray-800 leading-tight">${sector.name}</h6>
            </div>
        `;
    });
    
    sectorsHTML += '</div>';
    container.innerHTML = sectorsHTML;
}

async function selectSectorForInstitution(sectorId, sectorName, category) {
    try {
        document.getElementById('sector-selection').classList.add('hidden');
        document.getElementById('category-selection').classList.remove('hidden');
        
        const response = await fetch(`/api/sector/${sectorId}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch sector data`);
        
        const sectorData = await response.json();
        if (!sectorData) {
            throw new Error('No sector data received');
        }
        
        renderCategoriesInModal(sectorData.career_categories || [], sectorId, sectorName);
    } catch (error) {
        console.error('Error loading categories:', error);
        const container = document.getElementById('modal-categories-container');
        if (container) {
            container.innerHTML = '<p class="text-red-600 text-center py-4">करियर श्रेणी लोड करने में त्रुटि हुई। कृपया पुनः प्रयास करें।</p>';
        }
        // Show sector selection again on error
        document.getElementById('category-selection').classList.add('hidden');
        document.getElementById('sector-selection').classList.remove('hidden');
    }
}

function renderCategoriesInModal(categories, sectorId, sectorName) {
    const container = document.getElementById('modal-categories-container');
    
    if (!categories || categories.length === 0) {
        container.innerHTML = '<p class="text-gray-600">इस सेक्टर के लिए करियर श्रेणी उपलब्ध नहीं है।</p>';
        return;
    }
    
    let categoriesHTML = '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
    
    categories.forEach(category => {
        const iconClass = getCategoryIcon(category.category);
        categoriesHTML += `
            <div class="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow h-32 flex flex-col items-center justify-center text-center"
                 onclick="goToInstitutions('${sectorId}', '${encodeURIComponent(category.category)}')">
                <div class="mb-3">
                    <i class="${iconClass} text-2xl text-gray-600"></i>
                </div>
                <h6 class="text-sm font-semibold text-gray-800">${category.category}</h6>
            </div>
        `;
    });
    
    categoriesHTML += '</div>';
    container.innerHTML = categoriesHTML;
}

function getCategoryIcon(categoryName) {
    const iconMap = {
        'Content Creation': 'fas fa-pen-fancy',
        'Media Production': 'fas fa-video',
        'Journalism': 'fas fa-newspaper',
        'Broadcasting': 'fas fa-microphone',
        'Digital Media': 'fas fa-laptop'
    };
    
    return iconMap[categoryName] || 'fas fa-briefcase';
}

function goToInstitutions(sectorId, categoryName) {
    closeInstitutionModal();
    
    // Check if there's a pre-selected state from direct search
    const selectedState = sessionStorage.getItem('selectedState');
    let url = `/institutions?sector=${sectorId}&category=${encodeURIComponent(categoryName)}`;
    
    if (selectedState) {
        url += `&state=${selectedState}&direct=true`;
        // Clear the stored state
        sessionStorage.removeItem('selectedState');
        sessionStorage.removeItem('selectedStateName');
    }
    
    window.location.href = url;
}

// Direct institution search functionality
function showDirectInstitutionSearch() {
    const availableStates = [
        { id: 'delhi', name: 'दिल्ली' },
        { id: 'maharashtra', name: 'महाराष्ट्र' },
        { id: 'karnataka', name: 'कर्नाटक' },
        { id: 'tamil_nadu', name: 'तमिल नाडु' },
        { id: 'uttar_pradesh', name: 'उत्तर प्रदेश' },
        { id: 'west_bengal', name: 'पश्चिम बंगाल' },
        { id: 'gujarat', name: 'गुजरात' },
        { id: 'rajasthan', name: 'राजस्थान' },
        { id: 'haryana', name: 'हरियाणा' },
        { id: 'punjab', name: 'पंजाब' }
    ];

    const modalHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" id="stateSearchModal" onclick="closeStateSearchModal(event)">
            <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
                <div class="p-6 border-b">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold text-gray-800">राज्य चुनें</h2>
                        <button onclick="closeStateSearchModal()" class="text-gray-500 hover:text-gray-700 text-2xl">×</button>
                    </div>
                </div>
                <div class="p-6">
                    <p class="text-gray-600 mb-6">अपने राज्य के संस्थान देखने के लिए राज्य चुनें:</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${availableStates.map(state => `
                            <div class="bg-gray-50 hover:bg-yellow-50 border border-gray-200 hover:border-yellow-300 rounded-lg p-4 cursor-pointer transition-all"
                                 onclick="selectStateForInstitutions('${state.id}', '${state.name}')">
                                <div class="flex items-center">
                                    <i class="fas fa-map-marker-alt text-yellow-600 mr-3"></i>
                                    <span class="font-medium text-gray-800">${state.name}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('stateSearchModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeStateSearchModal(event) {
    if (event && event.target !== event.currentTarget) return;
    const modal = document.getElementById('stateSearchModal');
    if (modal) {
        modal.remove();
    }
}

function selectStateForInstitutions(stateId, stateName) {
    closeStateSearchModal();
    
    // Store the selected state in sessionStorage for later use
    sessionStorage.setItem('selectedState', stateId);
    sessionStorage.setItem('selectedStateName', stateName);
    
    // Show sector and category selection modal
    showInstitutionExplorer();
}
// INSTITUTION HANDLING
function loadInstitutions(sectorId, category, career, state) {
    const params = new URLSearchParams();
    params.append('sector', sectorId);
    if (category) params.append('category', category);
    if (career) params.append('career', career);
    if (state) params.append('state', state);

    fetch(`/api/institutions?${params.toString()}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            renderInstitutions(data);
        })
        .catch(error => {
            console.error('Institution load error:', error);
            alert('Failed to load institutions: ' + error.message);
        });
}

function renderInstitutions(data) {
    const container = document.getElementById('institutions-container');
    if (!container) return;

    let html = `
        <h3>${data.sector_name || 'Institutions'}</h3>
        ${data.category ? `<p>Category: ${data.category}</p>` : ''}
        ${data.career ? `<p>Career: ${data.career}</p>` : ''}
        <div class="institution-list">
    `;

    if (!data.institutions || data.institutions.length === 0) {
        html += `<p>No institutions found</p>`;
    } else {
        data.institutions.forEach(inst => {
            html += `<div class="institution-item">${inst}</div>`;
        });
    }

    html += `</div>`;
    container.innerHTML = html;
}

// Add to existing career detail handler
function showCareerDetail(careerName, sectorId, category) {
    // ... existing code ...
    
    // Add institution loading option
    const stateSelect = document.createElement('select');
    stateSelect.innerHTML = `
        <option value="">Select State</option>
        <option value="delhi">Delhi</option>
        <option value="haryana">Haryana</option>
        <!-- Add other states -->
    `;
    stateSelect.onchange = () => {
        if (stateSelect.value) {
            loadInstitutions(sectorId, category, careerName, stateSelect.value);
        }
    };
    
    // Add this to your career detail container
    document.getElementById('career-detail-container').appendChild(stateSelect);
    document.getElementById('institutions-container').innerHTML = '';
}
function trackSectorClick(sectorId, category) {
    console.log(`Sector clicked: ${sectorId} in category: ${category}`);
}

// Mobile menu toggle functionality
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
}

// Error handling for images
document.addEventListener('DOMContentLoaded', function() {
    // Handle image loading errors
    document.addEventListener('error', function(e) {
        if (e.target.tagName === 'IMG' && e.target.src.includes('/static/media/sectors/')) {
            console.warn('Failed to load sector image:', e.target.src);
            // Image will use fallback from onerror attribute
        }
    }, true);
});

// Add loading states and feedback
function showLoadingState(element, text = 'Loading...') {
    const originalHTML = element.innerHTML;
    element.innerHTML = `<span class="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></span>${text}`;
    element.disabled = true;
    return originalHTML;
}

function hideLoadingState(element, originalHTML) {
    element.innerHTML = originalHTML;
    element.disabled = false;
}

// Add click tracking to sector cards  
document.addEventListener('click', function(e) {
    const sectorCard = e.target.closest('[onclick*="sector"]');
    if (sectorCard) {
        const sectorName = sectorCard.querySelector('h5')?.textContent;
        if (sectorName) {
            console.log(`Sector clicked: ${sectorName}`);
        }
    }
});
