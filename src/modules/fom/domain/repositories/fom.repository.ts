
import { IBaseRepository } from '@app/shared';
import { Fom } from '@app/modules/fom/domain/entities';

export interface IFomRepository extends IBaseRepository<Fom> {
    findByName(name: string): Promise<Fom>;
}