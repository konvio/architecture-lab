export type ComponentId = 'replica' | 'cache' | 'queue' | 'database' | 'cdn' | 'observability';
export type Stack = Record<ComponentId, number>;
export const components: {id: ComponentId; name: string; icon: string; cost: number; max: number; description: string; lesson: string}[] = [
 {id:'replica',name:'App replica',icon:'▤',cost:100,max:4,description:'+600 requests/s · extra redundancy',lesson:'Horizontal scaling raises compute capacity. Replicas also reduce the impact of one failed instance.'},
 {id:'cache',name:'Redis cache',icon:'⚡',cost:90,max:2,description:'Absorb reads · lower latency',lesson:'Caching relieves read pressure, but does little for a write-heavy workload. Invalidation still matters.'},
 {id:'queue',name:'Message queue',icon:'⇥',cost:75,max:2,description:'Smooth bursts · protect writes',lesson:'A queue buffers writes during bursts. It improves throughput at the cost of eventual consistency.'},
 {id:'database',name:'Database replica',icon:'◉',cost:120,max:3,description:'+650 data operations/s · failover',lesson:'Replicas add read capacity and resilience. This simplified model does not represent consistency or replication lag.'},
 {id:'cdn',name:'Edge network',icon:'◇',cost:80,max:1,description:'Serve assets close to users',lesson:'A CDN removes static asset traffic from your origin and reduces global delivery latency.'},
 {id:'observability',name:'Observability',icon:'⌁',cost:60,max:1,description:'Faster recovery · resilience +8',lesson:'Metrics and tracing help you detect and recover from failures. They do not create raw throughput.'}
];
export type Scenario = {name:string; subtitle:string; traffic:number; reads:number; assets:number; budget:number; incident:'none'|'compute'|'database'|'burst'; incidentLabel:string; brief:string};
export const scenarios: Scenario[] = [
 {name:'The launch',subtitle:'A small idea. A very real production system.',traffic:650,reads:.65,assets:.2,budget:260,incident:'none',incidentLabel:'Steady traffic',brief:'Your product is live. Build a lean foundation that handles launch traffic without spending every dollar.'},
 {name:'Front-page moment',subtitle:'Someone just shared your app with the internet.',traffic:1700,reads:.8,assets:.35,budget:290,incident:'burst',incidentLabel:'Traffic burst ×1.25',brief:'Traffic is mostly reads and static assets. Make the most of caching and the edge before adding more servers.'},
 {name:'Checkout rush',subtitle:'More writes. Less room for mistakes.',traffic:1850,reads:.3,assets:.1,budget:250,incident:'burst',incidentLabel:'Traffic burst ×1.25',brief:'Customers are checking out at once. Buffered writes and data capacity matter more than another cache.'},
 {name:'An instance goes dark',subtitle:'Redundancy is about to earn its keep.',traffic:2100,reads:.6,assets:.2,budget:250,incident:'compute',incidentLabel:'One app instance fails',brief:'A compute node disappears during peak hours. Prepare enough replicas and keep recovery time low.'},
 {name:'Database failover',subtitle:'The primary has left the chat.',traffic:2400,reads:.7,assets:.2,budget:250,incident:'database',incidentLabel:'Primary database fails',brief:'Can your data layer survive a failover? Capacity alone is not a substitute for redundancy.'},
 {name:'Global scale',subtitle:'Your architecture. One final stress test.',traffic:3500,reads:.6,assets:.3,budget:300,incident:'burst',incidentLabel:'Traffic burst ×1.25',brief:'Your audience is worldwide. Balance every layer, leave some budget in reserve, and make the final launch count.'}
];
export const emptyStack = (): Stack => ({replica:0,cache:0,queue:0,database:0,cdn:0,observability:0});
export function costOf(stack:Stack):number { return components.reduce((sum,c)=>sum+stack[c.id]*c.cost,0); }
export function simulate(stack:Stack, s:Scenario) {
 const incoming=Math.round(s.traffic*(s.incident==='burst'?1.25:1));
 const edge=Math.min(.55,stack.cdn*s.assets);
 const cached=Math.min(.6,stack.cache*.25*s.reads);
 const origin=incoming*(1-edge)*(1-cached);
 const nodes=Math.max(0,1+stack.replica-(s.incident==='compute'?1:0));
 const compute=nodes*600;
 const dataNodes=1+stack.database-(s.incident==='database'?1:0);
 const database=Math.max(0,dataNodes)*650;
 const writes=1-s.reads;
 const dataDemand=origin*(1-stack.queue*.16*writes);
 const computeRatio=origin===0?1:Math.min(1,compute/origin);
 const dataRatio=dataDemand===0?1:Math.min(1,database/dataDemand);
 const served=Math.min(computeRatio,dataRatio);
 const reliability=Math.max(0,Math.min(100,Math.round(served*100-(stack.replica===0?5:0)-(stack.database===0?5:0)+stack.observability*8)));
 const latency=Math.round(65+130*(1-cached)*(1-edge)+Math.max(0,1-served)*800+stack.queue*12*writes);
 const bottleneck=computeRatio<dataRatio?'Application tier':dataRatio<1?'Data tier':'No bottleneck';
 const score=Math.max(0,Math.round(served*60+reliability*.3+Math.max(0,Math.min(10,10-(latency-200)/30))));
 const passed=served>=.98&&reliability>=90&&latency<300;
 return {incoming,origin:Math.round(origin),compute,database,dataDemand:Math.round(dataDemand),served:Math.round(served*100),reliability,latency,bottleneck,score,passed};
}
export type Result = ReturnType<typeof simulate>;
