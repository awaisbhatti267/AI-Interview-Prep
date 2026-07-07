const BASE_URL = 'http://127.0.0.1:5000/api'

const getToken = () => localStorage.getItem('token')

const headers = (isFormData = false) => {
    const h = {}
    const token = getToken()
    if (token) h['Authorization'] = `Bearer ${token}`
    if (!isFormData) h['Content-Type'] = 'application/json'
    return h
}

const handleResponse = async (res) => {
    const data = await res.json()
    if (!res.ok) {
        const err = new Error(data.message || 'Request failed')
        err.status = res.status
        throw err
    }
    return data
}

// ── Auth ──────────────────────────────────────────
export const authAPI = {
    register: (payload) =>
        fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify(payload)
        }).then(handleResponse),

    verifyOtp: (email, otp) =>
        fetch(`${BASE_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ email, otp })
        }).then(handleResponse),

    resendOtp: (email) =>
        fetch(`${BASE_URL}/auth/resend-otp`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ email })
        }).then(handleResponse),

    login: (payload) =>
        fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify(payload)
        }).then(handleResponse),

    me: () =>
        fetch(`${BASE_URL}/auth/me`, {
            headers: headers()
        }).then(handleResponse),
}

// ── Dashboard ─────────────────────────────────────
export const dashboardAPI = {
    getStats: () =>
        fetch(`${BASE_URL}/dashboard/`, {
            headers: headers()
        }).then(handleResponse),
}

// ── Resume ────────────────────────────────────────
export const resumeAPI = {
    upload: (formData) =>
        fetch(`${BASE_URL}/resume/upload`, {
            method: 'POST',
            headers: headers(true),
            body: formData
        }).then(handleResponse),

    get: () =>
        fetch(`${BASE_URL}/resume/`, {
            headers: headers()
        }).then(handleResponse),
}

// ── Interview ─────────────────────────────────────
export const interviewAPI = {
    start: (topic, num_questions = 10) =>
        fetch(`${BASE_URL}/interview/start`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ topic, num_questions })
        }).then(handleResponse),

    submitAnswer: (question_id, answer) =>
        fetch(`${BASE_URL}/interview/answer`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ question_id, answer })
        }).then(handleResponse),

    complete: (interview_id) =>
        fetch(`${BASE_URL}/interview/${interview_id}/complete`, {
            method: 'POST',
            headers: headers()
        }).then(handleResponse),

    get: (interview_id) =>
        fetch(`${BASE_URL}/interview/${interview_id}`, {
            headers: headers()
        }).then(handleResponse),

    history: () =>
        fetch(`${BASE_URL}/interview/history`, {
            headers: headers()
        }).then(handleResponse),

    performance: () =>
        fetch(`${BASE_URL}/interview/performance`, {
            headers: headers()
        }).then(handleResponse),

    weakTopics: (threshold = 65) =>
        fetch(`${BASE_URL}/interview/weak-topics?threshold=${threshold}`, {
            headers: headers()
        }).then(handleResponse),
}

// ── Bookmarks ─────────────────────────────────────
export const bookmarksAPI = {
    list: () =>
        fetch(`${BASE_URL}/bookmarks/`, {
            headers: headers()
        }).then(handleResponse),

    toggle: (question_id) =>
        fetch(`${BASE_URL}/bookmarks/toggle`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ question_id })
        }).then(handleResponse),
}
