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
            const json = await resp.json();
            allData = { grades: json.grades || [], courses: json.courses || [] };
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
    const exportObj = { ...allData };
    const dataStr = JSON.stringify(exportObj, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'courses-index.json';
    a.click();
    URL.revokeObjectURL(url);
    alert('索引已导出。注意：要完整迁移课件，请直接复制 courses/ 文件夹。');
}

function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (imported.grades && imported.courses) {
                allData = { grades: imported.grades, courses: imported.courses };
                saveData();
                alert('索引导入成功！注意：课件 HTML 文件需通过 courses/ 目录同步，请将课件文件放置到对应路径。');
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
    if (confirm('确定要重置所有数据吗？这将清除本地缓存并重新从 courses.json 加载。')) {
        localStorage.removeItem(STORAGE_KEY);
        allData = null;
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
    iframe.className = 'course-iframe';
    iframe.title = course.title;
    iframe.allowFullscreen = true;

    iframe.src = course.filePath;

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
            if (course) { course.title = title; course.grade = grade; course.subject = subject; saveData(); alert('课件信息修改成功（如需更新 HTML 文件，请直接替换 courses/ 目录下的文件后运行 generate.bat）'); }
            form.reset();
            delete form.dataset.editingId;
            document.getElementById('formTitle').textContent = '添加课件';
            document.getElementById('submitBtn').innerHTML = '<i class="fas fa-plus"></i> 添加课件';
            renderManageCourseList();
            return;
        }
        if (!files || !files.length) { alert('请选择HTML文件'); return; }
        const file = files[0];
        if (!file.name.toLowerCase().endsWith('.html') && !file.name.toLowerCase().endsWith('.htm')) {
            alert('请选择 .html 格式的课件文件');
            return;
        }
        // 生成课件文件夹名（用标题的拼音简写 + 时间戳）
        const folderName = title.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'courseware';
        const courseId = folderName + '-' + Date.now().toString(36);
        const meta = {
            title: title,
            subject: subject,
            createdAt: new Date().toISOString().split('T')[0]
        };
        const reader = new FileReader();
        reader.onload = (ev) => {
            const htmlContent = ev.target.result;
            // 使用 JSZip 生成 ZIP 包（需要引入 JSZip 库）
            const zipContent = createZipForCourse(folderName, htmlContent, meta);
            if (zipContent) {
                // 下载 ZIP 文件
                const blob = new Blob([zipContent], { type: 'application/zip' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = folderName + '.zip';
                a.click();
                URL.revokeObjectURL(url);
                // 在索引中添加记录
                allData.courses.push({
                    id: courseId,
                    title,
                    grade,
                    subject,
                    createdAt: meta.createdAt,
                    filePath: `courses/${grade}/${folderName}/index.html`
                });
                saveData();
                alert('✅ ZIP 包已下载！\n\n请按以下步骤操作：\n1. 解压 ' + folderName + '.zip\n2. 将解压出的 ' + folderName + ' 文件夹放到 courses/' + grade + '/ 目录下\n3. 双击运行 generate.bat 更新索引\n4. git add . && git commit && git push');
                form.reset();
                renderManageCourseList();
            }
        };
        reader.onerror = () => { alert('文件读取失败，请重试'); };
        reader.readAsText(file);
    });
}

// 生成包含 index.html + meta.json 的 ZIP 压缩包
function createZipForCourse(folderName, htmlContent, meta) {
    // 简单的 ZIP 生成（不依赖外部库）
    // ZIP 文件结构：
    // - [Local File Header 1] index.html [data]
    // - [Local File Header 2] meta.json [data]
    // - [Central Directory] entries
    // - [End of Central Directory]
    function crc32(data) {
        let crc = 0xFFFFFFFF;
        const table = [];
        for (let i = 0; i < 256; i++) {
            let c = i;
            for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
            table[i] = c;
        }
        for (let i = 0; i < data.length; i++) {
            crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
        }
        return (crc ^ 0xFFFFFFFF) >>> 0;
    }

    const encoder = new TextEncoder();
    const files = [
        { name: folderName + '/index.html', content: encoder.encode(htmlContent) },
        { name: folderName + '/meta.json', content: encoder.encode(JSON.stringify(meta, null, 2)) }
    ];

    const parts = [];
    const centralDir = [];
    let offset = 0;

    files.forEach(f => {
        const nameBytes = encoder.encode(f.name);
        const crc = crc32(f.content);
        const header = new Uint8Array(30 + nameBytes.length);
        const view = new DataView(header.buffer);
        view.setUint32(0, 0x04034b50, true);  // local file header signature
        view.setUint16(4, 20, true);           // version needed
        view.setUint16(6, 0x0800, true);       // general purpose bit flag (UTF-8)
        view.setUint16(8, 0, true);            // compression method (store)
        view.setUint16(10, 0, true);           // last mod time
        view.setUint16(12, 0, true);           // last mod date
        view.setUint32(14, crc, true);         // crc32
        view.setUint32(18, f.content.length, true);  // compressed size
        view.setUint32(22, f.content.length, true);  // uncompressed size
        view.setUint16(26, nameBytes.length, true);  // file name length
        view.setUint16(28, 0, true);           // extra field length
        header.set(nameBytes, 30);

        parts.push(header);
        parts.push(f.content);

        // central directory entry
        const cdEntry = new Uint8Array(46 + nameBytes.length);
        const cdView = new DataView(cdEntry.buffer);
        cdView.setUint32(0, 0x02014b50, true);
        cdView.setUint16(4, 20, true);
        cdView.setUint16(6, 20, true);
        cdView.setUint16(8, 0x0800, true);
        cdView.setUint16(10, 0, true);
        cdView.setUint16(12, 0, true);
        cdView.setUint32(16, crc, true);
        cdView.setUint32(20, f.content.length, true);
        cdView.setUint32(24, f.content.length, true);
        cdView.setUint16(28, nameBytes.length, true);
        cdView.setUint16(30, 0, true);
        cdView.setUint16(32, 0, true);
        cdView.setUint16(34, 0, true);
        cdView.setUint32(36, 0, true);
        cdView.setUint32(42, offset, true);
        cdEntry.set(nameBytes, 46);
        centralDir.push(cdEntry);

        offset += header.length + f.content.length;
    });

    const cdOffset = offset;
    centralDir.forEach(cd => { parts.push(cd); offset += cd.length; });

    const eocd = new Uint8Array(22);
    const eocdView = new DataView(eocd.buffer);
    eocdView.setUint32(0, 0x06054b50, true);
    eocdView.setUint16(4, 0, true);
    eocdView.setUint16(6, 0, true);
    eocdView.setUint16(8, files.length, true);
    eocdView.setUint16(10, files.length, true);
    eocdView.setUint32(12, offset - cdOffset, true);
    eocdView.setUint32(16, cdOffset, true);
    eocdView.setUint16(20, 0, true);
    parts.push(eocd);

    const totalLen = parts.reduce((s, p) => s + p.length, 0);
    const result = new Uint8Array(totalLen);
    let pos = 0;
    parts.forEach(p => { result.set(p, pos); pos += p.length; });
    return result;
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
    if (!confirm('确定要删除这个课件吗？（仅删除索引记录，不会删除 courses/ 下的实际文件）')) return;
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