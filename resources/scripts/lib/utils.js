import Moment from 'moment';
import {Consts} from 'scripts/components/consts';

export const calcPriority = (priorityDetectDate) => {
    if (priorityDetectDate) {
        const now = new Moment();
        const todayAfterOneWeek = new Moment().add(7, 'day');
        const todayAfterOneMonth = new Moment().add(1, 'month');
        const scheduledEndDate = new Moment(priorityDetectDate);
        if (scheduledEndDate < now) {
            return Consts.TodoPriority.getEmergencyKey();
        } else if (scheduledEndDate <= todayAfterOneWeek) {
            return Consts.TodoPriority.getHighKey();
        } else if (scheduledEndDate <= todayAfterOneMonth) {
            return Consts.TodoPriority.getMiddleKey();
        }
    }
    return Consts.TodoPriority.getLowKey();
};

export const generateSelectBoxValue = (value, constObj) => {
    if (value) {
        return {value: value, label: constObj.getValue(value)};
    } else {
        return null;
    }
};

export const generateNonDuplicateSelectBoxOptionsFromObjectArray = (array, propertyName, sortPredicate = null) => {
    if (!array) {
        return [];
    }

    const removedDuplicateArray = array.reduce((p, item) => (p.indexOf(item[propertyName]) !== -1 || item[propertyName] == null) ? p : [...p, item[propertyName]], []);
    if (sortPredicate) {
        removedDuplicateArray.sort(sortPredicate);
    }

    return removedDuplicateArray.map((item) => {
        return {value: item, label: item};
    });
};

export const generateSelectBoxOptionsFromModelArray = (array, propertyName) => {
    if (!array) {
        return [];
    }

    return array.map((model) => {
        return {value: model.id, label: model[propertyName]};
    });
};

export const getShowMoreCaseButtonModifier = (caseList, maxViewableIndex) => {
    if (!caseList) {
        return '--hide';
    }

    const isCaseNumOverLimit = caseList.length > Consts.MAX_VIEWABLE_CASE_LIST_NUM;
    const isExistMoreViewableCase = caseList.length > maxViewableIndex;
    return isCaseNumOverLimit && isExistMoreViewableCase ? '' : '--hide';
};

export const filterCaseListByTextMatch = (caseList, textFilterMap) => {
    if (!caseList) {
        return [];
    }
    if (!textFilterMap) {
        return caseList;
    }

    let filteredList = caseList;
    textFilterMap.forEach((filter, key) => {
        filteredList = filteredList.filter((caseItem) => {
            if (key === 'constructionNumber') {
                const constructionNumber = formatConstructionNumber(caseItem).toLowerCase();
                return constructionNumber.indexOf(filter.toLowerCase()) > -1;
            } else {
                return caseItem[key] ? (caseItem[key].indexOf(filter) > -1) : false;
            }
        });
    });

    return filteredList;
};

export const formatConstructionNumber = (caseItem) => {
    return caseItem ? `${caseItem.areaCode}-${caseItem.subjectNumber}${caseItem.constructionDistrictCode}` : '';
};
