import { formatStringToCamelCase } from '@/utils/format';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

// Define name format utilities
function getNameFormats(name: string) {
    const baseNameForCasing = name.split("-").join(" ");
    const camelCaseName = formatStringToCamelCase(baseNameForCasing);
    return {
        camelCaseName,
        pascalCaseName: camelCaseName.charAt(0).toUpperCase() + camelCaseName.slice(1),
        kebabCaseName: name.toLowerCase(),
        upperCaseName: name.toUpperCase()
    };
}

// Generate templates based on module name
function generateTemplate(name: string, type: string) {
    const nameFormats = getNameFormats(name);
    const { pascalCaseName, camelCaseName } = nameFormats;

    const templates: Record<string, string> = {
        "useCase": `import { BaseUseCase, ResponseData, TContext, TInput } from '@/shared';
import { Create${pascalCaseName}Dto } from '../../../data/dtos';
import { ${pascalCaseName} } from '../../../data/entities';
import { I${pascalCaseName}Repository } from '../../repository';

export class Create${pascalCaseName}UseCase implements BaseUseCase<Create${pascalCaseName}Dto, ${pascalCaseName}> {
    constructor(private readonly ${camelCaseName}Repository: I${pascalCaseName}Repository) { }

    beforeExecute(input?: Create${pascalCaseName}Dto, context?: TContext): Promise<void> {
        // Perform any pre-execution logic here
        return Promise.resolve();
    }
    
    execute(input: Create${pascalCaseName}Dto): Promise<ResponseData<${pascalCaseName}>> {
        // Perform the main logic of creating a ${camelCaseName}
        return this.${camelCaseName}Repository.create(input);
    }
    
    afterExecute(input?: TInput, context?: TContext): Promise<void> {
        // Perform any post-execution logic here
        return Promise.resolve();
    }
}`,

        "repository": `import { ${pascalCaseName} } from "../../data/entities";
import { IBaseRepository } from "@/shared";

export interface I${pascalCaseName}Repository extends IBaseRepository<${pascalCaseName}> {
    // Other methods specific to ${camelCaseName} repository can be added here
}`,

        "controller": `import { Create${pascalCaseName}UseCase, Get${pascalCaseName}UseCase, Update${pascalCaseName}UseCase, Delete${pascalCaseName}UseCase, Query${pascalCaseName}UseCase } from "../../domain/use-cases";
import { Request, Response } from "express";

export class ${pascalCaseName}Controller {
    constructor(
        private readonly create${pascalCaseName}UseCase: Create${pascalCaseName}UseCase,
        private readonly get${pascalCaseName}UseCase: Get${pascalCaseName}UseCase,
        private readonly update${pascalCaseName}UseCase: Update${pascalCaseName}UseCase,
        private readonly delete${pascalCaseName}UseCase: Delete${pascalCaseName}UseCase,
        private readonly query${pascalCaseName}UseCase: Query${pascalCaseName}UseCase
    ) { }
    
    async create(req: Request, res: Response) {
        try {
            const result = await this.create${pascalCaseName}UseCase.execute(req.body);
            return res.status(201).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    
    async getById(req: Request, res: Response) {
        try {
            const result = await this.get${pascalCaseName}UseCase.execute(req.params.id);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    
    async update(req: Request, res: Response) {
        try {
            const result = await this.update${pascalCaseName}UseCase.execute({ id: req.params.id, ...req.body });
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    
    async delete(req: Request, res: Response) {
        try {
            const result = await this.delete${pascalCaseName}UseCase.execute(req.params.id);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    
    async getAll(req: Request, res: Response) {
        try {
            const result = await this.query${pascalCaseName}UseCase.execute(req.query);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}`,

        "route": `import express from 'express';
import { ${camelCaseName}Controller } from '../controllers';

const router = express.Router();

router.route("/")
    .get(${camelCaseName}Controller.getAll.bind(${camelCaseName}Controller))
    .post(${camelCaseName}Controller.create.bind(${camelCaseName}Controller));
    
router.route("/:id")
    .get(${camelCaseName}Controller.getById.bind(${camelCaseName}Controller))
    .put(${camelCaseName}Controller.update.bind(${camelCaseName}Controller))
    .delete(${camelCaseName}Controller.delete.bind(${camelCaseName}Controller));
    
export const ${camelCaseName}Router = router;`,

        "entity": `import { z } from "zod";

export const ${pascalCaseName}Schema = z.object({
    id: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    // Add other fields specific to ${camelCaseName}
});

export type ${pascalCaseName} = z.infer<typeof ${pascalCaseName}Schema>;`,

        "dto": `import { z } from "zod";

export const Create${pascalCaseName}Schema = z.object({
    // Define properties required for creating a ${camelCaseName}
});

export const Update${pascalCaseName}Schema = z.object({
    id: z.string(),
    // Define properties that can be updated for a ${camelCaseName}
});

export const Query${pascalCaseName}Schema = z.object({
    // Define properties for querying ${camelCaseName}s
    page: z.number().optional(),
    limit: z.number().optional(),
});

export type Create${pascalCaseName}Dto = z.infer<typeof Create${pascalCaseName}Schema>;
export type Update${pascalCaseName}Dto = z.infer<typeof Update${pascalCaseName}Schema>;
export type Query${pascalCaseName}Dto = z.infer<typeof Query${pascalCaseName}Schema>;`,

        "repositoryImpl": `import mongoose from "mongoose";
import { I${pascalCaseName}Repository } from "../../../domain/repository";
import { ${pascalCaseName}Document, ${pascalCaseName}Model } from "../models";
import { ${pascalCaseName} } from "../../entities";
import { Create${pascalCaseName}Dto, Update${pascalCaseName}Dto, Query${pascalCaseName}Dto } from "../../dtos";
import { ResponseData } from "@/shared";

export class ${pascalCaseName}RepositoryImpl implements I${pascalCaseName}Repository {
    constructor() {}
    
    async create(data: Create${pascalCaseName}Dto): Promise<ResponseData<${pascalCaseName}>> {
        const created = await ${pascalCaseName}Model.create(data);
        return { data: created.toObject(), success: true };
    }
    
    async findById(id: string): Promise<ResponseData<${pascalCaseName}>> {
        const item = await ${pascalCaseName}Model.findById(id);
        if (!item) {
            return { success: false, error: "${pascalCaseName} not found" };
        }
        return { data: item.toObject(), success: true };
    }
    
    async update(id: string, data: Update${pascalCaseName}Dto): Promise<ResponseData<${pascalCaseName}>> {
        const updated = await ${pascalCaseName}Model.findByIdAndUpdate(id, data, { new: true });
        if (!updated) {
            return { success: false, error: "${pascalCaseName} not found" };
        }
        return { data: updated.toObject(), success: true };
    }
    
    async delete(id: string): Promise<ResponseData<boolean>> {
        const result = await ${pascalCaseName}Model.findByIdAndDelete(id);
        if (!result) {
            return { success: false, error: "${pascalCaseName} not found" };
        }
        return { data: true, success: true };
    }
    
    async findAll(query: Query${pascalCaseName}Dto): Promise<ResponseData<${pascalCaseName}[]>> {
        const { page = 1, limit = 10, ...filters } = query;
        const skip = (page - 1) * limit;
        
        const items = await ${pascalCaseName}Model.find(filters).skip(skip).limit(limit);
        const total = await ${pascalCaseName}Model.countDocuments(filters);
        
        return { 
            data: items.map(item => item.toObject()), 
            success: true,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }
}`,

        "model": `import mongoose from "mongoose";
import { ${pascalCaseName} } from "../../entities";

export type ${pascalCaseName}Document = mongoose.Document & ${pascalCaseName};

const schema = new mongoose.Schema<${pascalCaseName}Document>({
    // Define schema fields matching the ${pascalCaseName} entity
}, {
    timestamps: true
});

export const ${pascalCaseName}Model: mongoose.Model<${pascalCaseName}Document> = 
    mongoose.models.${pascalCaseName} || 
    mongoose.model<${pascalCaseName}Document>("${pascalCaseName}", schema);`
    };

    return templates[type] || `// Template for ${type} not found`;
}

async function generateUseCaseFiles(modulePath: string, moduleName: string) {
    const useCases = ["create", "update", "delete", "get", "query"];
    const nameFormats = getNameFormats(moduleName);

    for (const useCase of useCases) {
        const capitalizedUseCase = useCase.charAt(0).toUpperCase() + useCase.slice(1);
        const fileName = `${capitalizedUseCase}${nameFormats.pascalCaseName}UseCase.ts`;
        const useCasePath = path.join(modulePath, 'domain', 'use-cases', useCase);

        // Generate specific template for each use case type
        let template = generateTemplate(moduleName, "useCase")
            .replace(/Create/g, capitalizedUseCase);

        if (useCase !== "create") {
            // Modify template for specific use case types
            template = template.replace(/create/g, useCase);
        }

        await writeFile(path.join(useCasePath, fileName), template, 'utf-8');
    }

    // Create index files to export all use cases
    const indexContent = useCases
        .map(useCase => {
            const capitalizedUseCase = useCase.charAt(0).toUpperCase() + useCase.slice(1);
            return `export * from './${useCase}/${capitalizedUseCase}${nameFormats.pascalCaseName}UseCase';`;
        })
        .join('\n');

    await writeFile(path.join(modulePath, 'domain', 'use-cases', 'index.ts'), indexContent, 'utf-8');
}

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
                { name: "controllers" },
                { name: "routes" }  // Moved routes to http folder
            ]
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

    // Create directories
    for (const dir of directories) {
        await mkdir(dir, { recursive: true });
    }

    // Generate entity file
    await writeFile(
        path.join(modulePath, 'data', 'entities', `${moduleName}.entity.ts`),
        generateTemplate(moduleName, "entity"),
        'utf-8'
    );
    await writeFile(
        path.join(modulePath, 'data', 'entities', 'index.ts'),
        `export * from './${moduleName}.entity';`,
        'utf-8'
    );

    // Generate DTO file
    await writeFile(
        path.join(modulePath, 'data', 'dtos', `${moduleName}.dto.ts`),
        generateTemplate(moduleName, "dto"),
        'utf-8'
    );
    await writeFile(
        path.join(modulePath, 'data', 'dtos', 'index.ts'),
        `export * from './${moduleName}.dto';`,
        'utf-8'
    );

    // Generate repository interface
    await writeFile(
        path.join(modulePath, 'domain', 'repository', `${moduleName}.repository.ts`),
        generateTemplate(moduleName, "repository"),
        'utf-8'
    );
    await writeFile(
        path.join(modulePath, 'domain', 'repository', 'index.ts'),
        `export * from './${moduleName}.repository';`,
        'utf-8'
    );

    // Generate model file
    await writeFile(
        path.join(modulePath, 'data', 'orm', 'models', `${moduleName}.model.ts`),
        generateTemplate(moduleName, "model"),
        'utf-8'
    );
    await writeFile(
        path.join(modulePath, 'data', 'orm', 'models', 'index.ts'),
        `export * from './${moduleName}.model';`,
        'utf-8'
    );

    // Generate repository implementation
    await writeFile(
        path.join(modulePath, 'data', 'orm', 'repository-impl', `${moduleName}.repository-impl.ts`),
        generateTemplate(moduleName, "repositoryImpl"),
        'utf-8'
    );
    await writeFile(
        path.join(modulePath, 'data', 'orm', 'repository-impl', 'index.ts'),
        `export * from './${moduleName}.repository-impl';`,
        'utf-8'
    );

    // Generate controller file
    await writeFile(
        path.join(modulePath, 'http', 'controllers', `${moduleName}.controller.ts`),
        generateTemplate(moduleName, "controller"),
        'utf-8'
    );
    await writeFile(
        path.join(modulePath, 'http', 'controllers', 'index.ts'),
        `export * from './${moduleName}.controller';`,
        'utf-8'
    );

    // Generate routes file (now in http/routes folder)
    await writeFile(
        path.join(modulePath, 'http', 'routes', `${moduleName}.routes.ts`),
        generateTemplate(moduleName, "route"),
        'utf-8'
    );
    await writeFile(
        path.join(modulePath, 'http', 'routes', 'index.ts'),
        `export * from './${moduleName}.routes';`,
        'utf-8'
    );

    // Generate use case files for each type (create, update, delete, get, query)
    await generateUseCaseFiles(modulePath, moduleName);

    // Generate module index file that exports everything
    const moduleIndexContent = `// Main module exports for ${moduleName}
export * from './data/entities';
export * from './data/dtos';
export * from './domain/repository';
export * from './domain/use-cases';
export * from './http/controllers';
export * from './http/routes';
`;

    await writeFile(path.join(modulePath, 'index.ts'), moduleIndexContent, 'utf-8');

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