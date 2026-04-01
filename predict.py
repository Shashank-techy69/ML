import joblib
import numpy as np

model = joblib.load("model.pkl")
features = joblib.load("features.pkl")

def predict_risk(input_dict):
    values = [input_dict[col] for col in features]
    arr = np.array([values])

    prob = model.predict_proba(arr)[0][1]
    return prob