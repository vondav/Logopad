// ==UserScript==
// @name        Logopad
// @namespace   Violentmonkey Scripts
// @match       https://*.pad.cz/diar*
// @grant       none
// @version     2025-03-03
// @author      VonDav
// @description Logopad - Zobrazeni svatku, lichych tydnu, neplanovanych pracovnich dni
// ==/UserScript==

(function() {
    'use strict';

    // !!! leden = 0 !!!
    const prace = [
        new Date(2025, 3, 2),
		new Date(2025, 3, 30),
        new Date(2025, 4, 5),
        new Date(2025, 7, 6),
        new Date(2025, 7, 18),
    ];

    const velikonoce = [
        new Date(2025, 3, 18),
        new Date(2025, 3, 21),
        new Date(2026, 3, 3),
        new Date(2026, 3, 6),
        new Date(2027, 2, 26),
        new Date(2027, 2, 29),
        new Date(2028, 3, 14),
        new Date(2028, 3, 17),
    ];

    const statniSvatky = [
        new Date(2025, 0, 1),   // 1.1.
        new Date(2025, 4, 1),   // 1.5.
        new Date(2025, 4, 8),   // 8.5.
        new Date(2025, 6, 5),   // 5.7.
        new Date(2025, 6, 6),   // 6.7.
        new Date(2025, 8, 28),  // 28.9.
        new Date(2025, 9, 28),  // 28.10.
        new Date(2025, 10, 17), // 17.11.
        new Date(2025, 11, 24), // 24.12.
        new Date(2025, 11, 25), // 25.12.
        new Date(2025, 11, 26)  // 26.12.
    ];

    const monthsMap = {
        'ledna': 'January',
        'února': 'February',
        'března': 'March',
        'dubna': 'April',
        'května': 'May',
        'června': 'June',
        'července': 'July',
        'srpna': 'August',
        'září': 'September',
        'října': 'October',
        'listopadu': 'November',
        'prosince': 'December'
    };

    function addCustomCSS() {
        let style = document.createElement('style');
        style.innerHTML = `
            .dv-statni-svatek {
                background-color: violet !important;
            }

            .dv-statni-svatek:hover {
                background-color: #f2f2f2 !important;
            }

            .dv-lichy-tyden {
                border: 2px #ea9946 solid !important;
            }

            .dv-pracuji {
                background-color: #9dcbcf !important;
            }
        `;
        document.head.appendChild(style);
    }

    function parseDate(dateString) {
        let parsedDate = new Date(dateString);
        if (!isNaN(parsedDate))
            return parsedDate;

        const match = dateString.match(/(\d+)\.?\s*([a-zá-ž]+)\s+(\d{4})/i);
        if (match) {
            const day = match[1];
            const monthCzech = match[2].toLowerCase();
            const year = match[3];

            const monthEnglish = monthsMap[monthCzech];
            if (monthEnglish) {
                return new Date(`${monthEnglish} ${day}, ${year}`);
            }
        }
        return null;
    }

    function isVelikonoce(date) {
        return velikonoce.some(den =>
            den.getDate() === date.getDate() &&
            den.getMonth() === date.getMonth() &&
            den.getFullYear() === date.getFullYear()
        );
    }

    function isStatnivatek(date) {
        return statniSvatky.some(svatek =>
            svatek.getDate() === date.getDate() &&
            svatek.getMonth() === date.getMonth()
        );
    }

    function isPracuji(date) {
        return prace.some(den =>
            den.getDate() === date.getDate() &&
            den.getMonth() === date.getMonth() &&
            den.getFullYear() === date.getFullYear()
        );
    }

    function modifyCalendar() {
        document.querySelectorAll('.react-calendar__tile').forEach(button => {
            const date = parseDate(button.querySelector('abbr').getAttribute('aria-label'));
            if (isStatnivatek(date) || isVelikonoce(date)) {
                button.classList.add('dv-statni-svatek');
            }
            if (isOddWeekISO(date)) {
                button.classList.add('dv-lichy-tyden');
            }
            if (isPracuji(date)) {
                button.classList.add('dv-pracuji');
            }
        });
    }

    function isOddWeekISO(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const dayOffset = (firstDayOfYear.getDay() + 6) % 7;
        const pastDaysOfYear = (date - firstDayOfYear + dayOffset * 86400000) / 86400000;
        const weekNumber = Math.ceil((pastDaysOfYear + 1) / 7);
        return weekNumber % 2 === 1;
    }

    // aktivace po nacteni stranky
    window.addEventListener('load', () => {
        addCustomCSS();
        modifyCalendar();
    });

    // aktivace po zmenach v DOM
    let observer = new MutationObserver(modifyCalendar);
    observer.observe(document.body, { childList: true, subtree: true });
})();