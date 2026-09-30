import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyStack, simulate, scenarios, components, costOf } from '../src/lib/game.ts';
test('new stacks are independent and cost nothing',()=>{const a=emptyStack();a.cache=1;assert.equal(emptyStack().cache,0);assert.equal(costOf(emptyStack()),0);assert.equal(costOf(a),90);});
test('unprotected database failure serves no traffic',()=>{assert.equal(simulate(emptyStack(),scenarios[4]).served,0);});
test('cache reduces read traffic and CDN relieves the origin',()=>{const a=emptyStack();const before=simulate(a,scenarios[1]);a.cache=1;a.cdn=1;assert.ok(simulate(a,scenarios[1]).origin<before.origin);});
test('replicas survive an app instance loss',()=>{const a=emptyStack();assert.equal(simulate(a,scenarios[3]).compute,0);a.replica=2;assert.equal(simulate(a,scenarios[3]).compute,1200);});
test('queue reduces write pressure',()=>{const a=emptyStack();const before=simulate(a,scenarios[2]);a.queue=2;assert.ok(simulate(a,scenarios[2]).dataDemand<before.dataDemand);});
test('results stay in valid bounds across scenarios',()=>{for(const s of scenarios){for(let n=0;n<=3;n++){const stack=emptyStack();for(const c of components)stack[c.id]=Math.min(n,c.max);const r=simulate(stack,s);assert.ok(r.score>=0&&r.score<=100);assert.ok(r.served>=0&&r.served<=100);assert.ok(r.reliability>=0&&r.reliability<=100);assert.ok(Number.isFinite(r.latency));}}});
test('every round can be won with a cumulative affordable architecture',()=>{const stack=emptyStack();let total=0;const upgrades=[['replica','cache'],['database','cdn','cache'],['database','replica'],['replica','observability'],['database'],['queue','replica']];scenarios.forEach((s,i)=>{total+=s.budget;for(const id of upgrades[i])stack[id as keyof typeof stack]++;assert.ok(costOf(stack)<=total);assert.ok(simulate(stack,s).passed,`round ${i+1}: ${JSON.stringify(simulate(stack,s))}`);});});

test("a well-provisioned launch earns a perfect score",()=>{const stack=emptyStack();stack.replica=1;stack.database=1;assert.equal(simulate(stack,scenarios[0]).score,100);});
