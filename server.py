from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__, static_folder='frontend', static_url_path='')
CORS(app)

# Load model and features once at startup
model = joblib.load("model.pkl")
features = joblib.load("features.pkl")

# Feature metadata — plain English for teachers and school admins
FEATURE_META = {
    "2nd_pass_ratio": {
        "label": "2nd Semester Pass Rate",
        "description": "Out of all subjects the student attempted in Semester 2, what fraction did they pass?",
        "help": "Enter a value between 0 and 1. For example, if they passed 4 out of 5 subjects, enter 0.80",
        "type": "range",
        "min": 0, "max": 1, "step": 0.01, "default": 0.8,
        "group": "semester2",
        "icon": "chart"
    },
    "1st_pass_ratio": {
        "label": "1st Semester Pass Rate",
        "description": "Out of all subjects the student attempted in Semester 1, what fraction did they pass?",
        "help": "Enter a value between 0 and 1. For example, if they passed 3 out of 5 subjects, enter 0.60",
        "type": "range",
        "min": 0, "max": 1, "step": 0.01, "default": 0.8,
        "group": "semester1",
        "icon": "chart"
    },
    "total_approved": {
        "label": "Total Subjects Passed (All Semesters)",
        "description": "How many subjects has the student successfully completed in total across all semesters so far?",
        "help": "A whole number, e.g. 12",
        "type": "number",
        "min": 0, "max": 50, "step": 1, "default": 10,
        "group": "overall",
        "icon": "check"
    },
    "Curricular units 2nd sem (approved)": {
        "label": "Subjects Passed in Semester 2",
        "description": "How many individual subjects did the student pass in their 2nd semester?",
        "help": "A whole number, e.g. 5",
        "type": "number",
        "min": 0, "max": 30, "step": 1, "default": 5,
        "group": "semester2",
        "icon": "book"
    },
    "Curricular units 1st sem (approved)": {
        "label": "Subjects Passed in Semester 1",
        "description": "How many individual subjects did the student pass in their 1st semester?",
        "help": "A whole number, e.g. 5",
        "type": "number",
        "min": 0, "max": 30, "step": 1, "default": 5,
        "group": "semester1",
        "icon": "book"
    },
    "Curricular units 2nd sem (grade)": {
        "label": "Average Grade in Semester 2",
        "description": "What was the student's average grade across all 2nd semester subjects? (Scale: 0 to 20)",
        "help": "A number between 0 and 20. 10 is the minimum passing grade, 14+ is good",
        "type": "number",
        "min": 0, "max": 20, "step": 0.1, "default": 12.0,
        "group": "semester2",
        "icon": "star"
    },
    "Curricular units 1st sem (grade)": {
        "label": "Average Grade in Semester 1",
        "description": "What was the student's average grade across all 1st semester subjects? (Scale: 0 to 20)",
        "help": "A number between 0 and 20. 10 is the minimum passing grade, 14+ is good",
        "type": "number",
        "min": 0, "max": 20, "step": 0.1, "default": 12.0,
        "group": "semester1",
        "icon": "star"
    },
    "Tuition fees up to date": {
        "label": "Are Tuition Fees Paid?",
        "description": "Has the student paid all their tuition fees on time?",
        "help": "Toggle ON if fees are fully paid, OFF if there are outstanding dues",
        "type": "toggle",
        "default": 1,
        "group": "personal",
        "icon": "wallet"
    },
    "Admission grade": {
        "label": "Admission Score",
        "description": "What score did the student receive when they were admitted to the institution?",
        "help": "A number between 0 and 200. Average is around 120",
        "type": "number",
        "min": 0, "max": 200, "step": 0.1, "default": 120.0,
        "group": "personal",
        "icon": "award"
    },
    "Age at enrollment": {
        "label": "Age When Student Enrolled",
        "description": "How old was the student (in years) when they first enrolled in the program?",
        "help": "Typical range: 17-25 years",
        "type": "number",
        "min": 15, "max": 80, "step": 1, "default": 20,
        "group": "personal",
        "icon": "user"
    },
}

GROUP_INFO = {
    "semester1": {
        "title": "Semester 1 Performance",
        "subtitle": "How did the student perform in their first semester?",
        "icon": "semester1"
    },
    "semester2": {
        "title": "Semester 2 Performance",
        "subtitle": "How did the student perform in their second semester?",
        "icon": "semester2"
    },
    "overall": {
        "title": "Overall Academic Progress",
        "subtitle": "The student's cumulative academic record",
        "icon": "overall"
    },
    "personal": {
        "title": "Student Background",
        "subtitle": "Personal and financial information about the student",
        "icon": "personal"
    },
}


def get_risk_factors(input_data):
    factors = []
    pr1 = input_data.get("1st_pass_ratio", 1)
    pr2 = input_data.get("2nd_pass_ratio", 1)
    g1 = input_data.get("Curricular units 1st sem (grade)", 20)
    g2 = input_data.get("Curricular units 2nd sem (grade)", 20)
    a1 = input_data.get("Curricular units 1st sem (approved)", 10)
    a2 = input_data.get("Curricular units 2nd sem (approved)", 10)
    tuition = input_data.get("Tuition fees up to date", 1)
    total_approved = input_data.get("total_approved", 10)
    age = input_data.get("Age at enrollment", 20)

    if pr1 < 0.5:
        factors.append({"text": "Student is failing more than half their Semester 1 subjects", "severity": "high",
                         "detail": f"Only passing {pr1:.0%} of attempted subjects"})
    elif pr1 < 0.7:
        factors.append({"text": "Semester 1 pass rate is below average", "severity": "medium",
                         "detail": f"Passing {pr1:.0%} of attempted subjects"})

    if pr2 < 0.5:
        factors.append({"text": "Student is failing more than half their Semester 2 subjects", "severity": "high",
                         "detail": f"Only passing {pr2:.0%} of attempted subjects"})
    elif pr2 < 0.7:
        factors.append({"text": "Semester 2 pass rate is below average", "severity": "medium",
                         "detail": f"Passing {pr2:.0%} of attempted subjects"})

    if g1 < 10:
        factors.append({"text": "Semester 1 grades are below the passing threshold", "severity": "high",
                         "detail": f"Average grade: {g1:.1f} out of 20 (passing is 10)"})
    if g2 < 10:
        factors.append({"text": "Semester 2 grades are below the passing threshold", "severity": "high",
                         "detail": f"Average grade: {g2:.1f} out of 20 (passing is 10)"})

    if a1 < 3:
        factors.append({"text": "Very few subjects completed in Semester 1", "severity": "high",
                         "detail": f"Only {a1} subjects passed"})
    if a2 < 3:
        factors.append({"text": "Very few subjects completed in Semester 2", "severity": "high",
                         "detail": f"Only {a2} subjects passed"})

    if total_approved < 5:
        factors.append({"text": "Overall subject completion is very low", "severity": "high",
                         "detail": f"Only {total_approved} subjects passed in total"})

    if tuition == 0:
        factors.append({"text": "Student has unpaid tuition fees", "severity": "medium",
                         "detail": "Outstanding financial obligations may indicate personal difficulties"})

    if age > 40:
        factors.append({"text": "Mature student may need flexible scheduling", "severity": "low",
                         "detail": f"Student was {age} years old at enrollment"})

    if not factors:
        factors.append({"text": "No significant risk factors detected", "severity": "none",
                         "detail": "This student's profile looks healthy overall"})
    return factors


def get_recommendations(prob):
    recs = []
    if prob < 0.3:
        recs.append({"text": "Continue regular academic monitoring", "icon": "clipboard", "priority": "routine"})
        recs.append({"text": "Encourage participation in extracurricular activities", "icon": "sparkle", "priority": "routine"})
    elif prob < 0.5:
        recs.append({"text": "Schedule a check-in meeting with the student", "icon": "calendar", "priority": "moderate"})
        recs.append({"text": "Monitor next semester's enrollment closely", "icon": "eye", "priority": "moderate"})
    elif prob < 0.7:
        recs.append({"text": "Assign an academic counselor to the student", "icon": "users", "priority": "important"})
        recs.append({"text": "Check if the student is facing financial difficulties", "icon": "wallet", "priority": "important"})
        recs.append({"text": "Connect the student with a peer tutoring program", "icon": "handshake", "priority": "important"})
    else:
        recs.append({"text": "Immediate intervention needed - this student is at high risk", "icon": "alert", "priority": "critical"})
        recs.append({"text": "Arrange an urgent meeting with the student and their advisor", "icon": "calendar", "priority": "critical"})
        recs.append({"text": "Provide intensive academic tutoring and mentorship", "icon": "book", "priority": "critical"})
        recs.append({"text": "Investigate and address any personal or financial barriers", "icon": "shield", "priority": "critical"})
    return recs


# ─── Routes ──────────────────────────────────────────────────────────

@app.route('/')
def serve_index():
    return send_from_directory('frontend', 'index.html')


@app.route('/api/features', methods=['GET'])
def get_features():
    ordered = []
    for f in features:
        meta = FEATURE_META.get(f, {
            "label": f, "description": "", "help": "",
            "type": "number", "min": 0, "max": 200, "step": 1, "default": 0,
            "group": "other", "icon": "circle"
        })
        ordered.append({"name": f, **meta})
    return jsonify({"features": ordered, "groups": GROUP_INFO})


@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    try:
        values = [float(data.get(f, 0)) for f in features]
        arr = np.array([values])
        prob = float(model.predict_proba(arr)[0][1])

        if prob < 0.4:
            risk_level = "low"
        elif prob < 0.7:
            risk_level = "medium"
        else:
            risk_level = "high"

        return jsonify({
            "probability": round(prob, 4),
            "percentage": round(prob * 100, 2),
            "riskLevel": risk_level,
            "riskFactors": get_risk_factors(data),
            "recommendations": get_recommendations(prob),
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    print("\n  >>  Student Risk Monitor running at http://localhost:5000\n")
    app.run(debug=True, port=5000)
