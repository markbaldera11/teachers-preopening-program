const calendarWrapper = document.querySelector('.calendar-wrapper');
        const monthYear = document.getElementById('monthYear');
        const daysGrid = document.getElementById('daysGrid');
        const selectedDateText = document.getElementById('selectedDateText');
        const prevBtn = document.getElementById('prev');
        const nextBtn = document.getElementById('next');

        let currentDate = new Date();

        // Helper Function: Formats any given date into Events/MM-DD-YY.html
        function getFileName(year, month, day) {
            const mm = String(month + 1).padStart(2, '0');
            const dd = String(day).padStart(2, '0');
            const yy = String(year).slice(-2);
            
            // Added the "Events/" folder path here
            return `Events/${mm}-${dd}-${yy}.html`; 
        }

        // Helper Function: Pings the server to see if the file exists
        async function checkFileExists(filepath) {
            try {
                // 1. Force the browser NOT to use cached responses
                const response = await fetch(filepath, { method: 'GET', cache: 'no-store' });
                
                // 2. If the server explicitly throws a 404, return false
                if (!response.ok) return false; 

                // 3. Read the text of whatever file Firebase handed back
                const htmlText = await response.text();
                
                // 4. POSITIVE VERIFICATION FIX:
                // Your newly exported Program Builder files use <div class="nav-wrapper">
                // If the file Firebase handed us does NOT have this class, it is a fake/error page!
                if (!htmlText.includes('class="nav-wrapper"')) {
                    console.log(`Rejected ${filepath}: Not a valid Event HTML file.`);
                    return false; 
                }
                
                // If it survived this far, it's a 100% real event file!
                return true; 
            } catch (error) {
                console.error("Fetch error:", error);
                return false; 
            }
        }

        // Initialization: Runs immediately on page load
        async function init() {
            const today = new Date();
            const todayFile = getFileName(today.getFullYear(), today.getMonth(), today.getDate());
            
            // Check if today's file exists in the Events folder
            const fileExists = await checkFileExists(todayFile);
            
            if (fileExists) {
                // File exists! Redirect immediately. Calendar remains hidden.
                window.location.replace(todayFile); 
            } else {
                // File doesn't exist. Show the calendar and update text.
                calendarWrapper.style.display = 'flex'; 
                selectedDateText.innerText = "No Event found for this date.";
                renderCalendar();
            }
        }

        // Renders the calendar grid
        function renderCalendar() {
            daysGrid.innerHTML = "";
            const month = currentDate.getMonth();
            const year = currentDate.getFullYear();
            const monthName = currentDate.toLocaleString('default', { month: 'long' });
            
            monthYear.innerText = `${monthName} ${year}`;

            const firstDayIndex = new Date(year, month, 1).getDay();
            const lastDay = new Date(year, month + 1, 0).getDate();

            // Empty slots for previous month
            for (let i = 0; i < firstDayIndex; i++) {
                const div = document.createElement('div');
                div.classList.add('day', 'empty');
                daysGrid.appendChild(div);
            }

            // Actual days
            for (let i = 1; i <= lastDay; i++) {
                const div = document.createElement('div');
                div.classList.add('day');
                div.innerText = i;

                // Highlight today
                if (i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) {
                    div.classList.add('today');
                }

                // Click Event for individual days
                div.onclick = async () => {
                    // Highlight clicked day
                    document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
                    div.classList.add('selected');
                    
                    const targetPath = getFileName(year, month, i);
                    selectedDateText.innerText = `Checking for events...`;

                    // Check if clicked date file exists in the Events folder
                    const exists = await checkFileExists(targetPath);
                    
                    if (exists) {
                        // Redirects to the file inside the Events folder
                        window.location.href = targetPath; 
                    } else {
                        selectedDateText.innerText = "No page found for this date.";
                    }
                };

                daysGrid.appendChild(div);
            }
        }

        // Navigation Buttons
        prevBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
        nextBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };

        // Start the check on load
        init();