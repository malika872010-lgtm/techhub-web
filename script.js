document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    const STORAGE = {
        tasks: "techhub-tasks",
        schedule: "techhub-schedule",
        tickets: "techhub-tickets",
        profile: "techhub-academic-profile",
        device: "techhub-device",
        os: "techhub-os",
        language: "techhub-language",
        content: "techhub-content"
    };

    const readData = (key, fallback = []) => {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            return data ?? fallback;
        } catch {
            return fallback;
        }
    };

    const saveData = (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
    };

    const escapeHTML = (value) => {
        return String(value).replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char]);
    };

    const showMessage = (message) => {
        let notification = $("#techhub-notification");

        if (!notification) {
            notification = document.createElement("div");
            notification.id = "techhub-notification";
            notification.setAttribute("role", "status");

            Object.assign(notification.style, {
                position: "fixed",
                bottom: "25px",
                right: "25px",
                zIndex: "99999",
                background: "#24213b",
                color: "#fff",
                padding: "14px 20px",
                borderRadius: "12px",
                boxShadow: "0 5px 20px rgba(0,0,0,.15)",
                maxWidth: "320px",
                fontSize: "14px"
            });

            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.style.display = "block";

        clearTimeout(notification.timer);

        notification.timer = setTimeout(() => {
            notification.style.display = "none";
        }, 3000);
    };

    // Navigation

    function showPage(pageId) {
        const target = document.getElementById(pageId);

        if (!target) {
            showMessage("This page is not available.");
            return;
        }

        if (target.id === "about") {
            document.querySelector("#home")?.classList.add("active");

            setTimeout(() => {
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 50);

            return;
        }

        if (!target.classList.contains("page-section")) {
            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
            return;
        }

        $$(".page-section").forEach((section) => {
            section.classList.remove("active");
            section.setAttribute("aria-hidden", "true");
        });

        target.classList.add("active");
        target.setAttribute("aria-hidden", "false");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        history.replaceState(null, "", `#${pageId}`);
    }

    document.addEventListener("click", (event) => {
        const link = event.target.closest('a[href^="#"]');

        if (!link) return;

        const pageId = link.getAttribute("href").slice(1);

        if (!pageId) return;

        if (document.getElementById(pageId)) {
            event.preventDefault();
            showPage(pageId);
        }
    });

    window.addEventListener("popstate", () => {
        const pageId = location.hash.slice(1) || "home";
        showPage(pageId);
    });

    const initialPage = location.hash.slice(1);

    if (initialPage && document.getElementById(initialPage)) {
        showPage(initialPage);
    } else {
        showPage("home");
    }

    // Language

    const translations = {
        "Home": "الرئيسية",
        "About": "عن المنصة",
        "Student Hub": "بوابة الطالب",
        "TechFix": "الدعم التقني",
        "Log In": "تسجيل الدخول",
        "Get Started": "ابدأ الآن",
        "Study Schedule": "جدول المذاكرة",
        "Tasks": "المهام",
        "Learning Library": "المكتبة التعليمية",
        "YouTube Library": "مكتبة الفيديوهات",
        "Progress": "التقدم الدراسي",
        "Learning Analysis": "تحليل التعلم",
        "Technical Support": "الدعم التقني",
        "Support History": "سجل الدعم",
        "Profile": "الملف الشخصي",
        "Settings": "الإعدادات",
        "Save": "حفظ",
        "Add": "إضافة",
        "Search": "بحث",
        "Submit": "إرسال",
        "English": "الإنجليزية",
        "Arabic": "العربية"
    };

    const originalTexts = new Map();

    function translatePage(language) {
        const isArabic = language === "ar";

        document.documentElement.lang = language;
        document.documentElement.dir = isArabic ? "rtl" : "ltr";

        if (!originalTexts.size) {
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT
            );

            let node;

            while ((node = walker.nextNode())) {
                const text = node.nodeValue.trim();

                if (text) {
                    originalTexts.set(node, node.nodeValue);
                }
            }
        }

        originalTexts.forEach((original, node) => {
            if (!node.parentElement?.isConnected) return;

            const cleanText = original.trim();

            if (isArabic && translations[cleanText]) {
                node.nodeValue = original.replace(
                    cleanText,
                    translations[cleanText]
                );
            } else {
                node.nodeValue = original;
            }
        });

        const languageSelect = $("#settings-language");

        if (languageSelect) {
            languageSelect.value = language;
        }

        saveData(STORAGE.language, language);
    }

    const languageSelect = $("#settings-language");

    if (languageSelect) {
        languageSelect.addEventListener("change", (event) => {
            translatePage(event.target.value);
        });
    }

    const savedLanguage = readData(STORAGE.language, "en");
    translatePage(savedLanguage);

    // Academic Profile

    const stageSelect = $("#education-stage");
    const gradeSelect = $("#grade");
    const semesterSelect = $("#semester");

    const grades = {
        primary: [
            ["1", "Grade 1"],
            ["2", "Grade 2"],
            ["3", "Grade 3"],
            ["4", "Grade 4"],
            ["5", "Grade 5"],
            ["6", "Grade 6"]
        ],
        preparatory: [
            ["1", "Grade 1"],
            ["2", "Grade 2"],
            ["3", "Grade 3"]
        ],
        secondary: [
            ["1", "Grade 1"],
            ["2", "Grade 2"],
            ["3", "Grade 3"]
        ]
    };

    function updateGrades(selectedGrade = "") {
        if (!stageSelect || !gradeSelect) return;

        const stage = stageSelect.value;
        const availableGrades = grades[stage] || [];

        gradeSelect.innerHTML = '<option value="">Select Grade</option>';

        availableGrades.forEach(([value, label]) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = label;
            gradeSelect.appendChild(option);
        });

        if (selectedGrade) {
            gradeSelect.value = selectedGrade;
        }
    }

    stageSelect?.addEventListener("change", () => {
        updateGrades();
    });

    const academicForm = $("#academic-profile-form");

    const savedProfile = readData(STORAGE.profile, null);

    if (savedProfile && stageSelect && gradeSelect && semesterSelect) {
        stageSelect.value = savedProfile.stage || "";
        updateGrades(savedProfile.grade || "");
        semesterSelect.value = savedProfile.semester || "";
    }

    academicForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        const profile = {
            stage: stageSelect?.value || "",
            grade: gradeSelect?.value || "",
            semester: semesterSelect?.value || ""
        };

        if (!profile.stage || !profile.grade || !profile.semester) {
            showMessage("Please complete all academic profile fields.");
            return;
        }

        saveData(STORAGE.profile, profile);

        const result = $("#academic-profile-result");

        if (result) {
            result.textContent = "Your academic profile has been saved successfully.";
        }

        showMessage("Academic profile saved.");
    });

    // Tasks

    let tasks = readData(STORAGE.tasks);

    function renderTasks() {
        const list = $("#task-list");

        if (!list) return;

        list.innerHTML = "";

        if (!tasks.length) {
            list.textContent = "No tasks added yet.";
            updateProgress();
            return;
        }

        tasks.forEach((task) => {
            const item = document.createElement("li");

            item.className = task.completed ? "task completed" : "task";

            item.innerHTML = `
                <label>
                    <input type="checkbox" data-task-id="${task.id}"
                        ${task.completed ? "checked" : ""}>
                    <span>${escapeHTML(task.text)}</span>
                </label>
                <button type="button" data-delete-task="${task.id}">
                    Delete
                </button>
            `;

            list.appendChild(item);
        });

        updateProgress();
    }

    $("#task-form")?.addEventListener("submit", (event) => {
        event.preventDefault();

        const input = $("#task-input");
        const text = input?.value.trim();

        if (!text) {
            showMessage("Please enter a task.");
            return;
        }

        tasks.push({
            id: Date.now(),
            text,
            completed: false
        });

        saveData(STORAGE.tasks, tasks);
        renderTasks();

        input.value = "";
        showMessage("Task added successfully.");
    });

    $("#task-list")?.addEventListener("change", (event) => {
        const id = Number(event.target.dataset.taskId);

        if (!id) return;

        tasks = tasks.map((task) => {
            if (task.id === id) {
                task.completed = event.target.checked;
            }

            return task;
        });

        saveData(STORAGE.tasks, tasks);
        renderTasks();
    });

    $("#task-list")?.addEventListener("click", (event) => {
        const button = event.target.closest("[data-delete-task]");

        if (!button) return;

        const id = Number(button.dataset.deleteTask);

        tasks = tasks.filter((task) => task.id !== id);

        saveData(STORAGE.tasks, tasks);
        renderTasks();
    });

    // Study Schedule

    let schedule = readData(STORAGE.schedule);

    function renderSchedule() {
        const list = $("#schedule-list");

        if (!list) return;

        list.innerHTML = "";

        if (!schedule.length) {
            list.textContent = "Your schedule is empty.";
            return;
        }

        schedule
            .sort((a, b) => {
                return new Date(`${a.date}T${a.time}`) -
                    new Date(`${b.date}T${b.time}`);
            })
            .forEach((item) => {
                const element = document.createElement("li");

                element.innerHTML = `
                    <div>
                        <strong>${escapeHTML(item.subject)}</strong>
                        <p>${escapeHTML(item.date)} — ${escapeHTML(item.time)}</p>
                    </div>
                    <button type="button" data-delete-schedule="${item.id}">
                        Delete
                    </button>
                `;

                list.appendChild(element);
            });
    }

    $("#schedule-form")?.addEventListener("submit", (event) => {
        event.preventDefault();

        const subject = $("#schedule-subject")?.value.trim();
        const date = $("#schedule-date")?.value;
        const time = $("#schedule-time")?.value;

        if (!subject || !date || !time) {
            showMessage("Please complete all schedule fields.");
            return;
        }

        schedule.push({
            id: Date.now(),
            subject,
            date,
            time
        });

        saveData(STORAGE.schedule, schedule);
        renderSchedule();

        event.target.reset();

        showMessage("Study session added.");
    });

    $("#schedule-list")?.addEventListener("click", (event) => {
        const button = event.target.closest("[data-delete-schedule]");

        if (!button) return;

        const id = Number(button.dataset.deleteSchedule);

        schedule = schedule.filter((item) => item.id !== id);

        saveData(STORAGE.schedule, schedule);
        renderSchedule();
    });

    // Progress

    function updateProgress() {
        const container = $("#progress-content");

        if (!container) return;

        const total = tasks.length;
        const completed = tasks.filter((task) => task.completed).length;

        const percentage = total
            ? Math.round((completed / total) * 100)
            : 0;

        container.innerHTML = `
            <div class="progress-card">
                <h3>Tasks Completed</h3>
                <p>${completed} / ${total}</p>
                <div class="progress-track">
                    <div class="progress-bar" style="width:${percentage}%"></div>
                </div>
                <strong>${percentage}%</strong>
            </div>
        `;
    }

    // Learning Analysis

    function updateLearningAnalysis() {
        const container = $("#learning-analysis-content");

        if (!container) return;

        const total = tasks.length;
        const completed = tasks.filter((task) => task.completed).length;
        const remaining = total - completed;

        container.innerHTML = `
            <div class="analysis-card">
                <h3>Your Learning Overview</h3>
                <p>Total tasks: ${total}</p>
                <p>Completed tasks: ${completed}</p>
                <p>Remaining tasks: ${remaining}</p>
                <p>
                    ${
                        total === 0
                            ? "Add tasks to start tracking your learning progress."
                            : remaining === 0
                                ? "Great work! You have completed all your tasks."
                                : "Keep working through your remaining tasks."
                    }
                </p>
            </div>
        `;
    }

    // Device Selection

    let selectedDevice = readData(STORAGE.device, "");
    let selectedOS = readData(STORAGE.os, "");

    function updateSelection(selector, attribute, selectedValue) {
        $$(selector).forEach((option) => {
            const isSelected = option.dataset[attribute] === selectedValue;

            option.classList.toggle("selected", isSelected);
            option.setAttribute("aria-pressed", String(isSelected));
        });
    }

    updateSelection(".device-option", "device", selectedDevice);
    updateSelection(".os-option", "os", selectedOS);

    $$(".device-option").forEach((option) => {
        option.addEventListener("click", () => {
            selectedDevice = option.dataset.device;

            saveData(STORAGE.device, selectedDevice);
            updateSelection(".device-option", "device", selectedDevice);

            showMessage("Device selected.");
        });
    });

    $$(".os-option").forEach((option) => {
        option.addEventListener("click", () => {
            selectedOS = option.dataset.os;

            saveData(STORAGE.os, selectedOS);
            updateSelection(".os-option", "os", selectedOS);

            showMessage("Operating system selected.");
        });
    });

    // TechFix Diagnosis

    const diagnosisForm = $("#diagnosis-form");

    diagnosisForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        const description = $("#problem-description")?.value.trim();

        if (!selectedDevice) {
            showMessage("Please select your device first.");
            return;
        }

        if (!selectedOS) {
            showMessage("Please select your operating system.");
            return;
        }

        if (!description) {
            showMessage("Please describe your technical problem.");
            return;
        }

        const resultContainer = $("#diagnosis-results-content");

        if (!resultContainer) return;

        const text = description.toLowerCase();

        const possibleProblems = [];

        if (/slow|بطء|بطيء|تهنيج|hang|lag/.test(text)) {
            possibleProblems.push(
                "The device may have limited available memory or too many running applications."
            );
        }

        if (/internet|wifi|wi-fi|network|انترنت|إنترنت|واي فاي|شبكة/.test(text)) {
            possibleProblems.push(
                "The issue may be related to network settings or internet connectivity."
            );
        }

        if (/battery|charging|شحن|بطارية|البطارية/.test(text)) {
            possibleProblems.push(
                "The issue may be related to the charging cable, power adapter, or battery condition."
            );
        }

        if (/screen|display|شاشة|الشاشه|الشاشة/.test(text)) {
            possibleProblems.push(
                "The issue may be related to display settings or a hardware connection."
            );
        }

        if (/sound|audio|صوت|الصوت/.test(text)) {
            possibleProblems.push(
                "The issue may be related to audio settings or the sound output device."
            );
        }

        if (!possibleProblems.length) {
            possibleProblems.push(
                "More information is needed to identify the possible cause of this problem."
            );
        }

        resultContainer.innerHTML = `
            <div class="diagnosis-card">
                <h3>Preliminary Diagnosis</h3>
                <p><strong>Device:</strong> ${escapeHTML(selectedDevice)}</p>
                <p><strong>Operating System:</strong> ${escapeHTML(selectedOS)}</p>
                <p><strong>Problem:</strong> ${escapeHTML(description)}</p>
                <h4>Possible Causes</h4>
                <ul>
                    ${possibleProblems.map((problem) =>
                        `<li>${escapeHTML(problem)}</li>`
                    ).join("")}
                </ul>
                <p>
                    This is a preliminary suggestion, not a confirmed diagnosis.
                    A technical specialist may need to inspect the device.
                </p>
            </div>
        `;

        showPage("diagnosis-results");
    });

    // Support Tickets

    let tickets = readData(STORAGE.tickets);

    function renderTickets() {
        const container = $("#ticket-history");

        if (!container) return;

        container.innerHTML = "";

        if (!tickets.length) {
            container.textContent = "No support requests yet.";
            return;
        }

        tickets.forEach((ticket) => {
            const item = document.createElement("div");

            item.className = "ticket-card";

            item.innerHTML = `
                <h3>${escapeHTML(ticket.subject)}</h3>
                <p>${escapeHTML(ticket.description)}</p>
                <small>
                    ${escapeHTML(ticket.name)} —
                    ${escapeHTML(ticket.date)}
                </small>
                <p>Status: ${escapeHTML(ticket.status)}</p>
            `;

            container.appendChild(item);
        });
    }

    $("#ticket-form")?.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = $("#ticket-name")?.value.trim();
        const email = $("#ticket-email")?.value.trim();
        const subject = $("#ticket-subject")?.value.trim();
        const description = $("#ticket-description")?.value.trim();

        if (!name || !email || !subject || !description) {
            showMessage("Please complete all support request fields.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showMessage("Please enter a valid email address.");
            return;
        }

        tickets.push({
            id: Date.now(),
            name,
            email,
            subject,
            description,
            date: new Date().toLocaleDateString(),
            status: "Pending"
        });

        saveData(STORAGE.tickets, tickets);
        renderTickets();

        event.target.reset();

        showMessage("Support request saved successfully.");
    });

    // Library Search

    const bookSearchButton = $("#book-search-button");

    bookSearchButton?.addEventListener("click", () => {
        const query = $("#book-search")?.value.trim();

        if (!query) {
            showMessage("Enter a book title or subject.");
            return;
        }

        const url = `https://www.google.com/search?q=${encodeURIComponent(query + " educational books")}`;

        window.open(url, "_blank", "noopener,noreferrer");
    });

    // YouTube Search

    $("#youtube-search-form")?.addEventListener("submit", (event) => {
        event.preventDefault();

        const query = $("#youtube-search-input")?.value.trim();

        if (!query) {
            showMessage("Enter a video topic first.");
            return;
        }

        const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

        window.open(url, "_blank", "noopener,noreferrer");
    });

    // AI Chat Interface

    function setupChat(formSelector, inputSelector, chatSelector, portalName) {
        const form = $(formSelector);
        const input = $(inputSelector);
        const chat = $(chatSelector);

        if (!form || !input || !chat) return;

        form.addEventListener("submit", (event) => {
            event.preventDefault();

            const message = input.value.trim();

            if (!message) return;

            const userMessage = document.createElement("div");
            userMessage.className = "chat-message user-message";
            userMessage.textContent = message;

            const assistantMessage = document.createElement("div");
            assistantMessage.className = "chat-message assistant-message";
            assistantMessage.textContent =
                `${portalName} AI is not connected to an AI service yet. ` +
                "Your message has not been sent to an AI model.";

            chat.append(userMessage, assistantMessage);

            input.value = "";

            chat.scrollTop = chat.scrollHeight;
        });
    }

    setupChat(
        "#student-chat-form",
        "#student-chat-input",
        "#student-chat",
        "Student Hub"
    );

    setupChat(
        "#techfix-chat-form",
        "#techfix-chat-input",
        "#techfix-chat",
        "TechFix"
    );

    // Content Management Demo

    let contentItems = readData(STORAGE.content);

    function renderContent() {
        const container = $("#content-list");

        if (!container) return;

        container.innerHTML = "";

        contentItems.forEach((item) => {
            const element = document.createElement("div");

            element.className = "content-card";

            element.innerHTML = `
                <h3>${escapeHTML(item.title)}</h3>
                <p>${escapeHTML(item.description)}</p>
            `;

            container.appendChild(element);
        });
    }

    $("#content-form")?.addEventListener("submit", (event) => {
        event.preventDefault();

        const title = $("#content-title")?.value.trim();
        const description = $("#content-description")?.value.trim();

        if (!title || !description) {
            showMessage("Complete the content fields first.");
            return;
        }

        contentItems.push({
            title,
            description
        });

        saveData(STORAGE.content, contentItems);
        renderContent();

        event.target.reset();

        showMessage("Content added.");
    });

    // Profile

    function renderProfile() {
        const container = $("#profile-content");

        if (!container) return;

        const profile = readData(STORAGE.profile, null);

        if (!profile) {
            container.textContent = "Complete your academic profile to see your information.";
            return;
        }

        container.innerHTML = `
            <div class="profile-card">
                <p>Stage: ${escapeHTML(profile.stage)}</p>
                <p>Grade: ${escapeHTML(profile.grade)}</p>
                <p>Semester: ${escapeHTML(profile.semester)}</p>
            </div>
        `;
    }

    // Admin Statistics Demo

    function renderAdminStatistics() {
        const container = $("#admin-statistics");

        if (!container) return;

        container.innerHTML = `
            <div class="statistics-card">
                <p>Tasks: ${tasks.length}</p>
                <p>Schedule Sessions: ${schedule.length}</p>
                <p>Support Requests: ${tickets.length}</p>
                <p>Content Items: ${contentItems.length}</p>
            </div>
        `;
    }

    // Initial Rendering

    renderTasks();
    renderSchedule();
    renderTickets();
    renderContent();
    updateProgress();
    updateLearningAnalysis();
    renderProfile();
    renderAdminStatistics();
    });