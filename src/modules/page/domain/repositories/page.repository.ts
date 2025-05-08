
import { IBaseRepository } from '@app/shared';
import { Page, Section } from '@app/modules/page/domain/entities';

export interface IPageRepository extends IBaseRepository<Page> {
    findBySlug(name: string): Promise<Page>;
    getAllSections(pageId: string): Promise<Section[]>
    addSections(pageId: string, sections: Omit<Section, 'id' | 'pageId'>[]): Promise<Section[]>
    findSection(id: string): Promise<Section>
    addSection(data: Partial<Section>): Promise<Section>
    updateSection(sectionId: string, data: Partial<Section>): Promise<Section>
}