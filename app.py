import streamlit as st
import joblib
from predict import predict_risk

# Load feature names
features = joblib.load("features.pkl")

def get_explanation(input_data):
    reasons = []

    # Generic but meaningful rules
    for key, value in input_data.items():
        
        if "pass_ratio" in key and value < 0.5:
            reasons.append("Low pass ratio")

        if "grade" in key and value < 10:
            reasons.append("Low academic performance")

        if "approved" in key and value < 5:
            reasons.append("Low subject approval count")

        if "debtor" in key and value == 1:
            reasons.append("Financial dues pending")

    return reasons

def get_recommendation(prob):
    recs = []
    if prob < 0.4:
        recs.append("Monitor student's progress periodically.")
    elif prob < 0.7:
        recs.append("Provide academic counseling and support.")
        recs.append("Check for any financial difficulties.")
    else:
        recs.append("Immediate intervention required.")
        recs.append("Schedule a meeting with the student and academic advisor.")
        recs.append("Offer intensive tutoring and support services.")
    return recs

st.title("Student Risk Monitoring System")

st.header("Enter Student Details")

# Define feature types based on your dataset
binary_features = [
    'Displaced', 'Educational special needs', 'Debtor',
    'Tuition fees up to date', 'Gender', 'Scholarship holder', 'International'
]

categorical_features = [
    'Marital status', 'Previous qualification', "Mother's qualification",
    "Father's qualification", "Mother's occupation", "Father's occupation"
]

input_data = {}

# Create columns for a cleaner layout
col1, col2 = st.columns(2)

# Loop through the features and create appropriate UI elements
for idx, feature in enumerate(features):
    # Alternate between columns for a balanced look
    with col1 if idx % 2 == 0 else col2:
        if feature in binary_features:
            # Use a selectbox for 0/1 values to make it user-friendly
            val = st.selectbox(
                label=feature,
                options=[0, 1],
                format_func=lambda x: "1 (Yes/Male)" if x == 1 else "0 (No/Female)"
            )
            input_data[feature] = val

        elif feature in categorical_features:
            # Use a number input with step=1 for categorical integer codes
            val = st.number_input(label=feature, min_value=0, step=1, value=1)
            input_data[feature] = val

        elif 'grade' in feature.lower():
            # Grades usually have a specific range and are floats
            val = st.number_input(label=feature, min_value=0.0, max_value=200.0, value=120.0, step=0.1)
            input_data[feature] = val

        elif feature == 'Age at enrollment':
            # Age makes sense as a slider or integer input
            val = st.slider(label=feature, min_value=15, max_value=80, value=20)
            input_data[feature] = val

        else:
            # Fallback for Curricular units and other features
            val = st.number_input(label=feature, value=0.0)
            input_data[feature] = val
# Predict button
if st.button("Predict Risk"):
    
    prob = predict_risk(input_data)

    st.subheader(f"Dropout Risk: {round(prob*100,2)}%")

    # Risk category
    if prob < 0.4:
        st.success("Low Risk")
    elif prob < 0.7:
        st.warning("Medium Risk")
    else:
        st.error("High Risk")
    
    st.subheader("Key Risk Factors")
    reasons = get_explanation(input_data)
    if reasons:
        for r in reasons:
            st.write("-", r)
    else:
        st.write("No major risk factors detected")
        
    st.subheader("Recommendations")
    recs = get_recommendation(prob)

    for r in recs:
        st.write("-", r)