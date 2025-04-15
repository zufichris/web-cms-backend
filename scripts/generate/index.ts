import { logger } from "@app/utils"
import { assert } from "node:console"
import * as fs from "fs"
import path from "node:path"
import { getTemplates } from "./templates"
import { existsSync } from "node:fs"
import { exec } from "node:child_process"

function createModuleFiles(templates: Readonly<{ path: string, template: string }[]>) {
    const path = require('path');
    const fs = require('fs');
    const { execSync } = require('child_process');

    const gitAddPath = (pathToAdd: string, isFile = false) => {
        try {
            execSync(`git add "${pathToAdd}"`, { stdio: 'pipe' });
            if (isFile) {
                const relativePath = path.relative("src", pathToAdd);
                execSync(`git commit -m "Add ${relativePath}" --no-verify`, { stdio: 'pipe' });
                console.log(`Created and committed: ${relativePath}`);
            }
            return true;
        } catch (error) {
            console.log(`Note: Git operation for ${pathToAdd} was skipped.`);
            return false;
        }
    };

    templates.forEach(file => {
        const filePath = file.path;
        const dir = path.dirname(filePath);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${dir}`);
            // Just add directory to git without committing
            gitAddPath(dir);
        }
        
        if (fs.existsSync(filePath)) {
            console.log(`File ${path.relative("src", filePath)} already exists, skipping.`);
        } else {
            fs.writeFileSync(filePath, file.template);
            gitAddPath(filePath, true);
        }
    });
    
    try {
      execSync('git status --porcelain', { stdio: 'pipe' }).toString().trim().length > 0 && 
      execSync('git commit -m "Add generated module files" --no-verify', { stdio: 'pipe' });
    } catch (error) {
      console.log("Note: Final git commit was skipped.");
    }
}


async function generateModule(moduleName: string) {
    assert(moduleName.length >= 3, "Module name too short")
    if (moduleName.length < 3)
        process.exit(1)
    const templates = getTemplates(moduleName)
    createModuleFiles(templates)
}

async function main() {
    try {
        if (process.argv.length < 3) {
            throw new Error("Module Name Required")
        } else {
            await generateModule(process.argv[2]).catch(err => {
                throw err
            })
        }
    } catch (error) {
        logger.error('Error Generating Module', {
            error: error instanceof Error ? error.message : error
        })
        process.exit(1)
    }
}

main()
process.exit(0)