const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

class CodeExecutor {
    constructor() {
        this.tempDirBase = path.join(os.tmpdir(), 'code-execution');
        fs.ensureDirSync(this.tempDirBase);
        this.executionTimeout = 10000;
        this.maxOutputSize = 1024 * 1024;
    }

    async executeCode(code, language) {
        const startTime = Date.now();
        try {
            const executionId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            const tempDir = path.join(this.tempDirBase, executionId);
            fs.ensureDirSync(tempDir);

            let result;
            switch (language.toLowerCase()) {
                case 'javascript':
                case 'js':
                    result = await this.executeJavaScript(code, tempDir);
                    break;
                case 'python':
                case 'py':
                    result = await this.executePython(code, tempDir);
                    break;
                default:
                    throw new Error(`Language ${language} is not supported for execution`);
            }

            try {
                fs.removeSync(tempDir);
            } catch (error) {
                console.warn('Failed to cleanup temp directory:', error);
            }
            return result;
        } catch (error) {
            return {
                success: false,
                output: '',
                error: error.message,
                executionTime: Date.now() - startTime
            };
        }
    }

    async executeJavaScript(code, tempDir) {
        const filename = path.join(tempDir, 'script.js');
        await fs.writeFile(filename, code);
        return this.runCommand('node', [filename], tempDir);
    }

    async executePython(code, tempDir) {
        const filename = path.join(tempDir, 'script.py');
        await fs.writeFile(filename, code);
        return this.runCommand('python3', [filename], tempDir);
    }

    runCommand(command, args, tempDir) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            let output = '';
            let error = '';

            const process = spawn(command, args, {
                cwd: tempDir,
                stdio: ['pipe', 'pipe', 'pipe']
            });

            const timeout = setTimeout(() => {
                process.kill('SIGKILL');
                resolve({
                    success: false,
                    output: output,
                    error: 'Execution timed out (10 seconds limit)',
                    executionTime: Date.now() - startTime
                });
            }, this.executionTimeout);

            process.stdout.on('data', (data) => {
                output += data.toString();
            });

            process.stderr.on('data', (data) => {
                error += data.toString();
            });

            process.on('close', (code) => {
                clearTimeout(timeout);
                resolve({
                    success: code === 0,
                    output: output.trim(),
                    error: error.trim(),
                    executionTime: Date.now() - startTime
                });
            });

            process.on('error', (err) => {
                clearTimeout(timeout);
                resolve({
                    success: false,
                    output: '',
                    error: `Failed to execute: ${err.message}`,
                    executionTime: Date.now() - startTime
                });
            });
        });
    }
}

module.exports = CodeExecutor;
