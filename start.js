const { spawn } = require('child_process');
const path = require('path');

// Function to start a process and handle its output
function startProcess(command, args, name) {
    const process = spawn(command, args, {
        stdio: 'pipe',
        shell: true
    });

    process.stdout.on('data', (data) => {
        console.log(`[${name}] ${data.toString().trim()}`);
    });

    process.stderr.on('data', (data) => {
        console.error(`[${name}] ${data.toString().trim()}`);
    });

    process.on('close', (code) => {
        if (code !== 0) {
            console.log(`[${name}] Process exited with code ${code}`);
        }
    });

    return process;
}

// Keep track of running processes
let serverProcess = null;
let electronProcess = null;

// Function to cleanup processes
async function cleanup() {
    console.log('\nShutting down...');
    
    // Kill processes in reverse order
    if (electronProcess) {
        electronProcess.kill();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for electron to cleanup
    }
    
    if (serverProcess) {
        serverProcess.kill();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for server to cleanup
    }
    
    process.exit(0);
}

// Start the backend server
console.log('Starting backend server...');
serverProcess = startProcess('node', ['backend/server.js'], 'Backend');

// Wait for the server to start before launching Electron
setTimeout(() => {
    console.log('Starting Electron app...');
    electronProcess = startProcess(
        process.platform === 'win32' ? 'npx.cmd' : 'npx',
        ['electron', '.'],
        'Electron'
    );

    // Handle process termination
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', cleanup);
}, 2000); // Wait 2 seconds for the server to start 