import { formatStringToCamelCase } from '@app/utils/format';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

/**
 * Generates consistent name formats for a module
 */
function getNameFormats(name: string) {
    const baseNameForCasing = name.replace(/-/g, ' ');
    const camelCaseName = formatStringToCamelCase(baseNameForCasing);
    const pascalCaseName = camelCaseName.charAt(0).toUpperCase() + camelCaseName.slice(1);
    
    return {
        camelCaseName,
        pascalCaseName,
        kebabCaseName: name.toLowerCase().replace(/\s+/g, '-'),
        upperCaseName: name.toUpperCase().replace(/\s+/g, '_')
    };
}

/**
 * Generate template content based on module name and component type
 */
function generateTemplate(name: string, type: string) {
    const nameFormats = getNameFormats(name);
    const { pascalCaseName, camelCaseName } = nameFormats;

    const templates: Record<string, string> = {
        // Base use case template that can be extended for specific use cases
        "baseUseCase": `import { IBaseUseCase, ResponseData, TContext } from '@app/shared';
import { ${pascalCaseName} } from '../../../data/entities/${camelCaseName}.entity';
import { I${pascalCaseName}Repository } from '../../repository/${camelCaseName}.repository';

export abstract class Base${pascalCaseName}UseCase<TInput, TOutput> implements IBaseUseCase<TInput, TOutput> {
    constructor(protected readonly ${camelCaseName}Repository: I${pascalCaseName}Repository) {}

    beforeExecute(input?: TInput, context?: TContext): Promise<void> {
        return Promise.resolve();
    }
    
    abstract execute(input: TInput): Promise<ResponseData<TOutput>>;
    
    afterExecute(input?: TInput, context?: TContext): Promise<void> {
        return Promise.resolve();
    }
}`,

        "createUseCase": `import { ResponseData, TContext } from '@app/shared';
import { Create${pascalCaseName}Dto } from '../../../data/dtos/${camelCaseName}.dto';
import { ${pascalCaseName} } from '../../../data/entities/${camelCaseName}.entity';
import { Base${pascalCaseName}UseCase } from './base-${camelCaseName}.use-case';

export class Create${pascalCaseName}UseCase extends Base${pascalCaseName}UseCase<Create${pascalCaseName}Dto, ${pascalCaseName}> {
    async beforeExecute(input?: Create${pascalCaseName}Dto, context?: TContext): Promise<void> {
        // Validate input or check permissions
        return Promise.resolve();
    }
    
    async execute(input: Create${pascalCaseName}Dto): Promise<ResponseData<${pascalCaseName}>> {
        return this.${camelCaseName}Repository.create(input);
    }
}`,

        "updateUseCase": `import { ResponseData } from '@app/shared';
import { Update${pascalCaseName}Dto } from '../../../data/dtos/${camelCaseName}.dto';
import { ${pascalCaseName} } from '../../../data/entities/${camelCaseName}.entity';
import { Base${pascalCaseName}UseCase } from './base-${camelCaseName}.use-case';

export class Update${pascalCaseName}UseCase extends Base${pascalCaseName}UseCase<Update${pascalCaseName}Dto, ${pascalCaseName}> {
    async execute(input: Update${pascalCaseName}Dto): Promise<ResponseData<${pascalCaseName}>> {
        const { id, ...updateData } = input;
        return this.${camelCaseName}Repository.update(id, updateData);
    }
}`,

        "getUseCase": `import { ResponseData } from '@app/shared';
import { ${pascalCaseName} } from '../../../data/entities/${camelCaseName}.entity';
import { Base${pascalCaseName}UseCase } from './base-${camelCaseName}.use-case';

export class Get${pascalCaseName}UseCase extends Base${pascalCaseName}UseCase<string, ${pascalCaseName}> {
    async execute(id: string): Promise<ResponseData<${pascalCaseName}>> {
        return this.${camelCaseName}Repository.findById(id);
    }
}`,

        "deleteUseCase": `import { ResponseData } from '@app/shared';
import { Base${pascalCaseName}UseCase } from './base-${camelCaseName}.use-case';

export class Delete${pascalCaseName}UseCase extends Base${pascalCaseName}UseCase<string, boolean> {
    async execute(id: string): Promise<ResponseData<boolean>> {
        return this.${camelCaseName}Repository.delete(id);
    }
}`,

        "queryUseCase": `import { ResponseData } from '@app/shared';
import { Query${pascalCaseName}Dto } from '../../../data/dtos/${camelCaseName}.dto';
import { ${pascalCaseName} } from '../../../data/entities/${camelCaseName}.entity';
import { Base${pascalCaseName}UseCase } from './base-${camelCaseName}.use-case';

export class Query${pascalCaseName}UseCase extends Base${pascalCaseName}UseCase<Query${pascalCaseName}Dto, ${pascalCaseName}[]> {
    async execute(query: Query${pascalCaseName}Dto): Promise<ResponseData<${pascalCaseName}[]>> {
        return this.${camelCaseName}Repository.findAll(query);
    }
}`,

        "repository": `import { IBaseRepository } from "@app/shared";
import { ${pascalCaseName} } from "../../data/entities/${camelCaseName}.entity";

export interface I${pascalCaseName}Repository extends IBaseRepository<${pascalCaseName}> {
    // Add any ${camelCaseName}-specific repository methods here
}`,

        "controller": `import { 
    Create${pascalCaseName}UseCase,
    Get${pascalCaseName}UseCase,
    Update${pascalCaseName}UseCase,
    Delete${pascalCaseName}UseCase,
    Query${pascalCaseName}UseCase
} from "../../domain/use-cases";
import { Request, Response, NextFunction } from "express";
import { ApiHandler } from "@app/shared";

export class ${pascalCaseName}Controller {
    constructor(
        private readonly create${pascalCaseName}UseCase: Create${pascalCaseName}UseCase,
        private readonly get${pascalCaseName}UseCase: Get${pascalCaseName}UseCase,
        private readonly update${pascalCaseName}UseCase: Update${pascalCaseName}UseCase,
        private readonly delete${pascalCaseName}UseCase: Delete${pascalCaseName}UseCase,
        private readonly query${pascalCaseName}UseCase: Query${pascalCaseName}UseCase
    ) {}
    
    create = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.create${pascalCaseName}UseCase.execute(req.body);
        return res.status(201).json(result);
    });
    
    getById = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.get${pascalCaseName}UseCase.execute(req.params.id);
        return res.status(200).json(result);
    });
    
    update = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.update${pascalCaseName}UseCase.execute({ 
            id: req.params.id, 
            ...req.body 
        });
        return res.status(200).json(result);
    });
    
    delete = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.delete${pascalCaseName}UseCase.execute(req.params.id);
        return res.status(200).json(result);
    });
    
    getAll = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.query${pascalCaseName}UseCase.execute(req.query);
        return res.status(200).json(result);
    });
}`,

        "route": `import { Router } from 'express';
import { ${pascalCaseName}Controller } from '../controllers/${camelCaseName}.controller';
import { validateRequest } from '@app/middleware';
import { Create${pascalCaseName}Schema, Update${pascalCaseName}Schema } from '../../data/dtos/${camelCaseName}.dto';

export function create${pascalCaseName}Router(controller: ${pascalCaseName}Controller): Router {
    const router = Router();
    
    router.route('/')
        .get(controller.getAll)
        .post(validateRequest(Create${pascalCaseName}Schema), controller.create);
        
    router.route('/:id')
        .get(controller.getById)
        .put(validateRequest(Update${pascalCaseName}Schema), controller.update)
        .delete(controller.delete);
        
    return router;
}`,

        "entity": `import { z } from "zod";
import { BaseEntitySchema } from "@app/shared";

/**
 * Schema definition for ${pascalCaseName} entity
 */
export const ${pascalCaseName}Schema = BaseEntitySchema.extend({
    // TODO: Add ${camelCaseName}-specific fields here
    name: z.string().min(1),
    description: z.string().optional(),
    // Add more fields as needed
});

export type ${pascalCaseName} = z.infer<typeof ${pascalCaseName}Schema>;`,

        "dto": `import { z } from "zod";
import { PaginationQuerySchema } from "@app/shared";

/**
 * Schema for creating a new ${pascalCaseName}
 */
export const Create${pascalCaseName}Schema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    // TODO: Add more fields as needed
});

/**
 * Schema for updating an existing ${pascalCaseName}
 */
export const Update${pascalCaseName}Schema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    // TODO: Add more fields as needed
});

/**
 * Schema for querying ${pascalCaseName} entities
 */
export const Query${pascalCaseName}Schema = PaginationQuerySchema.extend({
    name: z.string().optional(),
    // TODO: Add more query fields as needed
});

export type Create${pascalCaseName}Dto = z.infer<typeof Create${pascalCaseName}Schema>;
export type Update${pascalCaseName}Dto = z.infer<typeof Update${pascalCaseName}Schema>;
export type Query${pascalCaseName}Dto = z.infer<typeof Query${pascalCaseName}Schema>;`,

        "repositoryImpl": `import mongoose from "mongoose";
import { I${pascalCaseName}Repository } from "../../../domain/repository/${camelCaseName}.repository";
import { ${pascalCaseName}Document, ${pascalCaseName}Model } from "../models/${camelCaseName}.model";
import { ${pascalCaseName} } from "../../entities/${camelCaseName}.entity";
import { 
    Create${pascalCaseName}Dto, 
    Update${pascalCaseName}Dto, 
    Query${pascalCaseName}Dto 
} from "../../dtos/${camelCaseName}.dto";
import { ResponseData } from "@app/shared";

export class ${pascalCaseName}RepositoryImpl implements I${pascalCaseName}Repository {
    constructor(
        private readonly model = ${pascalCaseName}Model
    ) {}
    
    async create(data: Create${pascalCaseName}Dto): Promise<ResponseData<${pascalCaseName}>> {
        try {
            const created = await this.model.create(data);
            return { 
                data: created.toObject(), 
                success: true 
            };
        } catch (error) {
            return { 
                success: false, 
                error: \`Failed to create ${camelCaseName}: \${error.message}\` 
            };
        }
    }
    
    async findById(id: string): Promise<ResponseData<${pascalCaseName}>> {
        try {
            const item = await this.model.findById(id);
            if (!item) {
                return { 
                    success: false, 
                    error: \`${pascalCaseName} not found with id: \${id}\` 
                };
            }
            return { 
                data: item.toObject(), 
                success: true 
            };
        } catch (error) {
            return { 
                success: false, 
                error: \`Failed to find ${camelCaseName}: \${error.message}\` 
            };
        }
    }
    
    async update(id: string, data: Partial<Update${pascalCaseName}Dto>): Promise<ResponseData<${pascalCaseName}>> {
        try {
            const updated = await this.model.findByIdAndUpdate(
                id, 
                { $set: data }, 
                { new: true, runValidators: true }
            );
            
            if (!updated) {
                return { 
                    success: false, 
                    error: \`${pascalCaseName} not found with id: \${id}\` 
                };
            }
            
            return { 
                data: updated.toObject(), 
                success: true 
            };
        } catch (error) {
            return { 
                success: false, 
                error: \`Failed to update ${camelCaseName}: \${error.message}\` 
            };
        }
    }
    
    async delete(id: string): Promise<ResponseData<boolean>> {
        try {
            const result = await this.model.findByIdAndDelete(id);
            if (!result) {
                return { 
                    success: false, 
                    error: \`${pascalCaseName} not found with id: \${id}\` 
                };
            }
            return { 
                data: true, 
                success: true 
            };
        } catch (error) {
            return { 
                success: false, 
                error: \`Failed to delete ${camelCaseName}: \${error.message}\` 
            };
        }
    }
    
    async findAll(query: Query${pascalCaseName}Dto): Promise<ResponseData<${pascalCaseName}[]>> {
        try {
            const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', ...filters } = query;
            const skip = (Number(page) - 1) * Number(limit);
            
            // Build the filter object from the provided filters
            const filterObject = this.buildFilterObject(filters);
            
            // Execute the query with pagination
            const items = await this.model.find(filterObject)
                .sort({ [sort]: order === 'desc' ? -1 : 1 })
                .skip(skip)
                .limit(Number(limit))
                .exec();
                
            const total = await this.model.countDocuments(filterObject);
            
            return { 
                data: items.map(item => item.toObject()), 
                success: true,
                meta: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit))
                }
            };
        } catch (error) {
            return { 
                success: false, 
                error: \`Failed to find ${camelCaseName}s: \${error.message}\` 
            };
        }
    }
    
    /**
     * Builds a MongoDB filter object from the provided query parameters
     */
    private buildFilterObject(filters: Record<string, any>): Record<string, any> {
        const filterObject: Record<string, any> = {};
        
        // Process each filter and convert to appropriate MongoDB query operator
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (typeof value === 'string' && !['true', 'false'].includes(value.toLowerCase())) {
                    // Text search with case insensitivity
                    filterObject[key] = { $regex: value, $options: 'i' };
                } else {
                    // Direct equality comparison
                    filterObject[key] = value;
                }
            }
        });
        
        return filterObject;
    }
}`,

        "model": `import mongoose, { Schema } from "mongoose";
import { ${pascalCaseName} } from "../../entities/${camelCaseName}.entity";

/**
 * Mongoose document type for ${pascalCaseName}
 */
export type ${pascalCaseName}Document = mongoose.Document & ${pascalCaseName};

/**
 * Mongoose schema for ${pascalCaseName}
 */
const ${camelCaseName}Schema = new Schema<${pascalCaseName}Document>({
    name: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String 
    },
    // TODO: Add more fields matching the ${pascalCaseName} entity
}, {
    timestamps: true,
    toObject: {
        transform: (_, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

/**
 * Mongoose model for ${pascalCaseName}
 */
export const ${pascalCaseName}Model = mongoose.models.${pascalCaseName} || 
    mongoose.model<${pascalCaseName}Document>("${pascalCaseName}", ${camelCaseName}Schema);`
    };

    return templates[type] || `// Template for ${type} not found`;
}

/**
 * Creates a file with the given content
 */
async function createFile(filePath: string, content: string): Promise<void> {
    const dir = path.dirname(filePath);
    await mkdir(dir, { recursive: true });
    await writeFile(filePath, content, 'utf-8');
}

/**
 * Generates use case files for a module
 */
async function generateUseCaseFiles(modulePath: string, moduleName: string): Promise<void> {
    const nameFormats = getNameFormats(moduleName);
    const { camelCaseName } = nameFormats;
    
    // Create base use case file first
    await createFile(
        path.join(modulePath, 'domain', 'use-cases', `base-${camelCaseName}.use-case.ts`),
        generateTemplate(moduleName, "baseUseCase")
    );
    
    // Generate specific use case types
    const useCaseTypes = [
        { name: "create", template: "createUseCase" },
        { name: "update", template: "updateUseCase" },
        { name: "delete", template: "deleteUseCase" },
        { name: "get", template: "getUseCase" },
        { name: "query", template: "queryUseCase" }
    ];

    // Create each use case file
    for (const useCase of useCaseTypes) {
        await createFile(
            path.join(modulePath, 'domain', 'use-cases', `${useCase.name}-${camelCaseName}.use-case.ts`),
            generateTemplate(moduleName, useCase.template)
        );
    }

    // Create index file that exports all use cases
    const indexContent = `// Export all use cases
export * from './base-${camelCaseName}.use-case';
export * from './create-${camelCaseName}.use-case';
export * from './update-${camelCaseName}.use-case';
export * from './delete-${camelCaseName}.use-case';
export * from './get-${camelCaseName}.use-case';
export * from './query-${camelCaseName}.use-case';
`;

    await createFile(
        path.join(modulePath, 'domain', 'use-cases', 'index.ts'),
        indexContent
    );
}

/**
 * Main function to generate a complete module structure
 */
async function generateModule(moduleName: string): Promise<void> {
    const nameFormats = getNameFormats(moduleName);
    const { camelCaseName } = nameFormats;
    
    const modulePath = path.join(__dirname, '../src', 'modules', nameFormats.kebabCaseName);

    // Define directory structure
    const directories = [
        // Data layer
        path.join(modulePath, 'data', 'entities'),
        path.join(modulePath, 'data', 'dtos'),
        path.join(modulePath, 'data', 'orm', 'models'),
        path.join(modulePath, 'data', 'orm', 'repository-impl'),
        
        // Domain layer
        path.join(modulePath, 'domain', 'repository'),
        path.join(modulePath, 'domain', 'use-cases'),
        
        // HTTP layer
        path.join(modulePath, 'http', 'controllers'),
        path.join(modulePath, 'http', 'routes'),
    ];

    // Create all directories
    for (const dir of directories) {
        await mkdir(dir, { recursive: true });
    }

    // Generate core files
    const files = [
        {
            path: path.join(modulePath, 'data', 'entities', `${camelCaseName}.entity.ts`),
            template: "entity"
        },
        {
            path: path.join(modulePath, 'data', 'dtos', `${camelCaseName}.dto.ts`),
            template: "dto"
        },
        {
            path: path.join(modulePath, 'domain', 'repository', `${camelCaseName}.repository.ts`),
            template: "repository"
        },
        {
            path: path.join(modulePath, 'data', 'orm', 'models', `${camelCaseName}.model.ts`),
            template: "model"
        },
        {
            path: path.join(modulePath, 'data', 'orm', 'repository-impl', `${camelCaseName}.repository-impl.ts`),
            template: "repositoryImpl"
        },
        {
            path: path.join(modulePath, 'http', 'controllers', `${camelCaseName}.controller.ts`),
            template: "controller"
        },
        {
            path: path.join(modulePath, 'http', 'routes', `${camelCaseName}.routes.ts`),
            template: "route"
        }
    ];

    // Create all files
    for (const file of files) {
        await createFile(file.path, generateTemplate(moduleName, file.template));
    }

    // Create index files for each directory
    await createIndexFiles(modulePath, camelCaseName);

    // Generate use case files
    await generateUseCaseFiles(modulePath, moduleName);

    // Generate the main module index file
    await createFile(
        path.join(modulePath, 'index.ts'),
        `/**
 * ${nameFormats.pascalCaseName} Module
 */
export * from './data/entities/${camelCaseName}.entity';
export * from './data/dtos/${camelCaseName}.dto';
export * from './domain/repository/${camelCaseName}.repository';
export * from './domain/use-cases';
export * from './http/controllers/${camelCaseName}.controller';
export * from './http/routes/${camelCaseName}.routes';

// Module initialization
import { ${nameFormats.pascalCaseName}Model } from './data/orm/models/${camelCaseName}.model';
import { ${nameFormats.pascalCaseName}RepositoryImpl } from './data/orm/repository-impl/${camelCaseName}.repository-impl';
import { 
    Create${nameFormats.pascalCaseName}UseCase,
    Get${nameFormats.pascalCaseName}UseCase,
    Update${nameFormats.pascalCaseName}UseCase,
    Delete${nameFormats.pascalCaseName}UseCase,
    Query${nameFormats.pascalCaseName}UseCase
} from './domain/use-cases';
import { ${nameFormats.pascalCaseName}Controller } from './http/controllers/${camelCaseName}.controller';
import { create${nameFormats.pascalCaseName}Router } from './http/routes/${camelCaseName}.routes';
import { Router } from 'express';

/**
 * Initialize the ${nameFormats.pascalCaseName} module and return its router
 */
export function init${nameFormats.pascalCaseName}Module(): Router {
    // Create repository implementation
    const repository = new ${nameFormats.pascalCaseName}RepositoryImpl(${nameFormats.pascalCaseName}Model);
    
    // Create use cases
    const createUseCase = new Create${nameFormats.pascalCaseName}UseCase(repository);
    const getUseCase = new Get${nameFormats.pascalCaseName}UseCase(repository);
    const updateUseCase = new Update${nameFormats.pascalCaseName}UseCase(repository);
    const deleteUseCase = new Delete${nameFormats.pascalCaseName}UseCase(repository);
    const queryUseCase = new Query${nameFormats.pascalCaseName}UseCase(repository);
    
    // Create controller
    const controller = new ${nameFormats.pascalCaseName}Controller(
        createUseCase,
        getUseCase,
        updateUseCase,
        deleteUseCase,
        queryUseCase
    );
    
    // Create and return router
    return create${nameFormats.pascalCaseName}Router(controller);
}
`
    );

    console.log(`✅ Module "${moduleName}" generated successfully in ${modulePath}`);
}

/**
 * Create index files for each directory to properly export components
 */
async function createIndexFiles(modulePath: string, camelCaseName: string): Promise<void> {
    const indexFiles = [
        {
            path: path.join(modulePath, 'data', 'entities', 'index.ts'),
            content: `export * from './${camelCaseName}.entity';`
        },
        {
            path: path.join(modulePath, 'data', 'dtos', 'index.ts'),
            content: `export * from './${camelCaseName}.dto';`
        },
        {
            path: path.join(modulePath, 'domain', 'repository', 'index.ts'),
            content: `export * from './${camelCaseName}.repository';`
        },
        {
            path: path.join(modulePath, 'data', 'orm', 'models', 'index.ts'),
            content: `export * from './${camelCaseName}.model';`
        },
        {
            path: path.join(modulePath, 'data', 'orm', 'repository-impl', 'index.ts'),
            content: `export * from './${camelCaseName}.repository-impl';`
        },
        {
            path: path.join(modulePath, 'http', 'controllers', 'index.ts'),
            content: `export * from './${camelCaseName}.controller';`
        },
        {
            path: path.join(modulePath, 'http', 'routes', 'index.ts'),
            content: `export * from './${camelCaseName}.routes';`
        }
    ];

    for (const file of indexFiles) {
        await createFile(file.path, file.content);
    }
}

/**
 * CLI entry point
 */
async function main() {
    try {
        if (process.argv.length < 3) {
            console.error('❌ Please provide a module name.');
            console.log('Usage: ts-node generate-module.ts <module-name>');
            process.exit(1);
        }

        const moduleName = process.argv[2];
        await generateModule(moduleName);
    } catch (error) {
        console.error('❌ Error generating module:', error);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main().catch(console.error);
}