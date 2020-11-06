import moment from 'moment';

export const resetUserSpecificCache = () => {
  localStorage.removeItem('VLO__earnedBalance')
  localStorage.removeItem('VLO__stakedBalance')
}

export const setCache = (key: string, data: any) => {
	localStorage.setItem(`VLO__${key}`, JSON.stringify({
		data: data,
		timestamp: moment().unix()
	}))
}

export const getCache = (key: string) => {
	const data = localStorage.getItem(`VLO__${key}`);
	return data ? JSON.parse(data) : {}
}

export const getDiffInSeconds = (unixTimestamp: number) => {
	return moment().unix() - unixTimestamp;
}

export const giveCacheToApp = (cacheKey: string, cacheDurationInSeconds: Number, setCacheFunction: Function) => {
	const fromCache = getCache(cacheKey)
    const diffInSeconds = getDiffInSeconds(fromCache.timestamp)
    if(fromCache && fromCache.timestamp) {
      setCacheFunction(fromCache.data);
      if(diffInSeconds <= cacheDurationInSeconds) {
      	return true;
      }
    }
    return false;
}
