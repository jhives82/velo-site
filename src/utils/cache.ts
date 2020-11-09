import moment from 'moment';

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