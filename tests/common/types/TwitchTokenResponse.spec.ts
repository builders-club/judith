import { expect } from 'chai';
import { TwitchTokenResponse } from '../../../src/common/types';

describe('Types: TwitchTokenResponse', () => {
    it('should set values in constructor', () => {
        const props = ["access_token","expires_in","token_type"];
        const propVals = ["1",2, "3"];
        const model = new TwitchTokenResponse(
            propVals[0] as string,
            propVals[1] as number,
            propVals[2] as string
        );

        const letModelAny = (model as any);
        for(const idx in props) {
            const prop = props[idx];
            expect(letModelAny[prop]).to.not.be.undefined;
            expect(letModelAny[prop]).to.be.equal(propVals[idx]);
        }
    })
})