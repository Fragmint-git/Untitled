// Function to load and display database tables
async function loadDatabaseViewer() {
    const dbViewerContainer = document.getElementById('database-viewer-container');
    dbViewerContainer.innerHTML = '<h2>Database Explorer</h2>';
    
    try {
        // Get list of tables (you'll need to add this method to your preload.js and backend)
        const tables = await window.api.getDatabaseTables();
        
        // Create table selector
        const tableSelector = document.createElement('select');
        tableSelector.id = 'table-selector';
        tableSelector.innerHTML = '<option value="">Select a table</option>';
        
        tables.forEach(table => {
            const option = document.createElement('option');
            option.value = table;
            option.textContent = table;
            tableSelector.appendChild(option);
        });
        
        const selectorContainer = document.createElement('div');
        selectorContainer.className = 'selector-container';
        selectorContainer.appendChild(tableSelector);
        
        const refreshButton = document.createElement('button');
        refreshButton.className = 'btn';
        refreshButton.textContent = 'Refresh Data';
        refreshButton.addEventListener('click', () => {
            const selectedTable = tableSelector.value;
            if (selectedTable) {
                loadTableData(selectedTable);
            }
        });
        
        selectorContainer.appendChild(refreshButton);
        dbViewerContainer.appendChild(selectorContainer);
        
        // Create data container
        const dataContainer = document.createElement('div');
        dataContainer.id = 'table-data-container';
        dataContainer.className = 'table-data-container';
        dbViewerContainer.appendChild(dataContainer);
        
        // Add event listener to table selector
        tableSelector.addEventListener('change', (e) => {
            const selectedTable = e.target.value;
            if (selectedTable) {
                loadTableData(selectedTable);
            } else {
                dataContainer.innerHTML = '<p>Select a table to view data</p>';
            }
        });
        
    } catch (error) {
        console.error('Error loading database tables:', error);
        dbViewerContainer.innerHTML += '<p class="error">Failed to load database tables</p>';
    }
}

// Function to load and display table data
async function loadTableData(tableName) {
    const dataContainer = document.getElementById('table-data-container');
    dataContainer.innerHTML = `<p>Loading data from ${tableName}...</p>`;
    
    try {
        // Get table data (you'll need to add this method to your preload.js and backend)
        const data = await window.api.getTableData(tableName);
        
        if (data.length === 0) {
            dataContainer.innerHTML = `<p>No data found in table ${tableName}</p>`;
            return;
        }
        
        // Create table element
        const table = document.createElement('table');
        table.className = 'data-table';
        
        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        // Get column names from first row
        const columns = Object.keys(data[0]);
        columns.forEach(column => {
            const th = document.createElement('th');
            th.textContent = column;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        data.forEach(row => {
            const tr = document.createElement('tr');
            
            columns.forEach(column => {
                const td = document.createElement('td');
                let value = row[column];
                
                // Format value based on type
                if (value === null) {
                    value = 'NULL';
                    td.className = 'null-value';
                } else if (typeof value === 'object') {
                    value = JSON.stringify(value);
                }
                
                td.textContent = value;
                tr.appendChild(td);
            });
            
            tbody.appendChild(tr);
        });
        
        table.appendChild(tbody);
        
        // Clear container and add table
        dataContainer.innerHTML = '';
        dataContainer.appendChild(table);
        
        // Add record count
        const countInfo = document.createElement('p');
        countInfo.className = 'record-count';
        countInfo.textContent = `${data.length} record(s) found`;
        dataContainer.appendChild(countInfo);
        
    } catch (error) {
        console.error(`Error loading data from ${tableName}:`, error);
        dataContainer.innerHTML = `<p class="error">Failed to load data from ${tableName}</p>`;
    }
} 