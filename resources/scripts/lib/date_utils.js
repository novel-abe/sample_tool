import Moment from 'moment';

export function formatDate(dateString, format) {
    return (dateString) ? new Moment(dateString).format(format || 'YYYY/MM/DD') : '';
};

export const unixToDateStr = (unixTimeMilliseconds, format = 'YYYY-MM-DD', defaultValue = '') => {
    return unixTimeMilliseconds ? new Moment(unixTimeMilliseconds).utc().format(format) : defaultValue;
};

export function getFirstWeekDay(moment) {
    return moment.startOf('month').day(1);
};

export function getEndWeekDay(moment) {
    const endWeek = moment.endOf('month');
    const endDay = endWeek.clone().day(7);
    if (endWeek.format('MM') != endDay.format('MM')) {
        return endDay.day(-7);
    } else {
        return endDay;
    }
};

export function getMonthPeriod(moment) {
    const firstDay = getFirstWeekDay(moment.clone());
    const endDay = getEndWeekDay(moment.clone());
    return `(${firstDay.format('YYYY年MM月DD日')}~${endDay.format('YYYY年MM月DD日')})`;
};
