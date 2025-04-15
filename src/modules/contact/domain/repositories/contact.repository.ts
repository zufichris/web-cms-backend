
import { IBaseRepository } from '@app/shared';
import { Contact } from '@app/modules/contact/domain/entities';

export interface IContactRepository extends IBaseRepository<Contact> {
    findByName(name: string): Promise<Contact>;
}