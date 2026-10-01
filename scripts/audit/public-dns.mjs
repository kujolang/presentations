// Optional read-only probe: resolve only the audited hostname through 1.1.1.1.
// Does not edit system DNS or disable TLS verification.
import dns from 'node:dns';
const original=dns.lookup;
const resolver=new dns.promises.Resolver();resolver.setServers(['1.1.1.1']);
const hostname='presentations.kujolang.ai';
const addresses=await resolver.resolve4(hostname);
dns.lookup=function(host,options,callback){
 if(host!==hostname)return original.apply(this,arguments);
 if(typeof options==='function'){callback=options;options={};}
 if(options?.all)callback(null,addresses.map(address=>({address,family:4})));
 else callback(null,addresses[0],4);
};
