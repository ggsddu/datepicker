/**
 * DatePicker
 * usage：
 *   <input type="text" onfocus="pickDate(this)"/>
 *   <input type="text" onfocus="pickDate(this, 'yyyy-mm-dd')"/>
 *   <input type="text" onfocus="pickDate(this, 'yyyy-mm-dd HH:mm')"/>
 *
 * @version 1.0
 * @author ggsddu
 * @url http://ggsddu.org/js-datepicker/
 * @email ggsddu.org@gmail.com
 */

Date.prototype.format = function (fmt) {
    var s = fmt;

    s = s.replace(/H{2}/g, this.getHours() < 10 ? "0" + this.getHours() : this.getHours());
    s = s.replace(/H{1}/g, this.getHours());
    s = s.replace(/m{2}/g, this.getMinutes() < 10 ? "0" + this.getMinutes() : this.getMinutes());
    s = s.replace(/m{1}/g, this.getMinutes());
    s = s.replace(/s{2}/g, this.getSeconds() < 10 ? "0" + this.getSeconds() : this.getSeconds());
    s = s.replace(/s{1}/g, this.getSeconds());

    s = s.replace(/y{4}/g, this.getFullYear());
    s = s.replace(/y{2}/g, this.getYear());
    s = s.replace(/M{2}/g, (this.getMonth() + 1 < 10) ? "0" + (this.getMonth() + 1) : this.getMonth() + 1);
    s = s.replace(/M{1}/g, this.getMonth() + 1);
    s = s.replace(/d{2}/g, this.getDate() < 10 ? "0" + this.getDate() : this.getDate());
    s = s.replace(/d{1}/g, this.getDate());

    return s;
}

Date.parseDate = function (src, fmt) {
    var sa = src.split(/\W+/);
    var fa = fmt.split(/\W+/);
    if (sa.length != fa.length) {
        alert("Argument source or format error!");
        return new Date();
    }

    var result = new Date(0);
    for (var i = 0; i < fa.length; i++) {
        var p = fa[i];
        var m = sa[i];
        if (/y{4}/.test(p)) {
            result.setFullYear(parseInt(m));
        } else if (/y{2}/.test(p)) {
            result.setYear(parseInt(m, 10));
        } else if (/M{1,2}/.test(p)) {
            result.setMonth(parseInt(m, 10) - 1);
        } else if (/d{1,2}/.test(p)) {
            result.setDate(parseInt(m, 10));
        } else if (/H{1,2}/.test(p)) {
            result.setHours(parseInt(m, 10));
        } else if (/m{1,2}/.test(p)) {
            result.setMinutes(parseInt(m, 10));
        } else if (/s{1,2}/.test(p)) {
            result.setSeconds(parseInt(m, 10));
        } else {
            continue;
        }
    }
    return result;
}

/**
 * 基本设置
 */
var Setting = {
    DATE_FORMAT: "yyyy-MM-dd",
    WEEKS: ["日", "一", "二", "三", "四", "五", "六"],
    MONTHS: ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],
    PREV_YEAR: String.fromCharCode(0x00AB),
    PREV_MONTH: String.fromCharCode(0x2039),
    NEXT_MONTH: String.fromCharCode(0x203A),
    NEXT_YEAR: String.fromCharCode(0x00BB),
    YEAR_FORMAT: "yyyy年",
    MONTH_FORMAT: "M月",
    PREV_YEAR_TITLE: "上一年",
    PREV_MONTH_TITLE: "上月",
    NEXT_MONTH_TITLE: "下月",
    NEXT_YEAR_TITLE: "下一年",
    TODAY: "今天",
    CLEAR: "清空",
    CLOSE: "关闭",
    KEY_RETURN: 13,
    KEY_TAB: 9
}
/**
 * 工具方法
 */
var Utils = {
    getPosition: function(el) {
        var p = el;
        var l = 0, t = 0;
        do {
            l += p.offsetLeft;
            t += p.offsetTop;
        } while (p = p.offsetParent);
        return {left: l, top: t};
    },
    belong: function(sunEl, parentEl){
        var el = sunEl;
        do {
            if (el == parentEl)
                return true;
        } while (el = el.offsetParent);
        return false;
    },
    generateElement: function(tag, attrs, content) {
        var fragment = document.createElement(tag);
        for (var prop in attrs) {
            fragment[prop] = attrs[prop];
        }
        if (content) {
            fragment.appendChild(document.createTextNode(content));
        }
        return fragment;
    },
    equalsDateOnly: function(date1, date2) {
        return date1.getFullYear() == date2.getFullYear()
                && date1.getMonth() == date2.getMonth()
                && date1.getDate() == date2.getDate();
    }
}

/**
 * 定义DatePicker类
 * @param field
 * @param format
 */
function DatePicker(field, format) {
    if (!field) {
        alert("Argument field required!");
        return;
    }
    this.version = "1.0";
    this.copyright = "DatePicker " + this.version + "\n作者：ggsddu\n信箱：ggsddu.org@gmail.com";
    this.inputField = field;
    this.dateFormat = format ? format : Setting.DATE_FORMAT;

    this.valueDate = this.inputField.value ? Date.parseDate(this.inputField.value, this.dateFormat) : new Date();

    this.bgIframe = null;
    this.pickerDiv = null;
    this.calendarTable = null;
    this.yearSpan = null;
    this.yearInput = null;
    this.monthSpan = null;
    this.monthSelect = null;
    this.valueSpan = null;
    this.hourInput = null;
    this.minuteInput = null;
    this.secondInput = null;

    this.initialize();

}
/**
 * 初始化方法，生成div，iframe等
 */
DatePicker.prototype.initialize = function() {
    var self = this;

    var pos = Utils.getPosition(this.inputField);

    this.bgIframe = document.createElement("iframe");
    this.pickerDiv = document.createElement("div");
    this.calendarTable = document.createElement("table");
    this.yearSpan = document.createElement("span");
    this.yearInput = Utils.generateElement("input", {type:"text",size:4,maxLength:4,className:"year"})
    this.monthSpan = document.createElement("span");
    this.monthSelect = document.createElement("select");
    this.valueSpan = document.createElement("span");

    var bgIframe = this.bgIframe;
    bgIframe.frameBorder = "0";
    bgIframe.scrolling = "no";
    bgIframe.style.position = "absolute";
    bgIframe.style.zIndex = 1024;
    bgIframe.style.visibility = "hidden";
    bgIframe.style.left = pos.left + "px";
    bgIframe.style.top = (pos.top + this.inputField.offsetHeight) + "px";
    bgIframe.style.backgroundColor = "white";
    document.body.appendChild(bgIframe);

    var pickerDiv = this.pickerDiv;
    pickerDiv.id = "datepicker" + (new Date()).getMilliseconds();
    pickerDiv.className = "datepicker";
    pickerDiv.style.position = "absolute";
    pickerDiv.style.zIndex = parseInt(bgIframe.style.zIndex) + 1;
    pickerDiv.style.visibility = "hidden";
    pickerDiv.style.left = bgIframe.offsetLeft + "px";
    pickerDiv.style.top = bgIframe.offsetTop + "px";

    var headTable = document.createElement("table");
    headTable.className = "dphead"
    var headTr = headTable.insertRow(-1);

    var prevYearLink = Utils.generateElement("a", {href:"javascript:",title:Setting.PREV_YEAR_TITLE}, Setting.PREV_YEAR);
    prevYearLink.onclick = function() {
        self.valueDate.setFullYear(self.valueDate.getFullYear() - 1);
        self.refresh();
    }
    headTr.insertCell(-1).appendChild(prevYearLink);

    var prevMonthLink = Utils.generateElement("a", {href:"javascript:",title:Setting.PREV_MONTH_TITLE}, Setting.PREV_MONTH);
    prevMonthLink.onclick = function() {
        self.valueDate.setMonth(self.valueDate.getMonth() - 1);
        self.refresh();
    }
    headTr.insertCell(-1).appendChild(prevMonthLink);

    var yearTd = headTr.insertCell(-1);
    yearTd.appendChild(this.yearSpan);
    yearTd.appendChild(this.yearInput);
    this.yearInput.style.display = "none";
    this.yearSpan.onclick = function() {
        this.style.display = "none";
        self.yearInput.style.display = "";
        self.yearInput.focus();
        self.yearInput.select();
    }
    this.yearInput.onblur = function() {
        this.style.display = "none";
        self.yearSpan.style.display = "";
        if (parseInt(this.value)) {
            self.valueDate.setFullYear(parseInt(this.value));
        }
        self.refresh();
    }
    this.yearInput.onkeydown = function (e) {
        e = e ? e : window.event;
        if (Setting.KEY_RETURN == e.keyCode) {
            this.blur();
        }
    }

    var monthTd = headTr.insertCell(-1);
    monthTd.appendChild(this.monthSpan);
    monthTd.appendChild(this.monthSelect);
    this.monthSelect.style.display = "none";
    for (var i = 0; i < 12; i++) {
        this.monthSelect.appendChild(Utils.generateElement("option", {value:i}, (i + 1)));
    }
    this.monthSpan.onclick = function() {
        this.style.display = "none";
        self.monthSelect.style.display = "";
        self.monthSelect.focus();
    }
    this.monthSelect.onblur = function() {
        this.style.display = "none";
        self.monthSpan.style.display = "";
        self.valueDate.setMonth(this.value);
        self.refresh();
    }
    this.monthSelect.onchange = function() {
        this.blur();
    }

    var nextMonthLink = Utils.generateElement("a", {href:"javascript:",title:Setting.NEXT_MONTH_TITLE}, Setting.NEXT_MONTH);
    nextMonthLink.onclick = function() {
        self.valueDate.setMonth(self.valueDate.getMonth() + 1);
        self.refresh();
    }
    headTr.insertCell(-1).appendChild(nextMonthLink);

    var nextYearLink = Utils.generateElement("a", {href:"javascript:",title:Setting.NEXT_YEAR_TITLE}, Setting.NEXT_YEAR);
    nextYearLink.onclick = function() {
        self.valueDate.setFullYear(self.valueDate.getFullYear() + 1);
        self.refresh();
    }
    headTr.insertCell(-1).appendChild(nextYearLink);

    pickerDiv.appendChild(headTable);

    pickerDiv.appendChild(this.calendarTable);
    this.calendarTable.className = "dpcalendar";

    var footTable = document.createElement("table");
    footTable.className = "dpfoot";
    var footTr = footTable.insertRow(-1);

    var hasTime = this.dateFormat.indexOf("H") > -1;
    if (hasTime) {
        var timeSpan = document.createElement("span");
        this.hourInput = Utils.generateElement("input", {type:"text",size:2,maxLength:2,className:"time"});
        this.hourInput.onchange = function() {
            self.valueDate.setHours(parseInt(this.value) ? parseInt(this.value) : 0);
            self.refresh();
        }
        timeSpan.appendChild(this.hourInput);
        timeSpan.appendChild(document.createTextNode(":"));
        this.minuteInput = Utils.generateElement("input", {type:"text",size:2,maxLength:2,className:"time"});
        this.minuteInput.onchange = function() {
            self.valueDate.setMinutes(parseInt(this.value) ? parseInt(this.value) : 0);
            self.refresh();
        }
        timeSpan.appendChild(this.minuteInput);
        timeSpan.appendChild(document.createTextNode(":"));
        this.secondInput = Utils.generateElement("input", {type:"text",size:2,maxLength:2,className:"time"});
        this.secondInput.onchange = function() {
            self.valueDate.setSeconds(parseInt(this.value) ? parseInt(this.value) : 0);
            self.refresh();
        }
        timeSpan.appendChild(this.secondInput);
        footTr.insertCell(-1).appendChild(timeSpan);
    } else {
        footTr.insertCell(-1).appendChild(this.valueSpan);
    }

    var todayLink = Utils.generateElement("a", {href:"javascript:",title:new Date().format(Setting.DATE_FORMAT)}, Setting.TODAY);
    todayLink.onclick = function() {
        self.valueDate.setDate(new Date().getDate());
        self.inputField.value = self.valueDate.format(self.dateFormat);
        self.hide();
    }
    todayLink.onmouseover = function() {
        self.valueDate.setDate(new Date().getDate());
        self.valueSpan.innerHTML = self.valueDate.format(self.dateFormat);
    }
    footTr.insertCell(-1).appendChild(todayLink);

    var clearLink = Utils.generateElement("a", {href:"javascript:",title:Setting.CLEAR}, Setting.CLEAR);
    clearLink.onclick = function() {
        self.inputField.value = "";
        self.hide();
    }
    footTr.insertCell(-1).appendChild(clearLink);

    var closeLink = Utils.generateElement("a", {href:"javascript:",title:this.copyright}, Setting.CLOSE);
    closeLink.onclick = function() {
        self.hide();
    }
    footTr.insertCell(-1).appendChild(closeLink);

    if (hasTime) {
        var valueTd = footTable.insertRow(-1).insertCell(-1);
        valueTd.colSpan = "4";
        valueTd.className = "dpvalue";
        valueTd.appendChild(this.valueSpan);
    }

    pickerDiv.appendChild(footTable);

    document.body.appendChild(pickerDiv);

    document.onclick = function(e){
        e = e ? e : window.event;
        if(Utils.belong(e.srcElement, self.pickerDiv) 
          || e.srcElement == self.inputField
          || e.srcElement == self.yearSpan
          || e.srcElement == self.monthSpan ){
        }else{
            self.hide();
        }
    } 
    /*this.inputField.onblur = function(e) {
        e = e ? e : window.event;
        if (e.offsetX < 0
                || e.offsetX > self.pickerDiv.offsetWidth
                || e.offsetY < 0
                || e.clientY > self.inputField.offsetHeight + self.pickerDiv.offsetHeight) {
            self.hide();
        }
    }*/
    this.inputField.onkeydown = function(e) {
        e = e ? e : window.event;
        if (Setting.KEY_TAB == e.keyCode) {
            self.hide();
        }
    }
}

/**
 * 更新DatePicker内容
 */
DatePicker.prototype.refresh = function() {
    var self = this;
    this.yearSpan.innerHTML = this.valueDate.format(Setting.YEAR_FORMAT);
    this.yearInput.value = this.valueDate.getFullYear();
    this.monthSpan.innerHTML = this.valueDate.format(Setting.MONTH_FORMAT);
    this.monthSelect.selectedIndex = this.valueDate.getMonth();
    this.valueSpan.innerHTML = this.valueDate.format(this.dateFormat);
    var rowCount = this.calendarTable.rows.length;
    for (var i = 0; i < rowCount; i++) {
        this.calendarTable.deleteRow(0);
    }
    var th = this.calendarTable.insertRow(-1);
    th.className = "caltitle";
    for (var i = 0; i < Setting.WEEKS.length; i++) {
        th.insertCell(-1).appendChild(document.createTextNode(Setting.WEEKS[i]));
    }

    var today = new Date();
    var date1 = new Date(this.valueDate);
    date1.setDate(1);
    var date2 = new Date(this.valueDate);
    date2.setMonth(date2.getMonth() + 1);
    date2.setDate(0);
    var weekCount = (date2.getDate() + date1.getDay()) / 7;
    var tempDate = new Date(this.valueDate);
    tempDate.setDate(1);
    tempDate.setDate(tempDate.getDate() - tempDate.getDay());

    for (var i = 0; i < weekCount; i++) {
        var tr = this.calendarTable.insertRow(-1);
        for (var j = 0; j < 7; j++) {
            var td = tr.insertCell(-1);

            if (tempDate.getMonth() == this.valueDate.getMonth()) {
                var dateLink = Utils.generateElement("a", {href:"javascript:",title:tempDate.format(Setting.DATE_FORMAT)}, tempDate.getDate());
                if (Utils.equalsDateOnly(tempDate, self.valueDate)){
                    dateLink.className = "vlday";
                } else if (Utils.equalsDateOnly(tempDate, today)) {
                    dateLink.className = "today";
                }
                dateLink.onclick = function() {
                    self.valueDate.setDate(parseInt(this.innerHTML));
                    self.inputField.value = self.valueDate.format(self.dateFormat);
                    self.hide();
                }
                dateLink.onmouseover = function() {
                    self.valueDate.setDate(parseInt(this.innerHTML));
                    self.valueSpan.innerHTML = self.valueDate.format(self.dateFormat);
                }
                td.appendChild(dateLink);
            }
            tempDate.setDate(tempDate.getDate() + 1);
        }
    }
    if (this.hourInput) {
        this.hourInput.value = this.valueDate.getHours();
    }
    if (this.minuteInput) {
        this.minuteInput.value = this.valueDate.getMinutes();
    }
    if (this.secondInput) {
        this.secondInput.value = this.valueDate.getSeconds();
    }
    this.bgIframe.style.width = this.pickerDiv.offsetWidth + "px";
    this.bgIframe.style.height = this.pickerDiv.offsetHeight + "px";
}

/**
 * 显示DatePicker
 */
DatePicker.prototype.hide = function() {
    this.pickerDiv.style.visibility = "hidden";
    this.bgIframe.style.visibility = "hidden";
}
/**
 * 隐藏DatePicker
 */
DatePicker.prototype.show = function() {
    this.refresh();
    this.bgIframe.style.visibility = "visible";
    this.pickerDiv.style.visibility = "visible";
}

/**
 * 使用DatePicker的接口方法
 * @param field
 * @param format
 */
function pickDate(field, format) {
    if (!field.datepicker) {
        field.datepicker = new DatePicker(field, format);
    }
    field.datepicker.show();
}


