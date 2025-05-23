// 年度统计表功能

// 统计视图类型常量
const STATS_VIEW = {
    DAILY_DISTRIBUTION: 'daily_distribution',  // 当日所有活动分布
    ACTIVITY_DAILY: 'activity_daily',          // 特定活动的每日分布
    ACTIVITY_TOTAL: 'activity_total',          // 特定活动的累计时间
    ANNUAL_TABLE: 'annual_table'               // 年度统计表
};

// 初始化年度统计表
function initAnnualTable() {
    // 生成年份选择器选项
    populateYearSelector();
    
    // 生成活动选择器选项
    populateAnnualActivitySelector();
    
    // 生成表格结构
    generateTableStructure();
    
    // 添加事件监听器
    addAnnualTableEventListeners();
}

// 生成年份选择器选项
function populateYearSelector() {
    const yearSelect = document.getElementById('annual-year-select');
    yearSelect.innerHTML = '';
    
    // 获取所有活动的年份
    const years = getActivityYears();
    
    // 如果没有活动记录，添加当前年份
    if (years.length === 0) {
        const currentYear = new Date().getFullYear();
        years.push(currentYear);
    }
    
    // 为每个年份创建选项
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year + '年';
        yearSelect.appendChild(option);
    });
    
    // 默认选择最新的年份
    yearSelect.value = years[years.length - 1];
}

// 获取所有活动的年份
function getActivityYears() {
    const activities = getActivities();
    const yearsSet = new Set();
    
    activities.forEach(activity => {
        const year = new Date(activity.startTime).getFullYear();
        yearsSet.add(year);
    });
    
    return Array.from(yearsSet).sort();
}

// 生成活动选择器选项
function populateAnnualActivitySelector() {
    const activitySelect = document.getElementById('annual-activity-select');
    
    // 保留"所有活动"选项
    const allOption = activitySelect.querySelector('option[value="all"]');
    activitySelect.innerHTML = '';
    activitySelect.appendChild(allOption);
    
    // 获取所有活动名称
    const activityNames = getActivityNames();
    
    // 为每个活动名称创建选项
    activityNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
    });
}

// 生成表格结构
function generateTableStructure() {
    const tableBody = document.querySelector('#annual-table tbody');
    tableBody.innerHTML = '';
    
    // 生成31行（1-31日）
    for (let day = 1; day <= 31; day++) {
        const row = document.createElement('tr');
        
        // 添加日期单元格
        const dayCell = document.createElement('td');
        dayCell.textContent = day;
        row.appendChild(dayCell);
        
        // 添加12个月份单元格
        for (let month = 1; month <= 12; month++) {
            const cell = document.createElement('td');
            cell.id = `cell-${day}-${month}`;
            cell.className = 'activity-cell';
            row.appendChild(cell);
        }
        
        tableBody.appendChild(row);
    }
}

// 添加年度统计表事件监听器
function addAnnualTableEventListeners() {
    const yearSelect = document.getElementById('annual-year-select');
    const activitySelect = document.getElementById('annual-activity-select');
    const showTableBtn = document.getElementById('show-annual-table-btn');
    
    // 显示统计表按钮点击事件
    showTableBtn.addEventListener('click', () => {
        const selectedYear = yearSelect.value;
        const selectedActivity = activitySelect.value;
        populateAnnualTable(selectedYear, selectedActivity);
    });
}

// 填充年度统计表数据
function populateAnnualTable(year, activityFilter = 'all') {
    // 清空所有单元格
    clearTableCells();
    
    // 获取选定年份的活动数据
    const yearActivities = getActivitiesByYear(year);
    
    // 按日期组织活动数据
    const organizedData = organizeActivitiesByDate(yearActivities, activityFilter);
    
    // 填充表格单元格
    fillTableCells(organizedData);
}

// 清空表格单元格
function clearTableCells() {
    const cells = document.querySelectorAll('.activity-cell');
    cells.forEach(cell => {
        cell.innerHTML = '';
        cell.className = 'activity-cell';
    });
}

// 获取指定年份的活动
function getActivitiesByYear(year) {
    const activities = getActivities();
    return activities.filter(activity => {
        const activityYear = new Date(activity.startTime).getFullYear();
        return activityYear.toString() === year.toString();
    });
}

// 按日期组织活动数据
function organizeActivitiesByDate(activities, activityFilter) {
    const organizedData = {};
    
    activities.forEach(activity => {
        // 如果设置了活动过滤器且不匹配，则跳过
        if (activityFilter !== 'all' && activity.activityName !== activityFilter) {
            return;
        }
        
        const date = new Date(activity.startTime);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        
        const key = `${day}-${month}`;
        
        if (!organizedData[key]) {
            organizedData[key] = [];
        }
        
        organizedData[key].push(activity);
    });
    
    return organizedData;
}

// 填充表格单元格
function fillTableCells(organizedData) {
    for (const [key, activities] of Object.entries(organizedData)) {
        const [day, month] = key.split('-').map(Number);
        const cell = document.getElementById(`cell-${day}-${month}`);
        
        if (cell && activities.length > 0) {
            cell.classList.add('has-activity');
            
            // 选择主要活动显示（可以是最长时间的活动）
            const mainActivity = activities.sort((a, b) => b.duration - a.duration)[0];
            
            // 创建活动内容
            const activityContent = document.createElement('div');
            activityContent.className = 'activity-content';
            activityContent.textContent = mainActivity.activityName;
            
            // 如果有备注或成绩，添加到单元格
            if (mainActivity.note) {
                const noteElement = document.createElement('div');
                noteElement.className = 'activity-note';
                noteElement.textContent = mainActivity.note;
                activityContent.appendChild(noteElement);
            }
            
            cell.appendChild(activityContent);
            
            // 如果有多个活动，添加指示器
            if (activities.length > 1) {
                const indicator = document.createElement('span');
                indicator.className = 'multi-activity-indicator';
                indicator.textContent = `+${activities.length - 1}`;
                cell.appendChild(indicator);
            }
        }
    }
}

// 扩展活动对象，添加备注字段
function addNoteToActivity(activityId, note) {
    const activities = getActivities();
    const updatedActivities = activities.map(activity => {
        if (activity.id === activityId) {
            return { ...activity, note };
        }
        return activity;
    });
    
    localStorage.setItem('activities', JSON.stringify(updatedActivities));
}
