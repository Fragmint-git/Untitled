/**
 * Release Notes Management Module
 * Handles the creation, editing, and management of release notes from the admin panel
 */

// Initial sample data for release notes
const releaseNotesData = [
    {
        version: "2.0.1",
        date: "2023-03-15",
        status: "current",
        features: [
            "Added About and Special Thanks sections to the Settings page",
            "Implemented Release Notes page with version history",
            "Added ability for administrators to update release notes"
        ],
        improvements: [
            "Enhanced UI responsiveness across all sections",
            "Optimized performance for matchmaking algorithm",
            "Updated user profile management system"
        ],
        bugfixes: [
            "Fixed issue with tournament registration in certain timezones",
            "Resolved notification persistence issues",
            "Fixed navigation glitches when switching between sections"
        ]
    },
    {
        version: "2.0.0",
        date: "2023-03-01",
        status: "stable",
        features: [
            "Complete redesign of the VR Battle Royale platform",
            "New matchmaking system for quick and custom matches",
            "Integrated tournament management system",
            "Friend system with real-time status updates",
            "Games library with support for multiple VR titles",
            "User profiles with customization options",
            "Wallet system for tournament prizes and purchases",
            "XP and leveling system with achievements",
            "Store with merchandise, themes, and add-ons"
        ],
        improvements: [],
        bugfixes: []
    },
    {
        version: "1.5.0",
        date: "2023-02-15",
        status: "beta",
        features: [
            "Preview of new UI design",
            "Beta testing of matchmaking improvements",
            "Early access to tournament creation tools"
        ],
        improvements: [],
        bugfixes: [
            "Performance issues on certain hardware configurations",
            "Intermittent connectivity problems with matchmaking",
            "Profile image uploading occasionally fails"
        ]
    }
];

// DOM Elements
let versionList;
let versionNumber;
let releaseDate;
let releaseStatus;
let featuresList;
let improvementsList;
let bugfixesList;
let saveReleaseBtn;
let deleteReleaseBtn;
let previewReleaseBtn;
let addReleaseBtn;

// Current version being edited
let currentVersion = null;

// Initialize module
function init() {
    // Get DOM elements
    versionList = document.getElementById('version-list');
    versionNumber = document.getElementById('version-number');
    releaseDate = document.getElementById('release-date');
    releaseStatus = document.getElementById('release-status');
    featuresList = document.getElementById('features-list');
    improvementsList = document.getElementById('improvements-list');
    bugfixesList = document.getElementById('bugfixes-list');
    saveReleaseBtn = document.getElementById('save-release-btn');
    deleteReleaseBtn = document.getElementById('delete-release-btn');
    previewReleaseBtn = document.getElementById('preview-release-btn');
    addReleaseBtn = document.getElementById('add-release-btn');

    // Add event listeners
    if (versionList) {
        // Load version list
        loadVersionList();
        
        // Version selection
        versionList.addEventListener('click', handleVersionSelect);
        
        // Add version button
        addReleaseBtn.addEventListener('click', handleAddVersion);
        
        // Save button
        saveReleaseBtn.addEventListener('click', handleSaveVersion);
        
        // Delete button
        deleteReleaseBtn.addEventListener('click', handleDeleteVersion);
        
        // Preview button
        previewReleaseBtn.addEventListener('click', handlePreviewVersion);
        
        // Entry addition buttons
        document.querySelectorAll('.add-entry-btn').forEach(btn => {
            btn.addEventListener('click', addEntryField);
        });
        
        // Load the first version by default
        if (releaseNotesData.length > 0) {
            loadVersionData(releaseNotesData[0].version);
        }
    }
}

// Load the version list into the sidebar
function loadVersionList() {
    versionList.innerHTML = '';
    
    releaseNotesData.forEach(release => {
        const li = document.createElement('li');
        li.className = 'version-item';
        li.dataset.version = release.version;
        li.textContent = `v${release.version} `;
        
        // Add status tag if not stable
        if (release.status !== 'stable') {
            const span = document.createElement('span');
            span.className = `version-tag ${release.status}`;
            span.textContent = release.status === 'current' ? 'Current' : 
                              release.status === 'beta' ? 'Beta' : 
                              release.status === 'alpha' ? 'Alpha' : '';
            li.appendChild(span);
        }
        
        versionList.appendChild(li);
    });
    
    // Select first version by default
    if (versionList.firstChild) {
        versionList.firstChild.classList.add('active');
    }
}

// Load version data into the editor
function loadVersionData(version) {
    const release = releaseNotesData.find(r => r.version === version);
    if (!release) return;
    
    currentVersion = version;
    
    // Update form fields
    versionNumber.value = release.version;
    releaseDate.value = release.date;
    releaseStatus.value = release.status;
    
    // Clear existing entries
    clearEntryLists();
    
    // Populate features
    populateEntryList(featuresList, release.features, 'features');
    
    // Populate improvements
    populateEntryList(improvementsList, release.improvements, 'improvements');
    
    // Populate bugfixes
    populateEntryList(bugfixesList, release.bugfixes, 'bugfixes');
    
    // Update active version in list
    document.querySelectorAll('.version-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.version === version) {
            item.classList.add('active');
        }
    });
}

// Clear all entry lists
function clearEntryLists() {
    featuresList.innerHTML = '';
    improvementsList.innerHTML = '';
    bugfixesList.innerHTML = '';
    
    // Add back the "Add" buttons
    featuresList.appendChild(createAddButton('features'));
    improvementsList.appendChild(createAddButton('improvements'));
    bugfixesList.appendChild(createAddButton('bugfixes'));
}

// Create an "Add" button for a section
function createAddButton(section) {
    const btn = document.createElement('button');
    btn.className = 'add-entry-btn';
    btn.dataset.section = section;
    btn.textContent = section === 'features' ? 'Add Feature' : 
                     section === 'improvements' ? 'Add Improvement' : 'Add Bug Fix';
    btn.addEventListener('click', addEntryField);
    return btn;
}

// Populate an entry list with items
function populateEntryList(listElement, items, section) {
    // Remove all but the add button
    while (listElement.firstChild) {
        listElement.removeChild(listElement.firstChild);
    }
    
    // Add each item
    items.forEach(item => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'release-entry';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'release-entry-text';
        input.value = item;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-entry-btn';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.addEventListener('click', removeEntryField);
        
        entryDiv.appendChild(input);
        entryDiv.appendChild(removeBtn);
        listElement.appendChild(entryDiv);
    });
    
    // Add the add button
    listElement.appendChild(createAddButton(section));
}

// Handle version selection
function handleVersionSelect(e) {
    const target = e.target.closest('.version-item');
    if (!target) return;
    
    const version = target.dataset.version;
    loadVersionData(version);
}

// Add a new entry field
function addEntryField(e) {
    const section = e.currentTarget.dataset.section;
    const listElement = document.getElementById(`${section}-list`);
    const addButton = e.currentTarget;
    
    // Create new entry
    const entryDiv = document.createElement('div');
    entryDiv.className = 'release-entry';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'release-entry-text';
    input.placeholder = `Add ${section === 'features' ? 'feature' : 
                         section === 'improvements' ? 'improvement' : 'bug fix'} description...`;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-entry-btn';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.addEventListener('click', removeEntryField);
    
    entryDiv.appendChild(input);
    entryDiv.appendChild(removeBtn);
    
    // Insert before the add button
    listElement.insertBefore(entryDiv, addButton);
    
    // Focus the new input
    input.focus();
}

// Remove an entry field
function removeEntryField(e) {
    const entryDiv = e.currentTarget.closest('.release-entry');
    if (entryDiv) {
        entryDiv.parentNode.removeChild(entryDiv);
    }
}

// Handle adding a new version
function handleAddVersion() {
    // Create a new version object
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    const newVersion = {
        version: "",
        date: formattedDate,
        status: "stable",
        features: [],
        improvements: [],
        bugfixes: []
    };
    
    // Add to data
    releaseNotesData.unshift(newVersion);
    
    // Reload version list
    loadVersionList();
    
    // Clear form for new version
    versionNumber.value = "";
    releaseDate.value = formattedDate;
    releaseStatus.value = "stable";
    
    clearEntryLists();
    
    // Set current version to null (new version)
    currentVersion = null;
    
    // Focus version number field
    versionNumber.focus();
}

// Handle saving a version
function handleSaveVersion() {
    // Validate inputs
    if (!versionNumber.value) {
        showToast("Please enter a version number", "error");
        return;
    }
    
    if (!releaseDate.value) {
        showToast("Please enter a release date", "error");
        return;
    }
    
    // Collect data from form
    const formData = {
        version: versionNumber.value,
        date: releaseDate.value,
        status: releaseStatus.value,
        features: gatherEntryValues(featuresList),
        improvements: gatherEntryValues(improvementsList),
        bugfixes: gatherEntryValues(bugfixesList)
    };
    
    // Update or add the version
    if (currentVersion) {
        // Find the index of the current version
        const index = releaseNotesData.findIndex(r => r.version === currentVersion);
        if (index !== -1) {
            // Remove old version
            releaseNotesData.splice(index, 1);
        }
    }
    
    // Add the new/updated version
    releaseNotesData.push(formData);
    
    // Sort by version (assuming semver-like format)
    releaseNotesData.sort((a, b) => {
        const versionA = a.version.split('.').map(n => parseInt(n, 10));
        const versionB = b.version.split('.').map(n => parseInt(n, 10));
        
        // Compare each part of the version
        for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
            const partA = versionA[i] || 0;
            const partB = versionB[i] || 0;
            if (partA !== partB) {
                return partB - partA; // Descending order
            }
        }
        return 0;
    });
    
    // Reload the version list
    loadVersionList();
    
    // Set the current version
    currentVersion = formData.version;
    
    // Update local storage
    saveToLocalStorage();
    
    // Show success message
    showToast("Release notes saved successfully", "success");
    
    // Generate the HTML file
    generateReleaseNotesHtml();
}

// Gather values from an entry list
function gatherEntryValues(listElement) {
    const entries = [];
    
    listElement.querySelectorAll('.release-entry-text').forEach(input => {
        if (input.value.trim()) {
            entries.push(input.value.trim());
        }
    });
    
    return entries;
}

// Handle deleting a version
function handleDeleteVersion() {
    if (!currentVersion) return;
    
    if (confirm(`Are you sure you want to delete version ${currentVersion}?`)) {
        // Find the index of the current version
        const index = releaseNotesData.findIndex(r => r.version === currentVersion);
        if (index !== -1) {
            // Remove the version
            releaseNotesData.splice(index, 1);
            
            // Reload the version list
            loadVersionList();
            
            // Clear the form
            clearEntryLists();
            versionNumber.value = "";
            releaseDate.value = "";
            
            // Set current version to null
            currentVersion = null;
            
            // Update local storage
            saveToLocalStorage();
            
            // Show success message
            showToast("Version deleted successfully", "success");
            
            // Generate the HTML file
            generateReleaseNotesHtml();
            
            // Load first version if available
            if (releaseNotesData.length > 0) {
                loadVersionData(releaseNotesData[0].version);
            }
        }
    }
}

// Handle previewing a version
function handlePreviewVersion() {
    // Collect data from form
    const formData = {
        version: versionNumber.value || "Preview Version",
        date: releaseDate.value || new Date().toISOString().split('T')[0],
        status: releaseStatus.value,
        features: gatherEntryValues(featuresList),
        improvements: gatherEntryValues(improvementsList),
        bugfixes: gatherEntryValues(bugfixesList)
    };
    
    // Generate preview HTML
    const previewHtml = generateVersionHtml(formData);
    
    // Open in a new window
    const previewWindow = window.open("", "Release Notes Preview", "width=800,height=600");
    previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Release Notes Preview</title>
            <link rel="stylesheet" href="../styles.css">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .preview-header {
                    background-color: #f5f5f5;
                    padding: 10px;
                    margin-bottom: 20px;
                    text-align: center;
                    border-radius: 4px;
                }
                h1 {
                    margin-top: 0;
                }
            </style>
        </head>
        <body>
            <div class="preview-header">
                <h1>Release Notes Preview</h1>
                <p>This is a preview of how the release notes will appear</p>
            </div>
            ${previewHtml}
        </body>
        </html>
    `);
}

// Generate HTML for a version
function generateVersionHtml(release) {
    let html = `
        <div class="release-version" id="v${release.version}">
            <div class="version-header">
                <span class="version-number">v${release.version}</span>
                <span class="release-date">${formatDate(release.date)}</span>
                ${release.status !== 'stable' ? `<span class="release-tag ${release.status}">${release.status === 'current' ? 'Current' : release.status === 'beta' ? 'Beta' : 'Alpha'}</span>` : ''}
            </div>
    `;
    
    // Features
    if (release.features.length > 0) {
        html += `
            <div class="release-category">
                <h3>New Features</h3>
                <ul class="release-list">
                    ${release.features.map(feature => `<li class="feature-item">${feature}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    // Improvements
    if (release.improvements.length > 0) {
        html += `
            <div class="release-category">
                <h3>Improvements</h3>
                <ul class="release-list">
                    ${release.improvements.map(improvement => `<li class="improvement-item">${improvement}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    // Bug Fixes
    if (release.bugfixes.length > 0) {
        html += `
            <div class="release-category">
                <h3>${release.status === 'beta' || release.status === 'alpha' ? 'Known Issues' : 'Bug Fixes'}</h3>
                <ul class="release-list">
                    ${release.bugfixes.map(bugfix => `<li class="bugfix-item">${bugfix}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    html += `</div>`;
    
    return html;
}

// Format a date string
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

// Generate the complete release notes HTML file
function generateReleaseNotesHtml() {
    // Implementation would normally handle file writing via backend
    console.log("Generating release notes HTML file...");
    
    // In a real application, this would send data to the server
    // For now, we'll save to local storage for demonstration
    saveToLocalStorage();
    
    showToast("Release notes file updated", "success");
}

// Save data to localStorage (for demo purposes)
function saveToLocalStorage() {
    localStorage.setItem('releaseNotesData', JSON.stringify(releaseNotesData));
}

// Load data from localStorage (for demo purposes)
function loadFromLocalStorage() {
    const data = localStorage.getItem('releaseNotesData');
    if (data) {
        try {
            const parsedData = JSON.parse(data);
            releaseNotesData.length = 0; // Clear array
            releaseNotesData.push(...parsedData); // Add loaded items
        } catch (e) {
            console.error("Error parsing release notes data from localStorage", e);
        }
    }
}

// Show a toast notification
function showToast(message, type = 'info') {
    // Check if there's a toast container
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Remove after delay
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Export module
export default {
    init
}; 