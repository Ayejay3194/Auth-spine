export interface RetrievedChunk{chunkId:string;docId:string;sourceId:string;title:string;content:string;score:number;}
export interface RetrievalResult{query:string;chunks:RetrievedChunk[];}
