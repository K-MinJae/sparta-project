$(document).ready(function () {
    getCalenderInfo()
});


//달력에 필요한 변수들 선언, 초기화
let date = new Date();

let is_private = false; // 개인/팀 캘린더 기본 값 false로 팀 캘린더

let btn_year_month_day = ''; //텍스트 박스와 캘린더 연동 위한 달력 버튼 ID 값 저장


//캘린더 렌더링 함수
const renderCalendar = () => {
    const viewYear = date.getFullYear();
    const viewMonth = date.getMonth();
    let getMonth = ''

    // year-month 채우기
    document.querySelector('.year-month').textContent = `${viewYear}년 ${viewMonth + 1}월`;

    // 지난 달 마지막 Date, 이번 달 마지막 Date
    const prevLast = new Date(viewYear, viewMonth, 0);
    const thisLast = new Date(viewYear, viewMonth + 1, 0);

    const PLDate = prevLast.getDate();
    const PLDay = prevLast.getDay();

    const TLDate = thisLast.getDate();
    const TLDay = thisLast.getDay();

    // Dates 기본 배열들
    const prevDates = [];
    const thisDates = [...Array(TLDate + 1).keys()].slice(1);
    const nextDates = [];

    // prevDates 계산
    if (PLDay !== 6) {
        for (let i = 0; i < PLDay + 1; i++) {
            prevDates.unshift(PLDate - i);
        }
    }

    // nextDates 계산
    for (let i = 1; i < 7 - TLDay; i++) {
        nextDates.push(i)
    }

    // Dates 합치기
    const dates = prevDates.concat(thisDates, nextDates);

    // Dates 정리
    const firstDateIndex = dates.indexOf(1);
    const lastDateIndex = dates.lastIndexOf(TLDate);
    dates.forEach((date, i) => {
        const condition = i >= firstDateIndex && i < lastDateIndex + 1
            ? 'this'
            : 'other';

        if (condition == 'this') {   //viewMonth 는 condition이 변해도 그대로이기 때문에 other 변경.
            getMonth = viewMonth + 1;
        } else if (condition == 'other' && date <= 10) {
            getMonth = viewMonth + 2;
        } else {
            getMonth = viewMonth;
        }


        dates[i] = `<div class="date">
                        <button id="${viewYear}Y${getMonth}M${date}" onclick="dayClick(this)" class="${condition}">${date}<span id="${viewYear}Y${getMonth}M${date}text" class="date-on-text"></span></button>
                    </div>`;

    })

    // Dates 그리기
    document.querySelector('.dates').innerHTML = dates.join('');
}

//시작 시 입력 된 메모 가져와 달력 본체에 입력하는 함수
function getMemo() {

    $.ajax({
        type: "GET",
        headers: {
            Authorization: getCookie('access_token')
        },
        url: "/take-memo",
        data: {},
        success: function (response) {
            let take_text = response['give_text'];

            for (let key in take_text) {
                let text_id = key + 'text';
                let load_text = take_text[key];

                $('#' + text_id).text(load_text);

            }
        }
    })
}

function getInfo(){

}

//팀 캘린더로 세팅합니다.
function setMemoTeam() {
    let is_private = false;

}

//개인 캘린더로 세팅 합니다.
function setMemoPrivate() {

    let is_private = true;

}

//달력 선택 버튼 세팅
function getCalenderInfo() {
    $.ajax({
        type: "GET",
        headers: {
            Authorization: getCookie('access_token')
        },
        url: "/get-calender-selector",
        data: {},
        success: function (response) {
            let cal_index = response['send_cal_idx'];

            let nick_name = cal_index[0];
            let team_name = cal_index[1];
            let count = 1, team_count = 1;

            for (let i = 2; i < cal_index.length; i++) {
                if (cal_index[i].indexOf('calender') != -1) {

                    let temp_html = `<li>
                        <button class="dropdown-item">${nick_name}의 캘린더 ${count}</button>
                    </li>`

                    $('#select_cal_list').append(temp_html)

                    count++;

                } else if ((cal_index[i].indexOf('calender') == -1)) {
                    let temp_html = `<li>
                        <button class="dropdown-item">팀 ${team_name}의 캘린더 ${team_count}</button>
                    </li>`

                    $('#select_cal_list').append(temp_html)

                    team_count++;
                }
            }
        }
    })
}

function addCalender() {
    let add_btn_checked = $('input[name="add-calender-group"]:checked').val();

    if (add_btn_checked == 1) {
        is_private = false;
    } else if (add_btn_checked == 2) {
        is_private = true;
    }

    $.ajax({
        type: "POST",
        headers: {
            Authorization: getCookie('access_token')
        },
        url: "/add-calender",
        data: {isPrivate_give: is_private},
        success: function (response) {
            alert(response['msg'])
            window.location.reload();
        }
    })

}


renderCalendar();
getMemo();


const prevMonth = () => {
    date.setDate(1);
    date.setMonth(date.getMonth() - 1);
    renderCalendar();
    getMemo();
}

const nextMonth = () => {
    date.setDate(1);
    date.setMonth(date.getMonth() + 1);
    renderCalendar();
    getMemo();
}

const goToday = () => {
    date = new Date();
    renderCalendar();
}


//현재 날짜 표시 함수. 고장남.
// const today = new Date();
// if (viewMonth === today.getMonth() && viewYear === today.getFullYear()) {
//   for (let date of document.querySelectorAll('.this')) {
//     if (+date.innerText === today.getDate()) {
//       date.classList.add('today');
//       break;
//     }
//   }
// }


function dayClick(obj) {
    btn_year_month_day = $(obj).attr('id'); // 달력 날짜를 클릭 했을 때 받아온 날짜 ID 를 변수에 초기화.
    let memo_text_day = btn_year_month_day.replace("Y", "년 ").replace("M", "월 ") + "일";
    $('.select-date').text(memo_text_day);

    $.ajax({
        type: "POST",
        headers: {
            Authorization: getCookie('access_token')
        },
        url: "/click-day",
        data: {date_give: btn_year_month_day},
        success: function (response) {
            let receive_date_memo = response['resend_date_memo'];
            $('#calenderNote').text(receive_date_memo);
        }
    })

}


//텍스트 업데이트 함수
function updateText(obj) {
    let varMemoText = $(obj).val();

    $.ajax({
        type: "POST",
        headers: {
            Authorization: getCookie('access_token')
        },
        url: "/change-memo-text",
        data: {change_memo_give: varMemoText, key_class_give: btn_year_month_day},
        success: function (response) {
            console.log(response)
        }
    })

    location.reload(); //현재 새로고침 안하면 메모 입력 시 반영 안 되는 버그로 넣어놨습니다.
}
