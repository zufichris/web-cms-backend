import path from "node:path";

type Template = { path: string, template: string };
type Cases = { 
    camelCase: string, 
    upperCase: string, 
    pascalCase: string, 
    lowerCase: string, 
    kebabCase: string 
};

/**
 * Converts a module name to various case formats
 * @param moduleName The module name in any format
 * @returns Object containing the module name in various case formats
 */
function getModuleNames(moduleName: string): Cases {
    const formatted = moduleName.trim().split("-").join(" ");

    const lowerCase = formatted.split(" ").join("").toLowerCase();
    const upperCase = formatted.split(" ").join("").toUpperCase();
    const kebabCase = formatted.split(" ").join("-").toLowerCase();

    function toCamel(): string {
        const words = formatted.split(" ");
        words[0] = words[0].toLowerCase();
        for (let index = 1; index < words.length; index++) {
            words[index] = words[index].charAt(0).toUpperCase() +
                words[index].slice(1).toLowerCase();
        }
        return words.join("");
    }

    function toPascal(): string {
        const words = formatted.split(" ");
        for (let index = 0; index < words.length; index++) {
            words[index] = words[index].charAt(0).toUpperCase() +
                words[index].slice(1).toLowerCase();
        }
        return words.join("");
    }

    return {
        camelCase: toCamel(),
        kebabCase,
        upperCase,
        pascalCase: toPascal(),
        lowerCase
    };
}

/**
 * Generates all templates for a module
 * @param moduleName The name of the module
 * @returns Array of template objects with path and content
 */
export function getTemplates(moduleName: string): Readonly<Template[]> {
    const cases = getModuleNames(moduleName);
    const { camelCase, pascalCase } = cases;
    
    const templates = [
        ...domain(cases).map(t => ({ ...t, path: `domain/${t.path}` })),
        ...infrastructure(cases).map(t => ({ ...t, path: `infrastructure/${t.path}` })),
        ...application(cases).map(t => ({ ...t, path: `application/${t.path}` })),
        {
            path: "index.ts",
            template: `
export * from './domain';
export * from './application';
export * from './infrastructure';
import { Router } from 'express';
import { ${pascalCase}Model } from './infrastructure/persistence/mongoose/models';
import { Mongo${pascalCase}Repository } from './infrastructure/persistence/mongoose/repositories';
import { ${pascalCase}Controller } from './infrastructure/http/controllers';
import { create${pascalCase}Router } from './infrastructure/http/routes';
import { Create${pascalCase}UseCase, Get${pascalCase}UseCase, Update${pascalCase}UseCase, Delete${pascalCase}UseCase, Query${pascalCase}UseCase } from './domain/use-cases';
import { logger } from '@app/utils/logger';

export function init${pascalCase}Module(): Router {
    logger.info('Initializing ${pascalCase} Module...');
    const ${camelCase}Repository = new Mongo${pascalCase}Repository(${pascalCase}Model);
    const createUseCase = new Create${pascalCase}UseCase(${camelCase}Repository);
    const getUseCase = new Get${pascalCase}UseCase(${camelCase}Repository);
    const updateUseCase = new Update${pascalCase}UseCase(${camelCase}Repository);
    const deleteUseCase = new Delete${pascalCase}UseCase(${camelCase}Repository);
    const queryUseCase = new Query${pascalCase}UseCase(${camelCase}Repository);
    const controller = new ${pascalCase}Controller(createUseCase, getUseCase, updateUseCase, deleteUseCase, queryUseCase);
    const router = create${pascalCase}Router(controller);
    logger.info('${pascalCase} Module initialized successfully');
    return router;
}`
        }
    ].map(t => ({
        ...t,
        path: path.resolve(__dirname, "..", "..", "src", "modules", cases.kebabCase, t.path as string)
    }));
    
    return templates;
}

/**
 * Generates application layer templates
 */
const application = ({ kebabCase, pascalCase }: Cases): Template[] => [
    {
        path: "dtos/index.ts",
        template: `export * from './${kebabCase}.dto';`
    },
    {
        path: `dtos/${kebabCase}.dto.ts`,
        template: `
import { z } from 'zod';
import { Create${pascalCase}ValidationSchema, Update${pascalCase}ValidationSchemaBody} from '@app/modules/${kebabCase}/infrastructure/http/validation';

export type Create${pascalCase}Dto = z.infer<typeof Create${pascalCase}ValidationSchema>;
export type Update${pascalCase}Dto = z.infer<typeof Update${pascalCase}ValidationSchemaBody> & { id: string };`
    },
    {
        path: "index.ts",
        template: 'export * from "./dtos";'
    }
];

/**
 * Generates domain layer templates
 */
const domain = ({ kebabCase, pascalCase, camelCase }: Cases): Template[] => [
    {
        path: "entities/index.ts",
        template: `export * from './${kebabCase}.entity';`
    },
    {
        path: `entities/${kebabCase}.entity.ts`,
        template: `
import { BaseEntitySchema } from '@app/shared';
import { z } from 'zod';

export const ${pascalCase}EntitySchema = BaseEntitySchema.extend({
    name: z.string()
    // Add other properties here
});

export type ${pascalCase} = z.infer<typeof ${pascalCase}EntitySchema>;`
    },
    {
        path: "repositories/index.ts",
        template: `export * from './${kebabCase}.repository';`
    },
    {
        path: `repositories/${kebabCase}.repository.ts`,
        template: `
import { IBaseRepository } from '@app/shared';
import { ${pascalCase} } from '@app/modules/${kebabCase}/domain/entities';

export interface I${pascalCase}Repository extends IBaseRepository<${pascalCase}> {
    findByName(name: string): Promise<${pascalCase}>;
}`
    },
    {
        path: `use-cases/create-${kebabCase}.use-case.ts`,
        template: `
import { Create${pascalCase}Dto } from '@app/modules/${kebabCase}/application/dtos';
import { ${pascalCase} } from '@app/modules/${kebabCase}/domain/entities';
import { BaseUseCase, UsecaseResult } from '@app/shared';
import { AuthContext } from '@app/shared';
import { logger } from '@app/utils';
import { Create${pascalCase}ValidationSchema } from '../../infrastructure';
import { I${pascalCase}Repository } from '../repositories';

export class Create${pascalCase}UseCase extends BaseUseCase<Create${pascalCase}Dto, ${pascalCase}, AuthContext> {
    constructor(private readonly ${camelCase}Repository: I${pascalCase}Repository) {
        super();
    }
    
    async beforeExecute(input: Create${pascalCase}Dto): Promise<void> {
        Create${pascalCase}ValidationSchema.parse(input);
    }
    
    async execute(input: Create${pascalCase}Dto, context?: AuthContext): Promise<UsecaseResult<${pascalCase}>> {
        const entity = await this.${camelCase}Repository.create(input);
        return { 
            success: true, 
            message: '${pascalCase} created successfully.', 
            status: 201, 
            data: entity 
        };
    }
}`
    },
    {
        path: `use-cases/delete-${kebabCase}.use-case.ts`,
        template: `
import { BaseUseCase, ParamIdValidationSchema } from '@app/shared';
import { AuthContext } from '@app/shared';
import { UsecaseResult } from '@app/shared';
import { I${pascalCase}Repository } from '../repositories';

export class Delete${pascalCase}UseCase extends BaseUseCase<string, boolean, AuthContext> {
    constructor(private readonly ${camelCase}Repository: I${pascalCase}Repository) {
        super();
    }
    
    async beforeExecute(id: string, context?: AuthContext): Promise<void> {
        ParamIdValidationSchema.parse(id);
        await this.${camelCase}Repository.findById(id);
    }
    
    async execute(id: string, context?: AuthContext): Promise<UsecaseResult<boolean>> {
        await this.${camelCase}Repository.delete(id);
        return { 
            success: true, 
            message: '${pascalCase} deleted successfully.', 
            status: 200, 
            data: true 
        };
    }
}`
    },
    {
        path: `use-cases/get-${kebabCase}.use-case.ts`,
        template: `
import { ${pascalCase} } from '@app/modules/${kebabCase}/domain/entities';
import { BaseUseCase, ParamIdValidationSchema } from '@app/shared';
import { AuthContext } from '@app/shared';
import { UsecaseResult } from '@app/shared';
import { logger } from '@app/utils/logger';
import { I${pascalCase}Repository } from '../repositories';

export class Get${pascalCase}UseCase extends BaseUseCase<string, ${pascalCase}, AuthContext> {
    constructor(private readonly ${camelCase}Repository: I${pascalCase}Repository) {
        super();
    }
    
    async beforeExecute(id: string): Promise<void> {
        ParamIdValidationSchema.parse(id);
    }
    
    async execute(id: string, context?: AuthContext): Promise<UsecaseResult<${pascalCase}>> {
        try {
            const entity = await this.${camelCase}Repository.findById(id);
            return { 
                success: true, 
                message: '${pascalCase} retrieved successfully.', 
                status: 200, 
                data: entity 
            };
        } catch (error) {
            logger.error(this.constructor.name.concat(":Failed"), { error, id, context });
            throw error;
        }
    }
}`
    },
    {
        path: "use-cases/index.ts",
        template: `
export * from './create-${kebabCase}.use-case';
export * from './update-${kebabCase}.use-case';
export * from './delete-${kebabCase}.use-case';
export * from './get-${kebabCase}.use-case';
export * from './query-${kebabCase}.use-case';`
    },
    {
        path: `use-cases/query-${kebabCase}.use-case.ts`,
        template: `
import { ${pascalCase} } from '@app/modules/${kebabCase}/domain/entities';
import { AuthContext, BaseUseCase, QueryParams } from '@app/shared';
import { UsecaseResult } from '@app/shared';
import { logger } from '@app/utils/logger';
import { I${pascalCase}Repository } from '../repositories';

export class Query${pascalCase}UseCase extends BaseUseCase<QueryParams, ${pascalCase}[], AuthContext> {
    constructor(private readonly ${camelCase}Repository: I${pascalCase}Repository) {
        super();
    }
    
    async execute(input: QueryParams, context?: AuthContext): Promise<UsecaseResult<${pascalCase}[]>> {
        const result = await this.${camelCase}Repository.query(input);
        return {
            success: true,
            message: '${pascalCase} queried successfully.',
            status: 200,
            data: result.items,
            meta: {
                totalCount: result.totalCount,
                filterCount: result.filterCount,
                page: input.options?.page ?? 1,
                limit: input.options?.limit ?? 10,
                sort_by: input.options?.sortField ?? "createdAt",
                sort_dir: (input.options?.sortDir ?? -1) > 0 ? "asc" : "desc"
            }
        };
    }
}`
    },
    {
        path: `use-cases/update-${kebabCase}.use-case.ts`,
        template: `
import { Update${pascalCase}Dto } from '@app/modules/${kebabCase}/application/dtos';
import { ${pascalCase} } from '@app/modules/${kebabCase}/domain/entities';
import { BaseUseCase } from '@app/shared';
import { UsecaseResult } from '@app/shared';
import { AuthContext } from '@app/shared';
import { logger } from '@app/utils/logger';
import { I${pascalCase}Repository } from '../repositories';
import { Update${pascalCase}ValidationSchemaBody } from '../../infrastructure';

export class Update${pascalCase}UseCase extends BaseUseCase<Update${pascalCase}Dto, ${pascalCase}, AuthContext> {
    constructor(private readonly ${camelCase}Repository: I${pascalCase}Repository) {
        super();
    }

    async beforeExecute(input: Update${pascalCase}Dto, context: AuthContext): Promise<void> {
        Update${pascalCase}ValidationSchemaBody.parse(input);
        await this.${camelCase}Repository.findById(input.id);
    }
    
    async execute(input: Update${pascalCase}Dto, context?: AuthContext): Promise<UsecaseResult<${pascalCase}>> {
        const { id, ...updateData } = input;
        const entity = await this.${camelCase}Repository.update(id, updateData);
        return { 
            success: true, 
            message: '${pascalCase} updated successfully.', 
            status: 200, 
            data: entity 
        };
    }
}`
    },
    {
        path: "index.ts",
        template: `
export * from "./entities";
export * from "./repositories";
export * from "./use-cases";`
    },
];

/**
 * Generates infrastructure layer templates
 */
const infrastructure = ({ kebabCase, pascalCase, camelCase }: Cases): Template[] => [
    {
        path: "http/controllers/index.ts",
        template: `export * from './${kebabCase}.controller';`
    },
    {
        path: `http/controllers/${kebabCase}.controller.ts`,
        template: `
import { Request, Response } from 'express';
import { ApiHandler, BaseController } from '@app/shared';
import {
    Create${pascalCase}UseCase,
    Get${pascalCase}UseCase,
    Update${pascalCase}UseCase,
    Delete${pascalCase}UseCase,
    Query${pascalCase}UseCase
} from '@app/modules/${kebabCase}/domain/use-cases';
import { logger } from '@app/utils/logger';

export class ${pascalCase}Controller extends BaseController {
    constructor(
        private readonly create${pascalCase}UseCase: Create${pascalCase}UseCase,
        private readonly get${pascalCase}UseCase: Get${pascalCase}UseCase,
        private readonly update${pascalCase}UseCase: Update${pascalCase}UseCase,
        private readonly delete${pascalCase}UseCase: Delete${pascalCase}UseCase,
        private readonly query${pascalCase}UseCase: Query${pascalCase}UseCase
    ) {
        super();
    }

    create = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.create${pascalCase}UseCase.run(req.body, this.getContext(req));
        if (result.success) logger.info('Controller: Created ${pascalCase}', { id: result.data.id });
        res.json_structured(result);
    });

    getById = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.get${pascalCase}UseCase.run(req.params.id, this.getContext(req));
        if (result.success) logger.info('Controller: Retrieved ${pascalCase}', { id: req.params.id });
        res.json_structured(result);
    });

    update = ApiHandler(async (req: Request, res: Response) => {
        const updateDto = { id: req.params.id, ...req.body };
        const result = await this.update${pascalCase}UseCase.run(updateDto, this.getContext(req));
        if (result.success) logger.info('Controller: Updated ${pascalCase}', { id: req.params.id });
        res.json_structured(result);
    });

    delete = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.delete${pascalCase}UseCase.run(req.params.id, this.getContext(req));
        if (result.success) logger.info('Controller: Deleted ${pascalCase}', { id: req.params.id });
        res.json_structured(result);
    });

    getAll = ApiHandler(async (req: Request, res: Response) => {
        const query = this.getQuery(['id', 'name', 'createdAt'], {
            maxLimit: 50,
            strict: true
        })(req.validated.query);
        const result = await this.query${pascalCase}UseCase.run(query, this.getContext(req));
        res.json_structured(result);
    });
}`
    },
    {
        path: "http/routes/index.ts",
        template: `export * from './${kebabCase}.routes';`
    },
    {
        path: `http/routes/${kebabCase}.routes.ts`,
        template: `
import { Router } from 'express';
import { ${pascalCase}Controller } from '@app/modules/${kebabCase}';

export function create${pascalCase}Router(controller: ${pascalCase}Controller): Router {
    const router = Router();
    
    router.route('/')
        .get(controller.getAll)
        .post(controller.create);
        
    router.route('/:id')
        .get(controller.getById)
        .patch(controller.update)
        .delete(controller.delete);
        
    return router;
}`
    },
    {
        path: "http/validation/index.ts",
        template: `export * from './${kebabCase}.schemas';`
    },
    {
        path: `http/validation/${kebabCase}.schemas.ts`,
        template: `
import { z } from 'zod';
import { ParamIdValidationSchema } from '@app/shared';

const ${pascalCase}CoreSchema = z.object({
    name: z.string().min(1, 'Name cannot be empty').trim(),
});

export const Create${pascalCase}ValidationSchema = ${pascalCase}CoreSchema.strict();
export const Update${pascalCase}ValidationSchemaBody = ${pascalCase}CoreSchema.partial().extend({
    id: ParamIdValidationSchema
}).strict();`
    },
    {
        path: "http/index.ts",
        template: `
export * from "./controllers";
export * from "./routes";
export * from "./validation";`
    },
    {
        path: "persistence/mongoose/models/index.ts",
        template: `export * from './${kebabCase}.model';`
    },
    {
        path: `persistence/mongoose/models/${kebabCase}.model.ts`,
        template: `
import { Schema, Document, Model, models, model } from 'mongoose';
import { ${pascalCase} } from '@app/modules/${kebabCase}/domain/entities';

type ${pascalCase}Document = Document & ${pascalCase};

const ${camelCase}Schema = new Schema<${pascalCase}Document>({
    name: { type: String },
}, {
    timestamps: true,
    versionKey: false,
    toObject: {
        transform: (_, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            return ret;
        }
    },
    toJSON: {
        transform: (_, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            return ret;
        }
    }
});

export const ${pascalCase}Model: Model<${pascalCase}Document> = models.${pascalCase} || model<${pascalCase}Document>('${pascalCase}', ${camelCase}Schema);`
    },
    {
        path: "persistence/mongoose/repositories/index.ts",
        template: `export * from './${kebabCase}.repository';`
    },
    {
        path: `persistence/mongoose/repositories/${kebabCase}.repository.ts`,
        template: `
import { Model, Document } from 'mongoose';
import { I${pascalCase}Repository } from '@app/modules/${kebabCase}/domain/repositories';
import { ${pascalCase} } from '@app/modules/${kebabCase}/domain/entities';
import { MongoBaseRepository } from '@app/shared';
import { AppError } from '@app/shared';

export class Mongo${pascalCase}Repository extends MongoBaseRepository<${pascalCase}> implements I${pascalCase}Repository {
    constructor(${camelCase}Model: Model<${pascalCase} & Document>) {
        super(${camelCase}Model);
    }
    
    async findByName(name: string): Promise<${pascalCase}> {
        const item = await this.model.findOne({ name });
        if (!item) {
            throw AppError.notFound('${pascalCase} not found');
        }
        return item;
    }
}`
    },
    {
        path: "persistence/index.ts",
        template: `
export * from "./mongoose/models";
export * from "./mongoose/repositories";`
    },
    {
        path: "index.ts",
        template: `
export * from "./http";
export * from "./persistence";`
    }
];