import { logger } from "@app/utils"
import { assert } from "node:console"
import * as fs from "fs"
import path from "node:path"
import { getTemplates } from "./templates"

function createModuleFiles(templates: Readonly<{ path: string, template: string }[]>) {
    templates.forEach(file => {
        const filePath = file.path
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log("Created directory:", dir);
        }

        if (fs.existsSync(filePath)) {
            console.log(`File ${path.relative("src", filePath)} already exists, skipping.`);
        } else {
            fs.writeFileSync(filePath, file.template);
            console.log("Created file:", path.relative("src", filePath));
        }
    });
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