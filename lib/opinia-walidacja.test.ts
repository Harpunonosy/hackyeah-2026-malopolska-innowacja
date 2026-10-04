import test from 'node:test';
import assert from 'node:assert/strict';
import { OpiniaSchema } from './opinia-walidacja';
const opinia={ocena:4,polecilbys:'tak'};
test('opinia dotyczy wyłącznie konkretnego testu albo innowacji',()=>{
 assert.equal(OpiniaSchema.safeParse(opinia).success,false);
 assert.equal(OpiniaSchema.safeParse({...opinia,testId:'12345678-1234-4234-8234-123456789abc'}).success,true);
 assert.equal(OpiniaSchema.safeParse({...opinia,innowacjaId:'straznik'}).success,true);
 assert.equal(OpiniaSchema.safeParse({...opinia,innowacjaId:'straznik',testId:'12345678-1234-4234-8234-123456789abc'}).success,false);
});
