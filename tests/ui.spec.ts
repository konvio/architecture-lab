import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { afterEach, expect, test } from 'vitest';
import Page from '../src/routes/+page.svelte';
afterEach(cleanup);
test('add, refund, deploy once, progress, restart and help', async()=>{
 const {getByRole,getByText}=render(Page);
 const add=getByRole('button',{name:'Add App replica'});
 const remove=getByRole('button',{name:'Remove App replica'});
 expect(remove.hasAttribute('disabled')).toBe(true);
 await fireEvent.click(add); expect(remove.hasAttribute('disabled')).toBe(false);
 await fireEvent.click(remove); expect(remove.hasAttribute('disabled')).toBe(true);
 await fireEvent.click(add); await fireEvent.click(getByRole('button',{name:'Add Redis cache'}));
 await fireEvent.click(getByRole('button',{name:/Deploy system/}));
 expect(getByText('Your system held up.')).toBeTruthy();
 expect(add.hasAttribute('disabled')).toBe(true);
 expect(getByRole('button',{name:/Next challenge/})).toBeTruthy();
 await fireEvent.click(getByRole('button',{name:/Next challenge/}));
 expect(getByRole('heading',{name:'Front-page moment'})).toBeTruthy();
 await fireEvent.click(getByRole('button',{name:/Restart run/}));
 expect(getByRole('heading',{name:'The launch'})).toBeTruthy();
 expect(remove.hasAttribute('disabled')).toBe(true);
 await fireEvent.click(getByRole('button',{name:/How to play/}));
 expect(getByRole('heading',{name:'Your six-round architecture challenge'})).toBeTruthy();
 await fireEvent.click(getByRole('button',{name:/Close/}));
});
test('full six round campaign can finish and replay', async()=>{
 const {getByRole,getByText}=render(Page);
 const upgrades=[['App replica','Redis cache'],['Database replica','Edge network','Redis cache'],['Database replica','App replica'],['App replica','Observability'],['Database replica'],['Message queue','App replica']];
 for(let i=0;i<6;i++){
  for(const name of upgrades[i]) await fireEvent.click(getByRole('button',{name:`Add ${name}`}));
  await fireEvent.click(getByRole('button',{name:/Deploy system/}));
  if(i<5){expect(getByText('Your system held up.')).toBeTruthy();await fireEvent.click(getByRole('button',{name:/Next challenge/}));}
 }
 expect(getByText('RUN COMPLETE')).toBeTruthy();
 await fireEvent.click(getByRole('button',{name:/Play again/}));
 expect(getByRole('heading',{name:'The launch'})).toBeTruthy();
 expect(getByRole('button',{name:'Remove App replica'}).hasAttribute('disabled')).toBe(true);
});
