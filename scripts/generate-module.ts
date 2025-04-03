import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

async function generateModule(moduleName: string) {
    const modulePath = path.join(__dirname, '..', 'modules', moduleName.split(" ").join("-"));

    const paths = [
        {
            name: "data",
            subPaths: [
                { name: "entities" },
                { name: "dtos" },
                {
                    name: "orm",
                    subPaths: [
                        { name: "repository-impl" },
                        { name: "models" }
                    ]
                }
            ]
        },
        {
            name: "domain",
            subPaths: [
                { name: "repository" },
                {
                    name: "use-cases",
                    subPaths: [
                        { name: "create" },
                        { name: "update" },
                        { name: "delete" },
                        { name: "get" },
                        { name: "query" }
                    ]
                }
            ]
        },
        {
            name: "http",
            subPaths: [
                { name: "controllers" }
            ]
        },
        {
            name: "routes"
        }
    ];

    //eslint-disable-next-line
    function buildDirectoryList(parentDir: string, paths: any[]): string[] {
        let dirs: string[] = [];
        for (const p of paths) {
            const currentDir = path.join(parentDir, p.name);
            dirs.push(currentDir);
            if (p.subPaths) {
                dirs = dirs.concat(buildDirectoryList(currentDir, p.subPaths));
            }
        }
        return dirs;
    }

    const directories = buildDirectoryList(modulePath, paths);

    for (const dir of directories) {
        await mkdir(dir, { recursive: true });
        await writeFile(path.join(dir, 'index.ts'), '// index.ts', 'utf-8');
    }

    await writeFile(path.join(modulePath, 'routes', 'index.ts'), `// ${moduleName}.routes.ts`, 'utf-8');
    await writeFile(path.join(modulePath, 'http', 'controllers', 'index.ts'), `// ${moduleName}.controller.ts`, 'utf-8');

    console.log(`Module "${moduleName}" generated successfully in ${modulePath}`);
}

async function main() {
    if (process.argv.length < 3) {
        console.error('Please provide a module name.');
        process.exit(1);
    }

    const moduleName = process.argv[2];
    await generateModule(moduleName);
}

main().catch(console.error);