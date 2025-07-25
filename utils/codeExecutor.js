const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const tmp = require('tmp');

class CodeExecutor {
    constructor() {
        this.tempDir = tmp.dirSync({ prefix: 'code-execution-', unsafeCleanup: true });
        this.executionTimeout = 10000; // 10 seconds timeout
        this.maxOutputSize = 1024 * 1024; // 1MB max output
    }

    async executeCode(code, language) {
        const startTime = Date.now();

        try {
            switch (language.toLowerCase()) {
                case 'javascript':
                case 'js':
                    return await this.executeJavaScript(code);
                case 'python':
                case 'py':
                    return await this.executePython(code);
                case 'java':
                    return await this.executeJava(code);
                case 'cpp':
                case 'c++':
                    return await this.executeCpp(code);
                case 'c':
                    return await this.executeC(code);
                default:
                    throw new Error(`Language ${language} is not supported for execution`);
            }
        } catch (error) {
            return {
                success: false,
                output: '',
                error: error.message,
                executionTime: Date.now() - startTime
            };
        }
    }

    async executeJavaScript(code) {
        const filename = path.join(this.tempDir.name, 'script.js');
        await fs.writeFile(filename, code);

        return this.runCommand('node', [filename]);
    }

    async executePython(code) {
        const filename = path.join(this.tempDir.name, 'script.py');
        await fs.writeFile(filename, code);

        return this.runCommand('python3', [filename]);
    }

    async executeJava(code) {
        // Extract class name from code
        const classNameMatch = code.match(/public\s+class\s+(\w+)/);
        const className = classNameMatch ? classNameMatch[1] : 'Main';

        const filename = path.join(this.tempDir.name, `${className}.java`);
        await fs.writeFile(filename, code);

        // Compile first
        const compileResult = await this.runCommand('javac', [filename]);
        if (!compileResult.success) {
            return compileResult;
        }

        // Then execute
        return this.runCommand('java', ['-cp', this.tempDir.name, className]);
    }

    async executeCpp(code) {
        const sourceFile = path.join(this.tempDir.name, 'program.cpp');
        const execFile = path.join(this.tempDir.name, 'program');

        await fs.writeFile(sourceFile, code);

        // Compile first
        const compileResult = await this.runCommand('g++', [
            sourceFile,
            '-o',
            execFile,
            '-std=c++17'
        ]);

        if (!compileResult.success) {
            return compileResult;
        }

        // Then execute
        return this.runCommand(execFile, []);
    }

    async executeC(code) {
        const sourceFile = path.join(this.tempDir.name, 'program.c');
        const execFile = path.join(this.tempDir.name, 'program');

        await fs.writeFile(sourceFile, code);

        // Compile first
        const compileResult = await this.runCommand('gcc', [
            sourceFile,
            '-o',
            execFile,
            '-std=c11'
        ]);

        if (!compileResult.success) {
            return compileResult;
        }

        // Then execute
        return this.runCommand(execFile, []);
    }

    runCommand(command, args = []) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            let output = '';
            let error = '';
            let outputSize = 0;

            const process = spawn(command, args, {
                cwd: this.tempDir.name,
                stdio: ['pipe', 'pipe', 'pipe']
            });

            // Set timeout
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
                const chunk = data.toString();
                outputSize += chunk.length;

                if (outputSize > this.maxOutputSize) {
                    process.kill('SIGKILL');
                    clearTimeout(timeout);
                    resolve({
                        success: false,
                        output: output,
                        error: 'Output size limit exceeded (1MB)',
                        executionTime: Date.now() - startTime
                    });
                    return;
                }

                output += chunk;
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

    cleanup() {
        try {
            this.tempDir.removeCallback();
        } catch (error) {
            console.warn('Failed to cleanup temp directory:', error);
        }
    }
}

module.exports = CodeExecutor;
