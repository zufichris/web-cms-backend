import { formatStringToCamelCase } from "@app/utils/format"; // Ensure this path is correct
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

// Promisified FS Functions
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

// Utility Functions

/**
 * Generates consistent name formats for a module.
 * Expects input name like 'user-profile' or 'User Profile'.
 * @param name - The raw module name input
 * @returns Object with formatted name variations
 */
function getNameFormats(name: string): {
  camelCaseName: string;
  pascalCaseName: string;
  kebabCaseName: string;
  snakeUpperCaseName: string;
} {
  const normalizedName = name.replace(/[-_]/g, " ");
  const camelCaseName = formatStringToCamelCase(normalizedName);
  const pascalCaseName =
    camelCaseName.charAt(0).toUpperCase() + camelCaseName.slice(1);
  const kebabCaseName = normalizedName.toLowerCase().replace(/\s+/g, "-");
  const snakeUpperCaseName = normalizedName.toUpperCase().replace(/\s+/g, "_");

  return { camelCaseName, pascalCaseName, kebabCaseName, snakeUpperCaseName };
}

/**
 * Creates a file with the given content, ensuring the directory exists.
 * Warns if the file already exists before overwriting.
 * @param filePath - Full path where the file will be created
 * @param content - Content to write to the file
 */
async function createFile(filePath: string, content: string): Promise<void> {
  const dir = path.dirname(filePath);
  await mkdir(dir, { recursive: true });
  if (fs.existsSync(filePath)) {
    console.warn(
      `   Warning: File already exists and will be overwritten: ${path.relative(process.cwd(), filePath)}`,
    );
  }
  await writeFile(filePath, content, "utf-8");
  console.info(`   Created: ${path.relative(process.cwd(), filePath)}`);
}

/**
 * Generates template content based on module name formats and component type.
 * @param nameFormats - Formatted module names
 * @param type - Type of template to generate
 * @returns Generated template string
 */
function generateTemplate(
  nameFormats: ReturnType<typeof getNameFormats>,
  type: string,
): string {
  const { pascalCaseName, camelCaseName, kebabCaseName } = nameFormats;
  const filterableFieldsTypeName = `${pascalCaseName}FilterableFields`;
  const defaultFilterableFieldsValue = `['id', 'createdAt', 'updatedAt']`; // Adjusted to match placeholder comment

  const templates: Record<string, string> = {
    "domain/entity": `import { BaseEntitySchema } from '@app/shared';
import { z } from 'zod';

export const ${pascalCaseName}EntitySchema = BaseEntitySchema.extend({
    name: z.string().min(1, '${pascalCaseName} name cannot be empty'),
    description: z.string().optional(),
});

export type ${pascalCaseName} = z.infer<typeof ${pascalCaseName}EntitySchema>;`,

    "domain/repository": `import { IBaseRepository } from '@app/shared';
import { ${pascalCaseName} } from '@app/modules/${kebabCaseName}/domain/entities';

export type ${filterableFieldsTypeName} = ${defaultFilterableFieldsValue};

export interface I${pascalCaseName}Repository extends IBaseRepository<${pascalCaseName}, ${filterableFieldsTypeName}> {
}`,

    "domain/use-case/base": `
import { I${pascalCaseName}Repository } from '@app/modules/${kebabCaseName}/domain/repositories';
import { logger } from '@app/utils/logger';

export abstract class Base${pascalCaseName}UseCase<TInput, TOutput> implements IBaseUseCase<TInput, TOutput, AuthContext> {
    constructor(protected readonly ${camelCaseName}Repository: I${pascalCaseName}Repository) {}

    async beforeExecute(input: TInput, context?: AuthContext): Promise<void> {
        logger.debug(\`[\${this.constructor.name}] Before execute\`, { input, context });
    }

    abstract execute(input: TInput, context?: AuthContext): Promise<UsecaseResult<TOutput>>;

    async afterExecute(result: UsecaseResult<TOutput>, input: TInput, context?: AuthContext): Promise<void> {
        const logPayload = { resultSummary: { success: result.success, status: result.status }, context };
        if (result.success) {
            logger.debug(\`[\${this.constructor.name}] After execute (Success)\`, logPayload);
        } else {
            logger.warn(\`[\${this.constructor.name}] After execute (Failure)\`, { ...logPayload, error: result.error });
        }
    }

    async run(input: TInput, context?: AuthContext): Promise<UsecaseResult<TOutput>> {
        let result: UsecaseResult<TOutput>;
        try {
            await this.beforeExecute(input, context);
            result = await this.execute(input, context);
            await this.afterExecute(result, input, context);
            return result;
        } catch (error: unknown) {
            logger.error(\`[\${this.constructor.name}] Unhandled error\`, { error, input, context });
            if (error instanceof AppError) {
                result = error.error
            } else {
                const internalError = AppError.internal();
                result = internalError.error
            }
            await this.afterExecute(result, input, context);
            return result;
        }
    }
}`,

    "domain/use-case/create": `
import { Create${pascalCaseName}Dto } from '@app/modules/${kebabCaseName}/application/dtos';
import { ${pascalCaseName} } from '@app/modules/${kebabCaseName}/domain/entities';
import { Base${pascalCaseName}UseCase } from '@app/modules/${kebabCaseName}/domain/use-cases/base';
import { logger } from '@app/utils/logger';

export class Create${pascalCaseName}UseCase extends Base${pascalCaseName}UseCase<Create${pascalCaseName}Dto, ${pascalCaseName}> {
    async execute(input: Create${pascalCaseName}Dto, context?: AuthContext): Promise<UsecaseResult<${pascalCaseName}>> {
        try {
            const entity = await this.${camelCaseName}Repository.create(input);
            logger.info(\`[\${this.constructor.name}] Created ${pascalCaseName}\`, { id: entity.id, context });
            return { success: true, message: '${pascalCaseName} created successfully.', status: 201, data: entity };
        } catch (error) {
            logger.error(\`[\${this.constructor.name}] Failed to create ${pascalCaseName}\`, { error, input, context });
            throw error;
        }
    }
}`,

    "domain/use-case/update": `
import { Update${pascalCaseName}Dto } from '@app/modules/${kebabCaseName}/application/dtos';
import { ${pascalCaseName} } from '@app/modules/${kebabCaseName}/domain/entities';
import { Base${pascalCaseName}UseCase } from '@app/modules/${kebabCaseName}/domain/use-cases/base';
import { logger } from '@app/utils/logger';

export class Update${pascalCaseName}UseCase extends Base${pascalCaseName}UseCase<Update${pascalCaseName}Dto, ${pascalCaseName}> {
    async execute(input: Update${pascalCaseName}Dto, context?: AuthContext): Promise<UsecaseResult<${pascalCaseName}>> {
        try {
            const { id, ...updateData } = input;
            const entity = await this.${camelCaseName}Repository.update(id, updateData);
            if (!entity) {
                logger.warn(\`[\${this.constructor.name}] ${pascalCaseName} not found\`, { id, context });
                throw AppError.notFound(\`${pascalCaseName} with id '\${id}' not found\`);
            }
            logger.info(\`[\${this.constructor.name}] Updated ${pascalCaseName}\`, { id, context });
            return { success: true, message: '${pascalCaseName} updated successfully.', status: 200, data: entity };
        } catch (error) {
            logger.error(\`[\${this.constructor.name}] Failed to update ${pascalCaseName}\`, { error, input, context });
            throw error;
        }
    }
}`,

    "domain/use-case/get": `
import { ${pascalCaseName} } from '@app/modules/${kebabCaseName}/domain/entities';
import { Base${pascalCaseName}UseCase } from '@app/modules/${kebabCaseName}/domain/use-cases/base';
import { logger } from '@app/utils/logger';

export class Get${pascalCaseName}UseCase extends Base${pascalCaseName}UseCase<string, ${pascalCaseName}> {
    async execute(id: string, context?: AuthContext): Promise<UsecaseResult<${pascalCaseName}>> {
        try {
            const entity = await this.${camelCaseName}Repository.findById(id);
            if (!entity) {
                logger.warn(\`[\${this.constructor.name}] ${pascalCaseName} not found\`, { id, context });
                throw AppError.notFound(\`${pascalCaseName} with id '\${id}' not found\`);
            }
            logger.info(\`[\${this.constructor.name}] Retrieved ${pascalCaseName}\`, { id, context });
            return { success: true, message: '${pascalCaseName} retrieved successfully.', status: 200, data: entity };
        } catch (error) {
            logger.error(\`[\${this.constructor.name}] Failed to get ${pascalCaseName}\`, { error, id, context });
            throw error;
        }
    }
}`,

    "domain/use-case/delete": `
import { Base${pascalCaseName}UseCase } from '@app/modules/${kebabCaseName}/domain/use-cases/base';
import { logger } from '@app/utils/logger';

export class Delete${pascalCaseName}UseCase extends Base${pascalCaseName}UseCase<string, boolean> {
    async execute(id: string, context?: AuthContext): Promise<UsecaseResult<boolean>> {
        try {
            const success = await this.${camelCaseName}Repository.delete(id);
            if (!success) {
                logger.warn(\`[\${this.constructor.name}] ${pascalCaseName} not found or deletion failed\`, { id, context });
                throw AppError.notFound(\`${pascalCaseName} with id '\${id}' not found or could not be deleted\`);
            }
            logger.info(\`[\${this.constructor.name}] Deleted ${pascalCaseName}\`, { id, context });
            return { success: true, message: '${pascalCaseName} deleted successfully.', status: 200, data: true };
        } catch (error) {
            logger.error(\`[\${this.constructor.name}] Failed to delete ${pascalCaseName}\`, { error, id, context });
            throw error;
        }
    }
}`,

    "domain/use-case/query": `
import { Query${pascalCaseName}Dto } from '@app/modules/${kebabCaseName}/application/dtos';
import { ${pascalCaseName} } from '@app/modules/${kebabCaseName}/domain/entities';
import { Base${pascalCaseName}UseCase } from '@app/modules/${kebabCaseName}/domain/use-cases/base';
import { logger } from '@app/utils/logger';

type ${pascalCaseName}QueryResult = { items: ${pascalCaseName}[]; total: number; filterCount: number };

export class Query${pascalCaseName}UseCase extends Base${pascalCaseName}UseCase<Query${pascalCaseName}Dto, ${pascalCaseName}QueryResult> {
    async execute(query: Query${pascalCaseName}Dto, context?: AuthContext): Promise<UsecaseResult<${pascalCaseName}QueryResult>> {
        try {
            const result = await this.${camelCaseName}Repository.query(query);
            logger.info(\`[\${this.constructor.name}] Queried ${pascalCaseName}s\`, { count: result.items.length, query, context });
            return {
                success: true,
                message: '${pascalCaseName}s queried successfully.',
                status: 200,
                items: result,
                meta: { total: result.totalCount, filterCount: result.filterCount, page: query.page, limit: query.limit }
            };
        } catch (error) {
            logger.error(\`[\${this.constructor.name}] Failed to query ${pascalCaseName}s\`, { error, query, context });
            throw error;
        }
    }
}`,

    "application/dto": `import { z } from 'zod';
import { Create${pascalCaseName}ValidationSchema, Update${pascalCaseName}ValidationSchemaBody, Query${pascalCaseName}ValidationSchema } from '@app/modules/${kebabCaseName}/infrastructure/http/validation';

export type Create${pascalCaseName}Dto = z.infer<typeof Create${pascalCaseName}ValidationSchema>;
export type Update${pascalCaseName}Dto = z.infer<typeof Update${pascalCaseName}ValidationSchemaBody> & { id: string };
export type Query${pascalCaseName}Dto = z.infer<typeof Query${pascalCaseName}ValidationSchema>;
`,

    "infra/persistence/model": `import mongoose, { Schema, Document, Model } from 'mongoose';
import { ${pascalCaseName} } from '@app/modules/${kebabCaseName}/domain/entities';

type ${pascalCaseName}Document = Document & Omit<${pascalCaseName}>;

const ${camelCaseName}Schema = new Schema<${pascalCaseName}Document>({
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true },
}, {
    timestamps: true,
    versionKey: false,
    toObject: { transform: (_, ret) => { ret.id = ret._id.toString(); delete ret._id; return ret; } },
    toJSON: { transform: (_, ret) => { ret.id = ret._id.toString(); delete ret._id; return ret; } }
});

export const ${pascalCaseName}Model: Model<${pascalCaseName}Document> = mongoose.models.${pascalCaseName} || mongoose.model<${pascalCaseName}Document>('${pascalCaseName}', ${camelCaseName}Schema);`,

    "infra/persistence/repository": `
import { Model,Document} from 'mongoose';
import { ${pascalCaseName}Model} from '@app/modules/${kebabCaseName}/infrastructure/persistence/mongoose/models';
import { I${pascalCaseName}Repository, ${filterableFieldsTypeName} } from '@app/modules/${kebabCaseName}/domain/repositories';
import { ${pascalCaseName} } from '@app/modules/${kebabCaseName}/domain/entities';
import { logger } from '@app/utils/logger';
import { MongoBaseRepository } from '@app/shared';


export class Mongoose${pascalCaseName}Repository extends MongoBaseRepository<${pascalCaseName}, ${filterableFieldsTypeName}> implements I${pascalCaseName}Repository {
    constructor(model: Model<${pascalCaseName} & Document>) {
        super(model);
        logger.debug(\`Mongoose${pascalCaseName}Repository initialized\`);
    }
}`,

    "infra/http/controller": `
import { Request, Response } from 'express';
import { ApiHandler, AuthContext, BaseController} from '@app/shared';
import { Create${pascalCaseName}UseCase, Get${pascalCaseName}UseCase, Update${pascalCaseName}UseCase, Delete${pascalCaseName}UseCase, Query${pascalCaseName}UseCase } from '@app/modules/${kebabCaseName}/domain/use-cases';
import { Update${pascalCaseName}Dto } from '@app/modules/${kebabCaseName}/application/dtos';
import { logger } from '@app/utils/logger';

export class ${pascalCaseName}Controller extends BaseController {
    constructor(
        private readonly create${pascalCaseName}UseCase: Create${pascalCaseName}UseCase,
        private readonly get${pascalCaseName}UseCase: Get${pascalCaseName}UseCase,
        private readonly update${pascalCaseName}UseCase: Update${pascalCaseName}UseCase,
        private readonly delete${pascalCaseName}UseCase: Delete${pascalCaseName}UseCase,
        private readonly query${pascalCaseName}UseCase: Query${pascalCaseName}UseCase
    ) {
        super();
    }

    private getContext(req: Request): AuthContext {
        return req.user as AuthContext; // Adjust based on auth middleware
    }

    create = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.create${pascalCaseName}UseCase.run(req.body, this.getContext(req));
        if (result.success) logger.info(\`Controller: Created ${pascalCaseName}\`, { id: result.data.id });
        res.json_structured(result);
    });

    getById = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.get${pascalCaseName}UseCase.run(req.params.id, this.getContext(req));
        if (result.success) logger.info(\`Controller: Retrieved ${pascalCaseName}\`, { id: req.params.id });
        res.status(result.success ? 200 : 404).json(result);
    });

    update = ApiHandler(async (req: Request, res: Response) => {
        const updateDto: Update${pascalCaseName}Dto = { id: req.params.id, ...req.body };
        const result = await this.update${pascalCaseName}UseCase.run(updateDto, this.getContext(req));
        if (result.success) logger.info(\`Controller: Updated ${pascalCaseName}\`, { id: req.params.id });
        res.json_structured(result);
    });

    delete = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.delete${pascalCaseName}UseCase.run(req.params.id, this.getContext(req));
        if (result.success) logger.info(\`Controller: Deleted ${pascalCaseName}\`, { id: req.params.id });
        res.json_structured(result);
    });

    getAll = ApiHandler(async (req: Request, res: Response) => {
        const query = this.getQuery(['id'], { filterableFields: ['id'], strict: true, maxLimit: 20 })(req.validated?.query);
        const result = await this.query${pascalCaseName}UseCase.run(query, this.getContext(req));
        if (result.success) logger.info(\`Controller: Queried ${pascalCaseName}s\`);
        res.json_structured(result);
    });
}`,

    "infra/http/route": `import { Router } from 'express';
import { ${pascalCaseName}Controller } from '@app/modules/${kebabCaseName}/infrastructure/http/controllers';

export function create${pascalCaseName}Router(controller: ${pascalCaseName}Controller): Router {
    const router = Router();
    router.route('/')
        .get(controller.getAll)
        .post(controller.create);
    router.route('/:id')
        .get(controller.getById)
        .patch(controller.update)
        .delete(controller.delete);
    return router;
}`,

    "infra/http/validation": `import { z } from 'zod';
import { PaginationQuerySchema } from '@app/shared';

const ${pascalCaseName}CoreSchema = z.object({
    name: z.string().min(1, 'Name cannot be empty').trim(),
    description: z.string().optional().nullable().trim(),
});

export const ParamIdValidationSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
});

export const Create${pascalCaseName}ValidationSchema = ${pascalCaseName}CoreSchema.strict();
export const Update${pascalCaseName}ValidationSchemaBody = ${pascalCaseName}CoreSchema.partial().strict();
export const Query${pascalCaseName}ValidationSchema = PaginationQuerySchema.extend({
    name: z.string().optional(),
}).strict();`,

    "module/index": `export * from './domain/entities';
export * from './domain/repositories';
export * from './domain/use-cases';
export * from './application/dtos';
export * from './infrastructure/http/routes';
export * from './infrastructure/http/validation';
export * from './infrastructure/persistence/mongoose/models';
export * from './infrastructure/persistence/mongoose/repositories';

import { Router } from 'express';
import { ${pascalCaseName}Model } from './infrastructure/persistence/mongoose/models';
import { Mongoose${pascalCaseName}Repository } from './infrastructure/persistence/mongoose/repositories';
import { ${pascalCaseName}Controller } from './infrastructure/http/controllers';
import { create${pascalCaseName}Router } from './infrastructure/http/routes';
import { Create${pascalCaseName}UseCase, Get${pascalCaseName}UseCase, Update${pascalCaseName}UseCase, Delete${pascalCaseName}UseCase, Query${pascalCaseName}UseCase } from './domain/use-cases';
import { logger } from '@app/utils/logger';

export function init${pascalCaseName}Module(): Router {
    logger.info(\`Initializing ${pascalCaseName} Module...\`);
    const ${camelCaseName}Repository = new Mongoose${pascalCaseName}Repository(${pascalCaseName}Model);
    const createUseCase = new Create${pascalCaseName}UseCase(${camelCaseName}Repository);
    const getUseCase = new Get${pascalCaseName}UseCase(${camelCaseName}Repository);
    const updateUseCase = new Update${pascalCaseName}UseCase(${camelCaseName}Repository);
    const deleteUseCase = new Delete${pascalCaseName}UseCase(${camelCaseName}Repository);
    const queryUseCase = new Query${pascalCaseName}UseCase(${camelCaseName}Repository);
    const controller = new ${pascalCaseName}Controller(createUseCase, getUseCase, updateUseCase, deleteUseCase, queryUseCase);
    const router = create${pascalCaseName}Router(controller);
    logger.info(\`${pascalCaseName} Module initialized successfully\`);
    return router;
}`,
  };

  const template = templates[type];
  if (!template) {
    throw new Error(`Template for type "${type}" not found.`);
  }
  if (!template) {
    console.warn(
      `   Warning: Template for type "${type}" not found for module ${pascalCaseName}`,
    );
    return `// Placeholder for ${type} - Module: ${pascalCaseName}\n// Template not found\n`;
  }
  return template;
}

// Generation Logic

interface FileGenerationConfig {
  pathTemplate: string;
  templateKey?: string;
  indexContent?: string;
}

async function generateModule(moduleInputName: string): Promise<void> {
  console.log(`\n🚀 Generating module: "${moduleInputName}"`);
  const nameFormats = getNameFormats(moduleInputName);
  const { kebabCaseName, pascalCaseName } = nameFormats;
  const baseModulePath = path.resolve(
    __dirname,
    "..",
    "src",
    "modules",
    kebabCaseName,
  );
  console.log(`   Target directory: ${baseModulePath}`);

  const structureConfig: FileGenerationConfig[] = [
    {
      pathTemplate: `domain/entities/${kebabCaseName}.entity.ts`,
      templateKey: "domain/entity",
    },
    {
      pathTemplate: `domain/entities/index.ts`,
      indexContent: `export * from './${kebabCaseName}.entity';`,
    },
    {
      pathTemplate: `domain/repositories/${kebabCaseName}.repository.ts`,
      templateKey: "domain/repository",
    },
    {
      pathTemplate: `domain/repositories/index.ts`,
      indexContent: `export * from './${kebabCaseName}.repository';`,
    },
    {
      pathTemplate: `domain/use-cases/base.ts`,
      templateKey: "domain/use-case/base",
    },
    {
      pathTemplate: `domain/use-cases/create-${kebabCaseName}.use-case.ts`,
      templateKey: "domain/use-case/create",
    },
    {
      pathTemplate: `domain/use-cases/update-${kebabCaseName}.use-case.ts`,
      templateKey: "domain/use-case/update",
    },
    {
      pathTemplate: `domain/use-cases/delete-${kebabCaseName}.use-case.ts`,
      templateKey: "domain/use-case/delete",
    },
    {
      pathTemplate: `domain/use-cases/get-${kebabCaseName}.use-case.ts`,
      templateKey: "domain/use-case/get",
    },
    {
      pathTemplate: `domain/use-cases/query-${kebabCaseName}.use-case.ts`,
      templateKey: "domain/use-case/query",
    },
    {
      pathTemplate: `domain/use-cases/index.ts`,
      indexContent: `export * from './base';\nexport * from './create-${kebabCaseName}.use-case';\nexport * from './update-${kebabCaseName}.use-case';\nexport * from './delete-${kebabCaseName}.use-case';\nexport * from './get-${kebabCaseName}.use-case';\nexport * from './query-${kebabCaseName}.use-case';`,
    },
    {
      pathTemplate: `application/dtos/${kebabCaseName}.dto.ts`,
      templateKey: "application/dto",
    },
    {
      pathTemplate: `application/dtos/index.ts`,
      indexContent: `export * from './${kebabCaseName}.dto';`,
    },
    {
      pathTemplate: `infrastructure/persistence/mongoose/models/${kebabCaseName}.model.ts`,
      templateKey: "infra/persistence/model",
    },
    {
      pathTemplate: `infrastructure/persistence/mongoose/models/index.ts`,
      indexContent: `export * from './${kebabCaseName}.model';`,
    },
    {
      pathTemplate: `infrastructure/persistence/mongoose/repositories/${kebabCaseName}.repository.ts`,
      templateKey: "infra/persistence/repository",
    },
    {
      pathTemplate: `infrastructure/persistence/mongoose/repositories/index.ts`,
      indexContent: `export * from './${kebabCaseName}.repository';`,
    },
    {
      pathTemplate: `infrastructure/http/controllers/${kebabCaseName}.controller.ts`,
      templateKey: "infra/http/controller",
    },
    {
      pathTemplate: `infrastructure/http/controllers/index.ts`,
      indexContent: `export * from './${kebabCaseName}.controller';`,
    },
    {
      pathTemplate: `infrastructure/http/routes/${kebabCaseName}.routes.ts`,
      templateKey: "infra/http/route",
    },
    {
      pathTemplate: `infrastructure/http/routes/index.ts`,
      indexContent: `export * from './${kebabCaseName}.routes';`,
    },
    {
      pathTemplate: `infrastructure/http/validation/${kebabCaseName}.schemas.ts`,
      templateKey: "infra/http/validation",
    },
    {
      pathTemplate: `infrastructure/http/validation/index.ts`,
      indexContent: `export * from './${kebabCaseName}.schemas';`,
    },
    { pathTemplate: `index.ts`, templateKey: "module/index" },
  ];

  try {
    await Promise.all(
      structureConfig.map((config) => {
        const filePath = path.join(baseModulePath, config.pathTemplate);
        const content =
          config.indexContent ??
          generateTemplate(nameFormats, config.templateKey!);
        return createFile(filePath, content);
      }),
    );
    console.log(
      `\n✅ Module "${pascalCaseName}" (${kebabCaseName}) generated successfully at ${baseModulePath}`,
    );
    console.log(`\n   ❗ Remember to:`);
    console.log(
      `      1. Add specific fields to Entity, Model, and Validation Schemas.`,
    );
    console.log(
      `      2. Define correct filterable fields in Repository Interface.`,
    );
    console.log(`      3. Implement custom repository methods if needed.`);
    console.log(`      4. Apply validation and auth middleware as required.`);
  } catch (error) {
    console.error("\n❌ Error during module generation:", error);
    process.exit(1);
  }
}

// CLI Entry Point

async function main(): Promise<void> {
  if (process.argv.length < 3) {
    console.error("\n❌ Error: Please provide a module name.");
    console.error("Usage: ts-node script.ts <module-name>");
    process.exit(1);
  }

  const moduleName = process.argv[2].trim();
  if (!moduleName || moduleName.startsWith("-")) {
    console.error(`❌ Error: Invalid module name: "${moduleName}"`);
    process.exit(1);
  }

  await generateModule(moduleName);
}

if (require.main === module) {
  main().catch((error) => {
    console.error("\n❌ Unexpected error:", error);
    process.exit(1);
  });
}
