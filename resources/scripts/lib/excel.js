import {Consts} from 'scripts/components/consts';
import {unixToDateStr} from 'scripts/lib/date_utils';
const XLSX = require('xlsx');

export const TODO_HEADER = {
    CONSTRUCTION_NUMBER: '工事番号',
    CONSTRUCTION_NAME: '工事件名',
    TITLE: 'TODO',
    AFFILIATION: '所属',
    STAFF_NAME: '担当者',
    SCHEDULE_START_DATE: '開始予定',
    SCHEDULE_END_DATE: '終了予定',
    START_DATE: '開始実績',
    END_DATE: '終了実績',
    STATUS: 'ステータス',
    MEMO: 'メモ',
    FOREMAN: '監督',
    GROUP: '班',
    CREATE_DATE: '作成日',
};

export const exportTodo = (fileName, sheetName, header, todoList, teamList) => {
    const exportData = todoList.map((todo) => {
        const targetIndex = teamList.findIndex((teamItem) => teamItem.id === todo.constructionCase.assignedTeamId);
        const foreman = targetIndex > -1 ? teamList[targetIndex].foremanName : '';
        const group = targetIndex > -1 ? teamList[targetIndex].groupName : '';
        const todoDataArray = new Array(header.length).fill(null);
        insertDataToArrayBasedOnHeaderPosition(header, formatConstructionNumber(todo), TODO_HEADER.CONSTRUCTION_NUMBER, todoDataArray);
        insertDataToArrayBasedOnHeaderPosition(header, formatConstructionName(todo), TODO_HEADER.CONSTRUCTION_NAME, todoDataArray);
        insertDataToArrayBasedOnHeaderPosition(header, todo.title, TODO_HEADER.TITLE, todoDataArray);
        insertDataToArrayBasedOnHeaderPosition(header, todo.affiliation, TODO_HEADER.AFFILIATION, todoDataArray);
        insertDataToArrayBasedOnHeaderPosition(header, todo.staffName, TODO_HEADER.STAFF_NAME, todoDataArray);
        insertDataToArrayBasedOnHeaderPosition(header, unixToDateStr(todo.scheduledStartDate), TODO_HEADER.SCHEDULE_START_DATE, todoDataArray);
        insertDataToArrayBasedOnHeaderPosition(header, unixToDateStr(todo.scheduledEndDate), TODO_HEADER.SCHEDULE_END_DATE, todoDataArray);
        insertDataToArrayBasedOnHeaderPosition(header, unixToDateStr(todo.startDate), TODO_HEADER.START_DATE, todoDataArray);
        insertDataToArrayBasedOnHeaderPosition(header, unixToDateStr(todo.endDate), TODO_HEADER.END_DATE, todoDataArray);
        insertDataToArrayBasedOnHeaderPosition(header, Consts.TodoStatus.getValue(todo.statusCode), TODO_HEADER.STATUS, todoDataArray);
        insertDataToArrayBasedOnHeaderPosition(header, todo.memo, TODO_HEADER.MEMO, todoDataArray);
        insertDataToArrayBasedOnHeaderPosition(header, foreman, TODO_HEADER.FOREMAN, todoDataArray);
        insertDataToArrayBasedOnHeaderPosition(header, group, TODO_HEADER.GROUP, todoDataArray);
        insertDataToArrayBasedOnHeaderPosition(header, unixToDateStr(todo.createdAt), TODO_HEADER.CREATE_DATE, todoDataArray);
        return todoDataArray;
    });

    exportExcel(fileName, sheetName, header, exportData);
};

export const exportExcel = (fileName, sheetName, header, exportData) => {
    const workBook = XLSX.utils.book_new();
    workBook.SheetNames.push(sheetName);

    exportData.unshift(header);
    workBook.Sheets[sheetName] = XLSX.utils.aoa_to_sheet(exportData);

    const options = {
        type: 'binary',
    };

    XLSX.writeFile(workBook, fileName, options);
};

const formatConstructionNumber = (todo) => {
    return `${todo.constructionCase.areaCode}-${todo.constructionCase.subjectNumber}${todo.constructionCase.constructionDistrictCode}`;
};

const formatConstructionName = (todo) => {
    return `${todo.constructionCase.constructionAddress}${todo.constructionCase.constructionName}`;
};

const insertDataToArrayBasedOnHeaderPosition = (header, insertData, insertTargetName, outArray) => {
    const insertIndex = header.indexOf(insertTargetName);
    if (insertIndex >= 0) {
        outArray.splice(insertIndex, 1, insertData);
    }
};
