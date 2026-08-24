/**
 * Chamod & Sisara e-Invitation
 * Logic & Interactivity Engine
 */

document.addEventListener("DOMContentLoaded", () => {
    // ---------------------------------------------------------
    // 1. INITIALIZE ICONS & REVELATION STATES
    // ---------------------------------------------------------
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

    // ---------------------------------------------------------
    // 2. STATE MANAGEMENT & DYNAMIC DOM LOADING
    // ---------------------------------------------------------
    // Default configurations
    const DEFAULT_CONFIGS = {
        dayName: "Friday",
        dayNum: "23",
        monthYear: "October 2026",
        weddingTime: "5:00 PM onwards",
        rsvpDeadline: "15 September 2026",
        phoneChamod: "071-3564272",
        phoneSisara: "071-9694860",
        musicUrl: "https://youtu.be/Mfxz8Tjvg5Q?si=JhfjKEVE5besf7Va",
        googleSheetUrl: "https://script.google.com/macros/s/AKfycbyAjncrEHcvhy0Mpe0mWIHrpBScR8iK2GXicohj0mkcFgLu3bdTRBv79CH7mzhYqtVv/exec",
        venueHero: "Grand Imperial Ballroom, Lavendro Garden Hotel",
        venueDetail: "Grand Imperial Ballroom",
        hotelDetail: "Lavendro Garden Hotel, Kosgama, Awissawella",
        storyText: `It all began 14 years ago...<br>
Not with a grand plan,<br>
Not with a perfect moment,<br>
But with two school hearts who found each other.<br><br>
From classroom memories,<br>
Shared smiles,<br>
Endless conversations,<br>
Dreams, challenges, laughter, and countless unforgettable moments...<br><br>
We have walked hand in hand through every season of life.<br><br>
<strong>14 years of love.<br>
One lifetime to go. ❤️</strong>`,
        footerQuote: `"Some love stories are written in books.<br>
Ours was written in classrooms,<br>
in countless conversations,<br>
through years of waiting,<br>
and in every promise we kept.<br><br>
Now...<br>
we're writing our most beautiful chapter yet.<br>
We would be honoured to have you there when it begins."`
    };

    // Load configs from LocalStorage or fallback to default
    let configs = JSON.parse(localStorage.getItem("wedding_invitation_configs")) || DEFAULT_CONFIGS;

    // Ensure the Google Sheets Web App URL is populated if it was previously empty
    if (configs && !configs.googleSheetUrl && DEFAULT_CONFIGS.googleSheetUrl) {
        configs.googleSheetUrl = DEFAULT_CONFIGS.googleSheetUrl;
        localStorage.setItem("wedding_invitation_configs", JSON.stringify(configs));
    }

    // Load RSVPs
    let rsvps = JSON.parse(localStorage.getItem("wedding_rsvp_list")) || [
        {
            guestName: "Aruni Kodithuwakku",
            guestContact: "0771234567",
            attending: "yes",
            guestCount: "2",
            diet: "non-veg",
            guestMessage: "Super excited to see you two tie the knot! 14 years of love is beautiful."
        },
        {
            guestName: "Nirosh Hewawitharana",
            guestContact: "0714567890",
            attending: "yes",
            guestCount: "1",
            diet: "veg",
            guestMessage: "Wishing Chamod & Sisara a wonderful lifetime of happiness together. Congratulations!"
        }
    ];

    // Persist mock RSVPs on first load
    if (!localStorage.getItem("wedding_rsvp_list")) {
        localStorage.setItem("wedding_rsvp_list", JSON.stringify(rsvps));
    }

    // Global variables for countdown and YouTube player
    let countdownInterval;
    let ytPlayer;
    let isYtApiReady = false;

    // Function to apply configs to the site DOM
    function applyConfigs() {
        // Hero Elements
        document.getElementById("display-day-name").innerText = configs.dayName;
        document.getElementById("display-day-num").innerText = configs.dayNum;
        document.getElementById("display-month-year").innerText = configs.monthYear;
        document.getElementById("display-venue-hero").innerText = configs.venueHero;

        // Details Elements
        document.getElementById("display-date-full").innerText = `${configs.dayName}, ${configs.dayNum} ${configs.monthYear}`;
        document.getElementById("display-time").innerText = configs.weddingTime;
        document.getElementById("display-venue-detail").innerText = configs.venueDetail;
        document.getElementById("display-hotel-detail").innerText = configs.hotelDetail;

        // RSVP Elements
        document.getElementById("display-rsvp-deadline").innerText = configs.rsvpDeadline;

        // Story Elements
        document.getElementById("display-story-text").innerHTML = configs.storyText;

        // Footer Elements
        document.getElementById("display-footer-quote").innerHTML = configs.footerQuote;
        document.getElementById("display-footer-date").innerText = `${configs.dayNum} • ${getMonthNumber(configs.monthYear)} • ${getYear(configs.monthYear)}`;
        
        // Contacts
        document.getElementById("display-phone-chamod").innerText = configs.phoneChamod;
        document.getElementById("display-phone-chamod").href = `tel:${configs.phoneChamod.replace(/[^0-9]/g, '')}`;
        document.getElementById("display-phone-sisara").innerText = configs.phoneSisara;
        document.getElementById("display-phone-sisara").href = `tel:${configs.phoneSisara.replace(/[^0-9]/g, '')}`;

        // Background Music Update (YouTube Video)
        if (isYtApiReady) {
            initYouTubePlayer();
        }

        // Restart countdown with new target
        initCountdown();
    }

    // Helper functions for parsing date
    function getMonthNumber(monthYearStr) {
        const parts = monthYearStr.trim().split(" ");
        const months = {
            january: "01", february: "02", march: "03", april: "04", may: "05", june: "06",
            july: "07", august: "08", september: "09", october: "10", november: "11", december: "12"
        };
        const monthName = parts[0] ? parts[0].toLowerCase() : "10";
        return months[monthName] || "10";
    }

    function getYear(monthYearStr) {
        const parts = monthYearStr.trim().split(" ");
        return parts[1] || "2026";
    }

    // Load initial configs to DOM
    applyConfigs();

    // Start falling petals immediately
    startPetalRain();

    // Welcome preloader entry button trigger
    const openBtn = document.getElementById("btn-open-invitation");
    const preloader = document.getElementById("preloader");
    if (openBtn && preloader) {
        openBtn.addEventListener("click", () => {
            preloader.classList.add("fade-out");
            // If YouTube player is ready, play immediately!
            if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
                ytPlayer.playVideo();
                if (musicContainer) musicContainer.classList.add("playing");
                const tooltip = document.querySelector(".music-tooltip");
                if (tooltip) tooltip.innerText = "Pause Music";
            }
        });
    }

    // ---------------------------------------------------------
    // 3. YOUTUBE BACKGROUND MUSIC CONTROLLER
    // ---------------------------------------------------------
    const musicContainer = document.getElementById("music-player-container");
    const musicToggle = document.getElementById("btn-music-toggle");

    // Load YouTube API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = function() {
        isYtApiReady = true;
        initYouTubePlayer();
    };

    function getYouTubeId(urlOrId) {
        if (!urlOrId) return "";
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = urlOrId.match(regExp);
        return (match && match[2].length === 11) ? match[2] : urlOrId;
    }

    function initYouTubePlayer() {
        if (!isYtApiReady) return;
        const videoId = getYouTubeId(configs.musicUrl);
        if (!videoId) return;

        if (ytPlayer && typeof ytPlayer.destroy === 'function') {
            ytPlayer.destroy();
        }

        ytPlayer = new YT.Player('yt-player', {
            height: '0',
            width: '0',
            videoId: videoId,
            playerVars: {
                'autoplay': 1,
                'loop': 1,
                'playlist': videoId,
                'controls': 0,
                'showinfo': 0,
                'rel': 0,
                'modestbranding': 1
            },
            events: {
                'onReady': (event) => {
                    const preloader = document.getElementById("preloader");
                    if (preloader && preloader.classList.contains("fade-out")) {
                        event.target.playVideo();
                        if (musicContainer) musicContainer.classList.add("playing");
                        const tooltip = document.querySelector(".music-tooltip");
                        if (tooltip) tooltip.innerText = "Pause Music";
                    } else if (!preloader) {
                        // Fallback click on body if no welcome screen
                        const autoPlayOnInteract = () => {
                            event.target.playVideo();
                            if (musicContainer) musicContainer.classList.add("playing");
                            const tooltip = document.querySelector(".music-tooltip");
                            if (tooltip) tooltip.innerText = "Pause Music";
                            document.body.removeEventListener("click", autoPlayOnInteract);
                            document.body.removeEventListener("touchstart", autoPlayOnInteract);
                        };
                        document.body.addEventListener("click", autoPlayOnInteract);
                        document.body.addEventListener("touchstart", autoPlayOnInteract);
                    }
                },
                'onStateChange': (event) => {
                    if (event.data === YT.PlayerState.PLAYING) {
                        musicContainer.classList.add("playing");
                        document.querySelector(".music-tooltip").innerText = "Pause Music";
                    } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
                        musicContainer.classList.remove("playing");
                        document.querySelector(".music-tooltip").innerText = "Play Music";
                    }
                }
            }
        });
    }

    if (musicToggle) {
        musicToggle.addEventListener("click", () => {
            if (ytPlayer && typeof ytPlayer.getPlayerState === 'function') {
                const state = ytPlayer.getPlayerState();
                if (state === YT.PlayerState.PLAYING) {
                    ytPlayer.pauseVideo();
                } else {
                    ytPlayer.playVideo();
                }
            } else {
                initYouTubePlayer();
            }
        });
    }

    // ---------------------------------------------------------
    // 5. STICKY / SCROLLING NAV
    // ---------------------------------------------------------
    const header = document.getElementById("desktop-nav");
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll("section");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }

        // Highlight nav menu items on scroll
        let currentSection = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 150)) {
                currentSection = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${currentSection}`) {
                link.classList.add("active");
            }
        });
    });

    // ---------------------------------------------------------
    // 6. MOBILE NAVIGATION OVERLAY
    // ---------------------------------------------------------
    const mobileMenuTrigger = document.getElementById("mobile-menu-trigger");
    const mobileNavOverlay = document.getElementById("mobile-nav-overlay");
    const mobileLinks = document.querySelectorAll(".mobile-nav-link");

    if (mobileMenuTrigger) {
        mobileMenuTrigger.addEventListener("click", () => {
            mobileMenuTrigger.classList.toggle("open");
            mobileNavOverlay.classList.toggle("open");
        });
    }

    mobileLinks.forEach(link => {
        link.addEventListener("click", () => {
            mobileMenuTrigger.classList.remove("open");
            mobileNavOverlay.classList.remove("open");
        });
    });

    // ---------------------------------------------------------
    // 7. COUNTDOWN TIMER CALCULATOR
    // ---------------------------------------------------------

    function initCountdown() {
        if (countdownInterval) clearInterval(countdownInterval);

        const daysEl = document.getElementById("days");
        const hoursEl = document.getElementById("hours");
        const minutesEl = document.getElementById("minutes");
        const secondsEl = document.getElementById("seconds");

        if (!daysEl) return;

        // Parse date values from inputs
        const targetMonth = getMonthNumber(configs.monthYear);
        const targetYear = getYear(configs.monthYear);
        const targetDay = configs.dayNum.padStart(2, '0');
        
        // Target: Year-Month-DayT17:00:00 (5:00 PM local time)
        const targetDateString = `${targetYear}-${targetMonth}-${targetDay}T17:00:00`;
        const targetDate = new Date(targetDateString).getTime();

        function updateCountdown() {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                clearInterval(countdownInterval);
                document.querySelector(".countdown-description").innerHTML = "❤️ The Wedding Celebrations have commenced! ❤️";
                document.getElementById("countdown-timer").style.display = "none";
                return;
            }

            // Calculations
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Output values
            daysEl.innerText = days.toString().padStart(2, "0");
            hoursEl.innerText = hours.toString().padStart(2, "0");
            minutesEl.innerText = minutes.toString().padStart(2, "0");
            secondsEl.innerText = seconds.toString().padStart(2, "0");
        }

        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);
    }

    // ---------------------------------------------------------
    // 8. FALLING LAVENDER PETALS PARTICLE SYSTEM
    // ---------------------------------------------------------
    function startPetalRain() {
        const petalContainer = document.getElementById("petal-container");
        if (!petalContainer) return;

        const maxPetals = 40;
        const petalColors = [
            "linear-gradient(135deg, rgba(232, 223, 245, 0.7) 0%, rgba(157, 132, 183, 0.5) 100%)", // Light Lavender
            "linear-gradient(135deg, rgba(210, 190, 235, 0.7) 0%, rgba(135, 108, 163, 0.5) 100%)", // Medium Lilac
            "linear-gradient(135deg, rgba(247, 243, 252, 0.8) 0%, rgba(180, 158, 204, 0.4) 100%)"  // Soft White Lavender
        ];

        function createPetal() {
            if (petalContainer.children.length >= maxPetals) return;

            const petal = document.createElement("div");
            petal.className = "lavender-petal";

            // Random properties
            const width = Math.random() * 12 + 6;
            const height = width * (Math.random() * 0.8 + 1.2);
            const startLeft = Math.random() * 100;
            const animationDuration = Math.random() * 6 + 6;
            const delay = Math.random() * 5;
            const randomColor = petalColors[Math.floor(Math.random() * petalColors.length)];

            // Styles
            petal.style.width = `${width}px`;
            petal.style.height = `${height}px`;
            petal.style.left = `${startLeft}%`;
            petal.style.top = `-20px`;
            petal.style.background = randomColor;
            petal.style.opacity = Math.random() * 0.7 + 0.3;

            // Animate using CSS keyframes dynamically injected
            const randomRotate = Math.random() * 360;
            petal.style.transform = `rotate(${randomRotate}deg)`;

            petalContainer.appendChild(petal);

            // Animate positions with Javascript loop
            let posY = -20;
            let posX = startLeft;
            const speedY = Math.random() * 1.5 + 1;
            const speedX = Math.sin(Math.random() * 3.14) * 0.5;
            let spin = randomRotate;
            const spinSpeed = Math.random() * 2 - 1;

            const petalFall = setInterval(() => {
                posY += speedY;
                posX += Math.sin(posY / 30) * 0.3 + speedX;
                spin += spinSpeed;

                petal.style.top = `${posY}px`;
                petal.style.left = `${posX}%`;
                petal.style.transform = `rotate(${spin}deg)`;

                // Remove when hits bottom
                if (posY > window.innerHeight + 20 || posX < -10 || posX > 110) {
                    clearInterval(petalFall);
                    petal.remove();
                }
            }, 20);
        }

        // Spawn interval
        setInterval(createPetal, 400);
    }

    // ---------------------------------------------------------
    // 9. RSVP FORM SUBMISSION ENGINE
    // ---------------------------------------------------------
    const rsvpForm = document.getElementById("wedding-rsvp-form");
    const attendingRadios = document.getElementsByName("attending");
    const attendingDetails = document.querySelectorAll(".attending-details");

    // Toggle fields based on attending status
    if (attendingRadios.length) {
        attendingRadios.forEach(radio => {
            radio.addEventListener("change", (e) => {
                // Style parent wrapper
                document.querySelectorAll(".option-label").forEach(lbl => lbl.classList.remove("active"));
                e.target.closest(".option-label").classList.add("active");

                if (e.target.value === "yes") {
                    attendingDetails.forEach(el => el.classList.remove("hidden"));
                } else {
                    attendingDetails.forEach(el => el.classList.add("hidden"));
                }
            });
        });
    }

    // Toggle diet wrapper styling
    const dietRadios = document.getElementsByName("diet");
    if (dietRadios.length) {
        dietRadios.forEach(radio => {
            radio.addEventListener("change", (e) => {
                document.querySelectorAll(".diet-label").forEach(lbl => lbl.classList.remove("active"));
                e.target.closest(".diet-label").classList.add("active");
            });
        });
    }

    if (rsvpForm) {
        rsvpForm.addEventListener("submit", (e) => {
            e.preventDefault();

            // Collect form data
            const formData = new FormData(rsvpForm);
            const rsvpData = {
                guestName: formData.get("guestName"),
                guestContact: formData.get("guestContact"),
                attending: formData.get("attending"),
                guestCount: formData.get("attending") === "yes" ? formData.get("guestCount") : "0",
                diet: formData.get("attending") === "yes" ? formData.get("diet") : "n/a",
                guestMessage: formData.get("guestMessage")
            };

            // Save to array
            rsvps.push(rsvpData);
            localStorage.setItem("wedding_rsvp_list", JSON.stringify(rsvps));

            // Optional Google Sheet Integration
            if (configs.googleSheetUrl && configs.googleSheetUrl.trim() !== "") {
                fetch(configs.googleSheetUrl, {
                    method: "POST",
                    mode: "no-cors",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(rsvpData)
                }).then(() => {
                    console.log("RSVP submitted to Google Sheet successfully!");
                }).catch(err => {
                    console.error("Error submitting to Google Sheet: ", err);
                });
            }

            // Show custom alert toast
            showSweetToast(rsvpData.attending === "yes");

            // Reset form
            rsvpForm.reset();
            // Re-apply styles/classes
            document.querySelectorAll(".option-label").forEach(lbl => lbl.classList.remove("active"));
            document.querySelector('.option-label input[value="yes"]').closest(".option-label").classList.add("active");
            document.querySelectorAll(".diet-label").forEach(lbl => lbl.classList.remove("active"));
            document.querySelector('.diet-label input[value="non-veg"]').closest(".diet-label").classList.add("active");
            attendingDetails.forEach(el => el.classList.remove("hidden"));

            // Refresh lists & statistics
            renderWishesWall();
            renderAdminDashboard();
        });
    }

    function showSweetToast(isAttending) {
        const toast = document.createElement("div");
        toast.style.position = "fixed";
        toast.style.bottom = "20px";
        toast.style.left = "50%";
        toast.style.transform = "translateX(-50%) translateY(100px)";
        toast.style.background = "#583F72";
        toast.style.color = "#FFF";
        toast.style.padding = "1rem 2rem";
        toast.style.borderRadius = "30px";
        toast.style.border = "1px solid #C5A880";
        toast.style.boxShadow = "0 10px 30px rgba(0,0,0,0.3)";
        toast.style.fontFamily = "'Montserrat', sans-serif";
        toast.style.fontSize = "0.9rem";
        toast.style.letterSpacing = "1px";
        toast.style.zIndex = "100000";
        toast.style.transition = "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        toast.style.textAlign = "center";
        
        toast.innerHTML = isAttending
            ? "✨ Thank you! We are thrilled to celebrate with you! ❤️"
            : "🕊️ Thank you for letting us know. You will be missed! ❤️";

        document.body.appendChild(toast);

        // Slide up
        setTimeout(() => {
            toast.style.transform = "translateX(-50%) translateY(0)";
        }, 100);

        // Remove
        setTimeout(() => {
            toast.style.transform = "translateX(-50%) translateY(100px)";
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    }

    // ---------------------------------------------------------
    // 10. GUESTBOOK TIMELINE WALL RENDERER
    // ---------------------------------------------------------
    function renderWishesWall() {
        const wall = document.getElementById("wishes-wall");
        if (!wall) return;

        // Filter RSVPs that contain wishing messages
        const messages = rsvps.filter(item => item.guestMessage && item.guestMessage.trim() !== "");

        if (messages.length === 0) {
            wall.innerHTML = `
                <div class="no-wishes-placeholder">
                    <i data-lucide="message-square" class="placeholder-icon"></i>
                    <p>No wishes yet. Be the first to leave a congratulatory message below!</p>
                </div>
            `;
            if (typeof lucide !== "undefined") lucide.createIcons();
            return;
        }

        // Render cards
        wall.innerHTML = messages.map(item => {
            const attendingBadge = item.attending === "yes" 
                ? `<span class="wish-attendance attending">Attending</span>`
                : `<span class="wish-attendance declining">Declined</span>`;

            return `
                <div class="wish-card">
                    <div class="wish-header">
                        <span class="wish-name">${sanitizeHTML(item.guestName)}</span>
                        ${attendingBadge}
                    </div>
                    <p class="wish-text">"${sanitizeHTML(item.guestMessage)}"</p>
                </div>
            `;
        }).join("");
    }

    // Sanitize user inputs to prevent XSS
    function sanitizeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    renderWishesWall();

    // ---------------------------------------------------------
    // 11. ADD TO CALENDAR (.ICS EVENT BUILDER)
    // ---------------------------------------------------------
    const addCalendarBtn = document.getElementById("btn-add-calendar");
    if (addCalendarBtn) {
        addCalendarBtn.addEventListener("click", () => {
            const targetMonth = getMonthNumber(configs.monthYear);
            const targetYear = getYear(configs.monthYear);
            const targetDay = configs.dayNum.padStart(2, '0');

            // Format date for ICS: YYYYMMDDTHHMMSS
            // Wedding starts at 5:00 PM (17:00) and ends at 10:00 PM (22:00)
            const startDate = `${targetYear}${targetMonth}${targetDay}T170000`;
            const endDate = `${targetYear}${targetMonth}${targetDay}T220000`;

            const title = "Wedding celebration of Chamod & Sisara";
            const description = "You are cordially invited to celebrate the union of Chamod and Sisara. See you there!";
            const location = `${configs.venueDetail}, ${configs.hotelDetail}`;

            const icsContent = [
                "BEGIN:VCALENDAR",
                "VERSION:2.0",
                "PRODID:-//Chamod Sisara Wedding//e-Invitation//EN",
                "BEGIN:VEVENT",
                `UID:wedding-${targetYear}${targetMonth}${targetDay}@chamodsisara.com`,
                `DTSTAMP:${startDate}Z`,
                `DTSTART;TZID=Asia/Colombo:${startDate}`,
                `DTEND;TZID=Asia/Colombo:${endDate}`,
                `SUMMARY:${title}`,
                `DESCRIPTION:${description}`,
                `LOCATION:${location}`,
                "END:VEVENT",
                "END:VCALENDAR"
            ].join("\r\n");

            const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.setAttribute("download", "chamod-sisara-wedding.ics");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // ---------------------------------------------------------
    // 12. ADMIN DASHBOARD CONTROL
    // ---------------------------------------------------------
    const adminModal = document.getElementById("admin-modal");
    const openAdminBtn = document.getElementById("admin-entrance-btn");
    const closeAdminBtn = document.getElementById("btn-close-admin");
    const navCrestTrigger = document.getElementById("nav-crest-trigger");
    const footerCrestLogo = document.getElementById("footer-crest-logo");

    // Open admin panel trigger (Hidden developer options: double click logo OR footer button)
    const showAdminPanel = () => {
        const pass = prompt("Enter Administration Code:", "");
        if (pass === "admin" || pass === "1234") {
            adminModal.classList.add("open");
            renderAdminDashboard();
            loadCustomizerInputs();
        } else if (pass !== null) {
            alert("Invalid passcode!");
        }
    };

    // Admin triggers completely removed for production release to secure guest responses
    /*
    if (openAdminBtn) openAdminBtn.addEventListener("click", showAdminPanel);
    if (navCrestTrigger) navCrestTrigger.addEventListener("dblclick", showAdminPanel);
    if (footerCrestLogo) footerCrestLogo.addEventListener("dblclick", showAdminPanel);

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("admin") === "true") {
        setTimeout(() => {
            adminModal.classList.add("open");
            renderAdminDashboard();
            loadCustomizerInputs();
        }, 1000);
    }
    */

    if (closeAdminBtn) {
        closeAdminBtn.addEventListener("click", () => {
            adminModal.classList.remove("open");
        });
    }

    // Tab switcher logic
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabPanes = document.querySelectorAll(".tab-pane");

    tabBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            tabBtns.forEach(b => b.classList.remove("active"));
            tabPanes.forEach(p => p.classList.remove("active"));

            e.target.classList.add("active");
            const targetId = e.target.getAttribute("data-tab");
            document.getElementById(targetId).classList.add("active");
        });
    });

    // Render RSVP Statistics and Rows
    function renderAdminDashboard() {
        const totalRsvpEl = document.getElementById("stat-total-rsvp");
        const totalAttendingEl = document.getElementById("stat-total-attending");
        const vegCountEl = document.getElementById("stat-veg-count");
        const nonvegCountEl = document.getElementById("stat-nonveg-count");
        const rowsContainer = document.getElementById("admin-rsvp-rows");

        if (!rowsContainer) return;

        // Statistics
        const totalResponses = rsvps.length;
        let totalGuests = 0;
        let vegCount = 0;
        let nonvegCount = 0;

        rsvps.forEach(item => {
            if (item.attending === "yes") {
                const count = parseInt(item.guestCount) || 1;
                totalGuests += count;
                if (item.diet === "veg") {
                    vegCount += count;
                } else {
                    nonvegCount += count;
                }
            }
        });

        totalRsvpEl.innerText = totalResponses;
        totalAttendingEl.innerText = totalGuests;
        vegCountEl.innerText = vegCount;
        nonvegCountEl.innerText = nonvegCount;

        // Table Rows
        renderTableRows(rsvps);
    }

    function renderTableRows(items) {
        const rowsContainer = document.getElementById("admin-rsvp-rows");
        if (!rowsContainer) return;

        if (items.length === 0) {
            rowsContainer.innerHTML = `<tr><td colspan="7" class="text-center">No RSVPs recorded yet.</td></tr>`;
            return;
        }

        rowsContainer.innerHTML = items.map((item, idx) => {
            const attendingTag = item.attending === "yes" 
                ? `<span style="color:#583F72; font-weight:600;">Yes</span>` 
                : `<span style="color:#b83350; font-weight:600;">No</span>`;
            
            const dietLabel = item.attending === "yes" 
                ? (item.diet === "veg" ? "Veg" : "Non-Veg") 
                : "-";

            return `
                <tr>
                    <td style="font-weight:600;">${sanitizeHTML(item.guestName)}</td>
                    <td>${sanitizeHTML(item.guestContact)}</td>
                    <td>${attendingTag}</td>
                    <td>${item.attending === "yes" ? item.guestCount : "0"}</td>
                    <td>${dietLabel}</td>
                    <td style="font-size:0.8rem; font-style:italic; max-width:200px;">${item.guestMessage ? sanitizeHTML(item.guestMessage) : "-"}</td>
                    <td>
                        <button class="btn-delete-row" data-index="${idx}" title="Delete Entry">
                            <i data-lucide="trash-2" style="width:16px;height:16px;"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join("");

        // Initialize Lucide icons inside rows
        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }

        // Add Delete event listeners
        const deleteButtons = rowsContainer.querySelectorAll(".btn-delete-row");
        deleteButtons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idx = parseInt(e.currentTarget.getAttribute("data-index"));
                if (confirm(`Are you sure you want to delete RSVP from ${rsvps[idx].guestName}?`)) {
                    rsvps.splice(idx, 1);
                    localStorage.setItem("wedding_rsvp_list", JSON.stringify(rsvps));
                    renderAdminDashboard();
                    renderWishesWall();
                }
            });
        });
    }

    // Search bar functionality
    const rsvpSearchInput = document.getElementById("admin-rsvp-search");
    if (rsvpSearchInput) {
        rsvpSearchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            const filtered = rsvps.filter(item => 
                item.guestName.toLowerCase().includes(query) || 
                item.guestContact.toLowerCase().includes(query) ||
                (item.guestMessage && item.guestMessage.toLowerCase().includes(query))
            );
            renderTableRows(filtered);
        });
    }

    // Clear All RSVPs button
    const clearRsvpsBtn = document.getElementById("btn-clear-rsvps");
    if (clearRsvpsBtn) {
        clearRsvpsBtn.addEventListener("click", () => {
            if (confirm("🚨 WARNING: Are you sure you want to delete ALL RSVPs? This action cannot be undone.")) {
                rsvps = [];
                localStorage.setItem("wedding_rsvp_list", JSON.stringify(rsvps));
                renderAdminDashboard();
                renderWishesWall();
            }
        });
    }

    // Export CSV
    const exportCsvBtn = document.getElementById("btn-export-csv");
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener("click", () => {
            if (rsvps.length === 0) {
                alert("No RSVPs to export.");
                return;
            }

            const csvHeaders = ["Guest Name", "Contact Details", "Attending?", "Guest Count", "Dietary Preference", "Congratulatory wishes"];
            const csvRows = [csvHeaders.join(",")];

            rsvps.forEach(item => {
                const row = [
                    `"${item.guestName.replace(/"/g, '""')}"`,
                    `"${item.guestContact.replace(/"/g, '""')}"`,
                    item.attending === "yes" ? "Yes" : "No",
                    item.attending === "yes" ? item.guestCount : "0",
                    item.attending === "yes" ? (item.diet === "veg" ? "Vegetarian" : "Non-Vegetarian") : "N/A",
                    `"${(item.guestMessage || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
                ];
                csvRows.push(row.join(","));
            });

            const csvString = csvRows.join("\n");
            const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.setAttribute("download", "wedding-rsvps-export.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // ---------------------------------------------------------
    // 13. LIVE CUSTOMIZER FORMS ENGINE
    // ---------------------------------------------------------
    const customizerForm = document.getElementById("admin-customizer-form");

    function loadCustomizerInputs() {
        if (!customizerForm) return;

        document.getElementById("admin-day-name").value = configs.dayName;
        document.getElementById("admin-day-num").value = configs.dayNum;
        document.getElementById("admin-month-year").value = configs.monthYear;
        document.getElementById("admin-wedding-time").value = configs.weddingTime;
        document.getElementById("admin-rsvp-deadline").value = configs.rsvpDeadline;
        document.getElementById("admin-phone-chamod").value = configs.phoneChamod;
        document.getElementById("admin-phone-sisara").value = configs.phoneSisara;
        document.getElementById("admin-music-url").value = configs.musicUrl;
        document.getElementById("admin-sheet-url").value = configs.googleSheetUrl || "";
        document.getElementById("admin-venue-hero").value = configs.venueHero;
        document.getElementById("admin-venue-detail").value = configs.venueDetail;
        document.getElementById("admin-hotel-detail").value = configs.hotelDetail;
        document.getElementById("admin-story-text").value = configs.storyText.replace(/<br>/g, "\n");
    }

    if (customizerForm) {
        customizerForm.addEventListener("submit", (e) => {
            e.preventDefault();

            // Retrieve input values
            configs.dayName = document.getElementById("admin-day-name").value;
            configs.dayNum = document.getElementById("admin-day-num").value;
            configs.monthYear = document.getElementById("admin-month-year").value;
            configs.weddingTime = document.getElementById("admin-wedding-time").value;
            configs.rsvpDeadline = document.getElementById("admin-rsvp-deadline").value;
            configs.phoneChamod = document.getElementById("admin-phone-chamod").value;
            configs.phoneSisara = document.getElementById("admin-phone-sisara").value;
            configs.musicUrl = document.getElementById("admin-music-url").value;
            configs.googleSheetUrl = document.getElementById("admin-sheet-url").value;
            configs.venueHero = document.getElementById("admin-venue-hero").value;
            configs.venueDetail = document.getElementById("admin-venue-detail").value;
            configs.hotelDetail = document.getElementById("admin-hotel-detail").value;
            configs.storyText = document.getElementById("admin-story-text").value.replace(/\n/g, "<br>");

            // Save to localStorage
            localStorage.setItem("wedding_invitation_configs", JSON.stringify(configs));

            // Apply configs to page DOM
            applyConfigs();

            // Alert success
            alert("Settings saved successfully! The webpage has been updated live in the background.");

            // Close modal
            adminModal.classList.remove("open");
        });
    }
});
