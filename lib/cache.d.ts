interface CacheObject {
  clearCache: () => void;
  getCache: () => any;
  setCache: (value: any) => void;
  getTTL: () => number;
  setTTL: (ttl: number) => void;
}
declare function Cache(): CacheObject;
export default Cache;
