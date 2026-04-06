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

# Feature metadata for the frontend form
FEATURE_META = {
    "2nd_pass_ratio": {
        "label": "2nd Semester Pass Ratio",
        "type": "range",
        "min": 0, "max": 1, "step": 0.01, "default": 0.8,
        "group": "academic",
        "icon": "📊"
    },
    "1st_pass_ratio": {
        "label": "1st Semester Pass Ratio",
        "type": "range",
        "min": 0, "max": 1, "step": 0.01, "default": 0.8,
        "group": "academic",
        "icon": "📊"
    },
    "total_approved": {
        "label": "Total Approved Units",
        "type": "number",
        "min": 0, "max": 50, "step": 1, "default": 10,
        "group": "academic",
        "icon": "✅"
    },
    "Curricular units 2nd sem (approved)": {
        "label": "2nd Sem Approved Units",
        "type": "number",
        "min": 0, "max": 30, "step": 1, "default": 5,
        "group": "academic",
        "icon": "📝"
    },
    "Curricular units 1st sem (approved)": {
        "label": "1st Sem Approved Units",
        "type": "number",
        "min": 0, "max": 30, "step": 1, "default": 5,
        "group": "academic",
        "icon": "📝"
    },
    "Curricular units 2nd sem (grade)": {
        "label": "2nd Semester Grade",
        "type": "number",
        "min": 0, "max": 20, "step": 0.1, "default": 12.0,
        "group": "grades",
        "icon": "🎓"
    },
    "Curricular units 1st sem (grade)": {
        "label": "1st Semester Grade",
        "type": "number",
        "min": 0, "max": 20, "step": 0.1, "default": 12.0,
        "group": "grades",
        "icon": "🎓"
    },
    "Tuition fees up to date": {
        "label": "Tuition Fees Up to Date",
        "type": "toggle",
        "default": 1,
        "group": "financial",
        "icon": "💰"
    },
    "Admission grade": {
        "label": "Admission Grade",
        "type": "number",
        "min": 0, "max": 200, "step": 0.1, "default": 120.0,
        "group": "enrollment",
        "icon": "🏫"
    },
    "Age at enrollment": {
        "label": "Age at Enrollment",
        "type": "number",
        "min": 15, "max": 80, "step": 1, "default": 20,
        "group": "enrollment",
        "icon": "🧑"
    },
}


def get_risk_factors(input_data):
    """Analyze input data and return human-readable risk factors."""
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
        factors.append({
            "text": "Low 1st semester pass ratio",
            "severity": "high",
            "detail": f"Current: {pr1:.0%} — below the 50% threshold"
        })
    elif pr1 < 0.7:
        factors.append({
            "text": "Below-average 1st semester pass ratio",
            "severity": "medium",
            "detail": f"Current: {pr1:.0%} — room for improvement"
        })

    if pr2 < 0.5:
        factors.append({
            "text": "Low 2nd semester pass ratio",
            "severity": "high",
            "detail": f"Current: {pr2:.0%} — below the 50% threshold"
        })
    elif pr2 < 0.7:
        factors.append({
            "text": "Below-average 2nd semester pass ratio",
            "severity": "medium",
            "detail": f"Current: {pr2:.0%} — room for improvement"
        })

    if g1 < 10:
        factors.append({
            "text": "Low 1st semester grades",
            "severity": "high",
            "detail": f"Grade: {g1:.1f}/20"
        })
    if g2 < 10:
        factors.append({
            "text": "Low 2nd semester grades",
            "severity": "high",
            "detail": f"Grade: {g2:.1f}/20"
        })

    if a1 < 3:
        factors.append({
            "text": "Very few 1st semester approvals",
            "severity": "high",
            "detail": f"Only {a1} units approved"
        })
    if a2 < 3:
        factors.append({
            "text": "Very few 2nd semester approvals",
            "severity": "high",
            "detail": f"Only {a2} units approved"
        })

    if total_approved < 5:
        factors.append({
            "text": "Low total approved units",
            "severity": "high",
            "detail": f"Only {total_approved} total units approved"
        })

    if tuition == 0:
        factors.append({
            "text": "Tuition fees not up to date",
            "severity": "medium",
            "detail": "Outstanding financial obligations detected"
        })

    if age > 40:
        factors.append({
            "text": "Mature student — may need flexible scheduling",
            "severity": "low",
            "detail": f"Age at enrollment: {age}"
        })

    if not factors:
        factors.append({
            "text": "No significant risk factors detected",
            "severity": "none",
            "detail": "Student profile appears healthy"
        })

    return factors


def get_recommendations(prob):
    """Return actionable recommendations based on risk probability."""
    recs = []
    if prob < 0.3:
        recs.append({
            "text": "Continue regular academic monitoring",
            "icon": "✅",
            "priority": "routine"
        })
        recs.append({
            "text": "Encourage participation in extracurricular activities",
            "icon": "🎯",
            "priority": "routine"
        })
    elif prob < 0.5:
        recs.append({
            "text": "Schedule periodic check-ins with academic advisor",
            "icon": "📅",
            "priority": "moderate"
        })
        recs.append({
            "text": "Monitor upcoming semester enrollment closely",
            "icon": "👁️",
            "priority": "moderate"
        })
    elif prob < 0.7:
        recs.append({
            "text": "Provide targeted academic counseling and support",
            "icon": "🎓",
            "priority": "important"
        })
        recs.append({
            "text": "Investigate potential financial difficulties",
            "icon": "💰",
            "priority": "important"
        })
        recs.append({
            "text": "Connect student with peer tutoring programs",
            "icon": "🤝",
            "priority": "important"
        })
    else:
        recs.append({
            "text": "Immediate intervention required",
            "icon": "🚨",
            "priority": "critical"
        })
        recs.append({
            "text": "Schedule urgent meeting with student and academic advisor",
            "icon": "📋",
            "priority": "critical"
        })
        recs.append({
            "text": "Offer intensive tutoring and mentorship",
            "icon": "📚",
            "priority": "critical"
        })
        recs.append({
            "text": "Review and address any financial or personal barriers",
            "icon": "🛡️",
            "priority": "critical"
        })
    return recs


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.route('/')
def serve_index():
    return send_from_directory('frontend', 'index.html')


@app.route('/api/features', methods=['GET'])
def get_features():
    """Return ordered feature list with metadata for the frontend form."""
    ordered = []
    for f in features:
        meta = FEATURE_META.get(f, {
            "label": f,
            "type": "number",
            "min": 0, "max": 200, "step": 1, "default": 0,
            "group": "other",
            "icon": "📌"
        })
        ordered.append({"name": f, **meta})
    return jsonify(ordered)


@app.route('/api/predict', methods=['POST'])
def predict():
    """Accept feature values, return prediction + analysis."""
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
