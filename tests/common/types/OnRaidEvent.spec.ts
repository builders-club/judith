import { expect } from 'chai';
import { OnRaidEvent, User } from '../../../src/common/types';
import { user } from '../../mocks';

describe('Types: OnRaidEvent', () => {
    it('should set values in constructor', () => {
        const props = ["user","viewers"];
        const propVals = [user(),32];
        const model = new OnRaidEvent(
            propVals[0] as User,
            propVals[1] as number
        );

        const letModelAny = (model as any);
        for(const idx in props) {
            const prop = props[idx];
            expect(letModelAny[prop]).to.not.be.undefined;
            expect(letModelAny[prop]).to.be.equal(propVals[idx]);
        }
    })
})