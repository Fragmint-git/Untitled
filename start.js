require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');

// Keep track of running processes
let serverProcess = null;
let electronProcess = null;

// Function to start a process and handle its output/exit
function startProcess(command, args, name, onExitCallback) {
    const proc = spawn(command, args, {
        stdio: 'pipe',
        shell: true
    });

    proc.stdout.on('data', (data) => {
        console.log(`[${name}] ${data.toString().trim()}`);
    });

    proc.stderr.on('data', (data) => {
        console.error(`[${name}] ${data.toString().trim()}`);
    });

    proc.on('close', (code) => {
        console.log(`[${name}] Process exited with code ${code}`);
        if (onExitCallback) {
            onExitCallback(name, code);
        }
    });

    proc.on('error', (err) => {
        console.error(`[${name}] Failed to start process:`, err);
        if (onExitCallback) {
            onExitCallback(name, 1, err); // Indicate error with code 1
        }
    });

    return proc;
}

let processesExited = { Backend: false, Electron: false };
let shuttingDown = false;
let electronExitCode = null; // Store Electron's exit code

// Function called when a child process exits
function handleChildProcessExit(name, code, err) {
    if (err) {
        console.error(`[${name}] exited due to error: ${err.message}`);
    }
    processesExited[name] = true;
    if (name === 'Electron') {
        electronExitCode = code;
        console.log(`[start.js] Electron process exited with code ${code}.`);
        // If Electron exits (even cleanly), initiate the parent shutdown sequence.
        // This ensures the backend process is properly waited for or terminated.
        if (!shuttingDown) {
             console.log('[start.js] Electron exit detected. Initiating parent shutdown...');
             shutdownParentProcess(); 
        }
    }

    // Check if all processes have exited *after* shutdown sequence started
    if (shuttingDown && processesExited.Backend && processesExited.Electron) {
        console.log('[start.js] Both child processes have exited. Exiting parent.');
        process.exit(electronExitCode === 0 ? 0 : 1); // Exit with Electron's code if possible
    }
}

// Function to initiate shutdown of the parent process and children
function shutdownParentProcess() {
    if (shuttingDown) return; // Prevent multiple shutdowns
    shuttingDown = true;
    console.log('\n[start.js] Initiating shutdown sequence...');

    // Flag to track if we need to wait for the backend
    let backendNeedsToExit = false;

    // Try to shut down Electron gracefully if it's still running
    if (electronProcess && !processesExited.Electron) {
        console.log('[start.js] Sending SIGTERM to Electron process...');
        electronProcess.kill('SIGTERM');
        backendNeedsToExit = true; // Assume Electron will tell backend to stop
    } else {
        // If Electron already exited or wasn't running, check the backend
        if (serverProcess && !processesExited.Backend) {
            console.log('[start.js] Electron already exited or failed. Forcefully killing backend process...');
            serverProcess.kill('SIGKILL'); // Use SIGKILL for immediate termination
        } else {
            // Both processes already exited, proceed to exit parent
             if (processesExited.Backend && processesExited.Electron) {
                 console.log('[start.js] Both processes already exited. Exiting parent immediately.');
                 process.exit(electronExitCode === 0 ? 0 : 1);
             }
        }
    }

    // If we didn't forcefully kill the backend, set a timer to wait for it
    // or to kill it if the main timeout occurs.
    if (backendNeedsToExit || (serverProcess && !processesExited.Backend)) {
        // Set a timeout to force exit if cleanup takes too long
        setTimeout(() => {
            console.error('[start.js] Shutdown timeout reached. Forcing exit.');
            // Force kill any remaining child process before exiting
            if (serverProcess && !processesExited.Backend) {
                console.log('[start.js] Timeout: Force killing backend process...');
                serverProcess.kill('SIGKILL');
            }
            if (electronProcess && !processesExited.Electron) {
                 console.log('[start.js] Timeout: Force killing Electron process...');
                 electronProcess.kill('SIGKILL');
            }
            // Give a very short delay for kills to register before exiting parent
            setTimeout(() => process.exit(1), 100); 
        }, 15000); // 15s timeout
    } else if (!backendNeedsToExit && processesExited.Electron && processesExited.Backend) {
        // If backend didn't need to exit (e.g., it exited before Electron signal)
        // and both are confirmed exited, exit parent now.
        console.log('[start.js] Backend did not need explicit shutdown signal and both processes exited. Exiting parent.');
        process.exit(electronExitCode === 0 ? 0 : 1);
    }
}

// Start the backend server
console.log('Starting backend server...');
serverProcess = startProcess('node', ['backend/server.js'], 'Backend', handleChildProcessExit);

// Wait a bit for the server to potentially start before launching Electron
setTimeout(() => {
    if (!serverProcess || serverProcess.killed) {
        console.error('[start.js] Backend server failed to start. Aborting Electron launch.');
        process.exit(1);
        return;
    }
    console.log('Starting Electron app...');
    electronProcess = startProcess(
        process.platform === 'win32' ? 'npx.cmd' : 'npx',
        ['electron', '.'],
        'Electron',
        handleChildProcessExit
    );

    // Handle termination signals for the parent start.js process
    process.on('SIGINT', shutdownParentProcess);  // Ctrl+C
    process.on('SIGTERM', shutdownParentProcess);

}, 2000); // Wait 2 seconds 