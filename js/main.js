const STORAGE_KEY = 'html_courses_data';
const DATA_URL = 'data/courses.json';
const PASSWORD_KEY = 'html_courses_password';
const AUTH_KEY = 'html_courses_auth';
let allData = null;

const DEFAULT_DATA = {
    grades: [
        {id: "grade1", name: "一年级", description: "探索知识的起点"},
        {id: "grade2", name: "二年级", description: "夯实基础，稳步成长"},
        {id: "grade3", name: "三年级", description: "拓展视野，探索新知"},
        {id: "grade4", name: "四年级", description: "深化学习，提升能力"},
        {id: "grade5", name: "五年级", description: "知识积累，厚积薄发"},
        {id: "grade6", name: "六年级", description: "毕业前夕，整装待发"}
    ],
    courses: [
        {id: "sample1", title: "认识数字1-10", grade: "grade1", subject: "数学", createdAt: "2024-01-15", filePath: "courses/grade1/sample1/index.html"},
        {id: "sample2", title: "加法运算入门", grade: "grade2", subject: "数学", createdAt: "2024-01-16", filePath: "courses/grade2/sample2/index.html"},
        {id: "sample3", title: "乘法口诀表", grade: "grade3", subject: "数学", createdAt: "2024-01-17", filePath: "courses/grade3/sample3/index.html"},
        {id: "ai-intro", title: "初识人工智能", grade: "grade3", subject: "信息科技", createdAt: "2024-01-21", filePath: "courses/grade3/ai-intro/index.html"},
        {id: "sample4", title: "认识方向", grade: "grade4", subject: "数学", createdAt: "2024-01-18", filePath: "courses/grade4/sample4/index.html"},
        {id: "sample5", title: "三角形认识", grade: "grade5", subject: "数学", createdAt: "2024-01-19", filePath: "courses/grade5/sample5/index.html"},
        {id: "sample6", title: "圆的周长与面积", grade: "grade6", subject: "数学", createdAt: "2024-01-20", filePath: "courses/grade6/sample6/index.html"}
    ]
};

async function loadData() {
    if (allData) return allData;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            allData = JSON.parse(stored);
            return allData;
        } catch (e) { /* ignore */ }
    }

    try {
        const resp = await fetch(DATA_URL);
        if (resp.ok) {
            allData = await resp.json();
            saveData();
            return allData;
        }
    } catch (e) { /* offline fallback */ }

    allData = JSON.parse(JSON.stringify(DEFAULT_DATA));
    saveData();
    return allData;
}

function getGrades() { return allData?.grades || []; }
function getCourses() { return allData?.courses || []; }
function getCourseById(id) { return getCourses().find(c => c.id === id); }
function getGradeById(id) { return getGrades().find(g => g.id === id); }
function generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
        return true;
    } catch (error) {
        console.error('Failed to save data:', error);
        return false;
    }
}

function exportData() {
    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'courses.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (imported.grades && imported.courses) {
                allData = imported;
                saveData();
                alert('数据导入成功！');
                location.reload();
            } else {
                alert('数据格式不正确');
            }
        } catch (error) {
            alert('数据导入失败：' + error.message);
        }
    };
    reader.readAsText(file);
}

function resetData() {
    if (confirm('确定要重置所有数据吗？这将恢复默认数据。')) {
        localStorage.removeItem(STORAGE_KEY);
        allData = JSON.parse(JSON.stringify(DEFAULT_DATA));
        saveData();
        alert('数据已重置！');
        location.reload();
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function playCourse(id) {
    window.location.href = `player.html?id=${id}`;
}

function buildGradeCards(grades, courses) {
    return grades.map(grade => {
        const count = courses.filter(c => c.grade === grade.id).length;
        return `
            <div class="grade-card" data-grade="${grade.id}">
                <i class="fas fa-graduation-cap"></i>
                <h3>${grade.name}</h3>
                <p>${grade.description || '暂无描述'}</p>
                <span class="count">${count} 个课件</span>
            </div>
        `;
    }).join('');
}

function buildCourseCards(courses) {
    if (!courses.length) return '<div class="empty-state"><i class="fas fa-folder-open"></i><p>暂无课件</p></div>';
    const grades = getGrades();
    return courses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6).map(course => {
        const grade = grades.find(g => g.id === course.grade);
        return `
            <div class="course-card">
                <div class="course-thumbnail"><i class="fas fa-file-code"></i></div>
                <div class="course-info">
                    <h3>${course.title}</h3>
                    <div class="course-meta">
                        <span><i class="fas fa-graduation-cap"></i> ${grade?.name || '未知年级'}</span>
                        <span><i class="fas fa-calendar"></i> ${formatDate(course.createdAt)}</span>
                    </div>
                    <div class="course-actions">
                        <button class="btn btn-primary" onclick="playCourse('${course.id}')"><i class="fas fa-play"></i> 播放</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function bindGradeCardClicks() {
    document.querySelectorAll('.grade-card').forEach(card => {
        card.addEventListener('click', () => {
            window.location.href = `courses.html?grade=${card.dataset.grade}`;
        });
    });
}

async function initHomePage() {
    await loadData();
    const grades = getGrades(), courses = getCourses();
    const grid = document.getElementById('gradesGrid');
    if (grid) {
        grid.innerHTML = grades.length ? buildGradeCards(grades, courses) : '<p class="text-center">暂无年级数据</p>';
        bindGradeCardClicks();
    }
    const cGrid = document.getElementById('coursesGrid');
    if (cGrid) cGrid.innerHTML = buildCourseCards(courses);
}

async function initCoursesPage() {
    await loadData();
    const filter = document.getElementById('gradeFilter');
    const params = new URLSearchParams(window.location.search);
    const currentGrade = params.get('grade');
    const grades = getGrades();
    if (filter) {
        filter.innerHTML = '<option value="">全部年级</option>' + grades.map(g => `<option value="${g.id}" ${g.id === currentGrade ? 'selected' : ''}>${g.name}</option>`).join('');
    }
    const titleEl = document.querySelector('.current-grade');
    let courses;
    if (currentGrade && grades.some(g => g.id === currentGrade)) {
        const info = grades.find(g => g.id === currentGrade);
        if (titleEl) titleEl.textContent = info?.name || '全部课件';
        courses = getCourses().filter(c => c.grade === currentGrade);
    } else {
        if (titleEl) titleEl.textContent = '全部课件';
        courses = getCourses();
    }
    const grid = document.getElementById('coursesGrid');
    if (grid) grid.innerHTML = buildCourseCards(courses);
    if (filter) {
        filter.onchange = function() {
            window.location.href = this.value ? `courses.html?grade=${this.value}` : 'courses.html';
        };
    }
}

async function initPlayerPage() {
    await loadData();
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('id');
    const course = getCourseById(courseId);
    const grades = getGrades();

    if (!course) {
        const container = document.getElementById('playerContainer');
        if (container) container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>课件不存在或已被删除</p></div>';
        return;
    }

    const grade = grades.find(g => g.id === course.grade);
    const titleEl = document.querySelector('.course-title');
    const gradeEl = document.querySelector('.course-grade');
    if (titleEl) titleEl.textContent = course.title;
    if (gradeEl) gradeEl.textContent = grade?.name || '未知年级';

    const iframe = document.createElement('iframe');
    iframe.src = course.filePath;
    iframe.className = 'course-iframe';
    iframe.title = course.title;
    iframe.allowFullscreen = true;

    const contentEl = document.getElementById('courseContent');
    if (contentEl) {
        contentEl.appendChild(iframe);
        iframe.onload = () => {
            const loading = contentEl.querySelector('.loading-state');
            if (loading) loading.remove();
        };
    }

    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', async () => {
            const wrapper = document.querySelector('.player-wrapper');
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            } else if (wrapper) {
                await wrapper.requestFullscreen();
            }
        });
        document.addEventListener('fullscreenchange', () => {
            fullscreenBtn.innerHTML = document.fullscreenElement ? '<i class="fas fa-compress"></i>' : '<i class="fas fa-expand"></i>';
        });
    }
}

async function initManagePage() {
    await loadData();
    renderManageCourseList();
    renderGradeList();
    setupAddForm();
    setupGradeForm();
    setupImportExport();
}

function renderManageCourseList() {
    const tbody = document.getElementById('courseTableBody');
    if (!tbody) return;
    const courses = getCourses(), grades = getGrades();
    if (!courses.length) { tbody.innerHTML = '<tr><td colspan="5" class="text-center">暂无课件</td></tr>'; return; }
    tbody.innerHTML = courses.map(c => {
        const g = grades.find(gr => gr.id === c.grade);
        return `<tr>
            <td>${c.title}</td>
            <td>${g?.name || '未知年级'}</td>
            <td>${c.subject}</td>
            <td>${formatDate(c.createdAt)}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="editCourse('${c.id}')"><i class="fas fa-edit"></i> 编辑</button>
                <button class="btn btn-danger btn-sm" onclick="deleteCourse('${c.id}')"><i class="fas fa-trash"></i> 删除</button>
            </td>
        </tr>`;
    }).join('');
}

function renderGradeList() {
    const tbody = document.getElementById('gradeTableBody');
    if (!tbody) return;
    const grades = getGrades();
    if (!grades.length) { tbody.innerHTML = '<tr><td colspan="3" class="text-center">暂无年级</td></tr>'; return; }
    tbody.innerHTML = grades.map(g => `<tr>
        <td>${g.name}</td>
        <td>${g.description || '暂无描述'}</td>
        <td>
            <button class="btn btn-primary btn-sm" onclick="editGrade('${g.id}')"><i class="fas fa-edit"></i> 编辑</button>
            <button class="btn btn-danger btn-sm" onclick="deleteGrade('${g.id}')"><i class="fas fa-trash"></i> 删除</button>
        </td>
    </tr>`).join('');
}

function updateGradeSelect() {
    const grades = getGrades();
    document.querySelectorAll('select[data-grade-select]').forEach(select => {
        const val = select.value;
        select.innerHTML = '<option value="">请选择年级</option>' + grades.map(g => `<option value="${g.id}" ${g.id === val ? 'selected' : ''}>${g.name}</option>`).join('');
    });
}

function setupAddForm() {
    updateGradeSelect();
    const form = document.getElementById('addCourseForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('title')?.value;
        const grade = document.getElementById('grade')?.value;
        const subject = document.getElementById('subject')?.value;
        const files = document.getElementById('courseFile')?.files;
        if (!title || !grade || !subject) { alert('请填写完整信息'); return; }
        const editingId = form.dataset.editingId;
        if (editingId) {
            const course = getCourseById(editingId);
            if (course) { course.title = title; course.grade = grade; course.subject = subject; saveData(); alert('课件修改成功'); }
        } else {
            if (!files || !files.length) { alert('请选择文件'); return; }
            allData.courses.push({ id: generateId(), title, grade, subject, createdAt: new Date().toISOString().split('T')[0], filePath: `courses/${grade}/${generateId()}/index.html` });
            saveData();
            alert('课件添加成功');
        }
        form.reset();
        delete form.dataset.editingId;
        document.getElementById('formTitle').textContent = '添加课件';
        document.getElementById('submitBtn').innerHTML = '<i class="fas fa-plus"></i> 添加课件';
        renderManageCourseList();
    });
}

function setupGradeForm() {
    const form = document.getElementById('addGradeForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('gradeName')?.value;
        const desc = document.getElementById('gradeDescription')?.value;
        if (!name) { alert('请填写年级名称'); return; }
        const editingId = form.dataset.editingId;
        if (editingId) {
            const grade = getGradeById(editingId);
            if (grade) { grade.name = name; grade.description = desc || ''; saveData(); alert('年级修改成功'); }
            delete form.dataset.editingId;
            document.getElementById('gradeFormTitle').textContent = '添加年级';
            document.getElementById('gradeSubmitBtn').innerHTML = '<i class="fas fa-plus"></i> 添加年级';
        } else {
            allData.grades.push({ id: `grade${Date.now()}`, name, description: desc || '' });
            saveData();
            alert('年级添加成功');
        }
        form.reset();
        renderGradeList();
        updateGradeSelect();
    });
}

function setupImportExport() {
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');
    const resetBtn = document.getElementById('resetBtn');
    if (exportBtn) exportBtn.addEventListener('click', exportData);
    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => importFile.click());
        importFile.addEventListener('change', (e) => { if (e.target.files[0]) importData(e.target.files[0]); });
    }
    if (resetBtn) resetBtn.addEventListener('click', resetData);
}

function editCourse(id) {
    const course = getCourseById(id);
    if (!course) return;
    document.getElementById('title').value = course.title;
    document.getElementById('grade').value = course.grade;
    document.getElementById('subject').value = course.subject;
    document.getElementById('formTitle').textContent = '编辑课件';
    document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save"></i> 保存修改';
    document.getElementById('addCourseForm').dataset.editingId = id;
}

function deleteCourse(id) {
    if (!confirm('确定要删除这个课件吗？')) return;
    allData.courses = allData.courses.filter(c => c.id !== id);
    saveData();
    renderManageCourseList();
}

function editGrade(id) {
    const grade = getGradeById(id);
    if (!grade) return;
    document.getElementById('gradeName').value = grade.name;
    document.getElementById('gradeDescription').value = grade.description || '';
    document.getElementById('gradeFormTitle').textContent = '编辑年级';
    document.getElementById('gradeSubmitBtn').innerHTML = '<i class="fas fa-save"></i> 保存修改';
    document.getElementById('addGradeForm').dataset.editingId = id;
}

function deleteGrade(id) {
    if (getCourses().filter(c => c.grade === id).length > 0) { alert('该年级下还有课件，请先删除课件后再删除年级'); return; }
    if (!confirm('确定要删除这个年级吗？')) return;
    allData.grades = allData.grades.filter(g => g.id !== id);
    saveData();
    renderGradeList();
    updateGradeSelect();
}

function injectPasswordOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'passwordOverlay';
    overlay.innerHTML = `
        <style>
            #passwordOverlay { position:fixed; inset:0; z-index:99999; background:linear-gradient(135deg,#1e40af 0%,#3b82f6 100%); display:flex; align-items:center; justify-content:center; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
            #passwordOverlay .p-box { background:white; border-radius:16px; padding:40px; width:380px; max-width:90vw; box-shadow:0 20px 60px rgba(0,0,0,0.3); text-align:center; }
            #passwordOverlay .p-logo { font-size:3rem; color:#3b82f6; margin-bottom:12px; }
            #passwordOverlay h2 { font-size:1.5rem; color:#1e293b; margin:0 0 4px 0; }
            #passwordOverlay .p-desc { color:#64748b; font-size:0.9rem; margin-bottom:24px; }
            #passwordOverlay .p-input { width:100%; padding:14px 16px; border:2px solid #e2e8f0; border-radius:10px; font-size:1rem; transition:border-color 0.2s; box-sizing:border-box; }
            #passwordOverlay .p-input:focus { outline:none; border-color:#3b82f6; }
            #passwordOverlay .p-btn { width:100%; padding:14px; background:linear-gradient(135deg,#3b82f6 0%,#1e40af 100%); color:white; border:none; border-radius:10px; font-size:1rem; font-weight:600; cursor:pointer; margin-top:16px; transition:transform 0.2s; }
            #passwordOverlay .p-btn:hover { transform:translateY(-2px); }
            #passwordOverlay .p-err { color:#ef4444; font-size:0.85rem; margin-top:12px; display:none; }
            #passwordOverlay .p-set-hint { color:#94a3b8; font-size:0.8rem; margin-top:12px; }
        </style>
        <div class="p-box">
            <div class="p-logo">🔒</div>
            <h2 id="pTitle">设置密码</h2>
            <p class="p-desc" id="pDesc">首次使用，请设置访问密码</p>
            <input type="password" id="pInput" class="p-input" placeholder="请输入密码" autocomplete="off">
            <input type="password" id="pInput2" class="p-input" style="display:none;margin-top:12px" placeholder="再次输入密码" autocomplete="off">
            <button id="pBtn" class="p-btn">确认</button>
            <p class="p-err" id="pErr"></p>
            <p class="p-set-hint" id="pHint">关闭页面后需重新输入密码</p>
        </div>
    `;
    document.documentElement.style.overflow = 'hidden';
    document.body.appendChild(overlay);

    const hasPassword = localStorage.getItem(PASSWORD_KEY);

    if (hasPassword) {
        document.getElementById('pTitle').textContent = '输入密码';
        document.getElementById('pDesc').textContent = '请输入密码以访问课件库';
        document.getElementById('pInput').placeholder = '请输入密码';
        document.getElementById('pInput2').style.display = 'none';
        document.getElementById('pHint').textContent = '关闭页面后需重新输入密码';

        document.getElementById('pBtn').onclick = () => {
            const input = document.getElementById('pInput').value;
            if (btoa(input) === hasPassword) {
                sessionStorage.setItem(AUTH_KEY, '1');
                document.getElementById('passwordOverlay').remove();
                document.documentElement.style.overflow = '';
                initCurrentPage();
            } else {
                const err = document.getElementById('pErr');
                err.textContent = '密码错误，请重试';
                err.style.display = 'block';
                document.getElementById('pInput').value = '';
                document.getElementById('pInput').focus();
            }
        };
        document.getElementById('pInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') document.getElementById('pBtn').click();
        });
    } else {
        document.getElementById('pTitle').textContent = '设置密码';
        document.getElementById('pDesc').textContent = '首次使用，请设置访问密码';
        document.getElementById('pInput').placeholder = '请输入密码';
        document.getElementById('pInput2').style.display = 'block';
        document.getElementById('pInput2').placeholder = '再次输入密码';

        document.getElementById('pBtn').onclick = () => {
            const p1 = document.getElementById('pInput').value;
            const p2 = document.getElementById('pInput2').value;
            const err = document.getElementById('pErr');
            if (!p1) { err.textContent = '请输入密码'; err.style.display = 'block'; return; }
            if (p1.length < 4) { err.textContent = '密码长度至少4位'; err.style.display = 'block'; return; }
            if (p1 !== p2) { err.textContent = '两次密码不一致'; err.style.display = 'block'; return; }
            localStorage.setItem(PASSWORD_KEY, btoa(p1));
            sessionStorage.setItem(AUTH_KEY, '1');
            document.getElementById('passwordOverlay').remove();
            document.documentElement.style.overflow = '';
            initCurrentPage();
        };
        document.getElementById('pInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') document.getElementById('pBtn').click();
        });
        document.getElementById('pInput2').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') document.getElementById('pBtn').click();
        });
    }
}

function initCurrentPage() {
    const cls = document.body.classList;
    if (cls.contains('home-page')) initHomePage();
    else if (cls.contains('courses-page')) initCoursesPage();
    else if (cls.contains('player-page')) initPlayerPage();
    else if (cls.contains('manage-page')) initManagePage();
}

document.addEventListener('DOMContentLoaded', () => {
    const authed = sessionStorage.getItem(AUTH_KEY);
    if (authed) {
        initCurrentPage();
    } else {
        injectPasswordOverlay();
    }
});