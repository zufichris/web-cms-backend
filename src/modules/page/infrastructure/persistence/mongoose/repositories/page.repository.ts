import { Model, Document } from 'mongoose';
import { IPageRepository } from '@app/modules/page/domain/repositories';
import { Page, Section } from '@app/modules/page/domain/entities';
import { MongoBaseRepository } from '@app/shared';
import { AppError } from '@app/shared';
import { logger } from '@app/utils';

export class MongoPageRepository extends MongoBaseRepository<Page> implements IPageRepository {
    constructor(pageModel: Model<Page & Document>, private readonly sectionModel: Model<Section & Document>) {
        super(pageModel);
    }

    async findBySlug(slug: string): Promise<Page> {
        logger.todo("Find Page By Slug should be an aggregation")
        const item = await this.model.findOne({ slug });
        if (!item?.toObject()) {
            throw AppError.notFound('Page not found');
        }
        const sections = await this.sectionModel.find({ pageId: item.id })
        const data = { ...item.toObject(), sections: sections.map(s => s.toObject()) }
        return data;
    }
    async getAllSections(pageId: string): Promise<Section[]> {
        const sections = await this.sectionModel.find({ pageId })
        return sections
    }
    async addSections(pageId: string, sections: Omit<Section, 'id'>[]): Promise<Section[]> {
        const data = sections.map(s => ({
            ...s,
            pageId
        }))
        const result = await this.sectionModel.insertMany(data)
        result.map(r => r.toObject())
        return result
    }
    async findSection(slug: string): Promise<Section> {
        try {
            const result = await this.sectionModel.findOne({
                slug
            })
            if (!result?.toObject()) {
                throw AppError.notFound(`Section with slug ${slug} not found`)
            }
            return result.toObject() as Section
        } catch (error) {
            this.handleError(error)
        }
    }
    async addSection(data: Partial<Section>): Promise<Section> {
        try {
            const result = await this.sectionModel.create(data)
            return result.toObject() as Section
        } catch (error) {
            this.handleError(error)
        }
    }
    async updateSection(sectionId: string, data: Partial<Section>): Promise<Section> {
        try {
            const result = await this.sectionModel.findByIdAndUpdate(sectionId, data, {
                new: true
            })
            if (!result?.toObject()) {
                throw AppError.notFound("Section Not Found")
            }
            return result?.toObject() as Section
        } catch (error) {
            this.handleError(error)
        }
    }


}