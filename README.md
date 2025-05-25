# **TNS-ML-**  
<p style="text-align: center;">This repository contains the ml part of the project. It is currently in the alpha version, so functionality and performance may change significantly as development progresses.

It implements a full-fledged ML pipeline based on deep and ensemble modeling models. Developed ML solution for accurate determination of commercial electricity consumption: from the "smart" KNN-effect of secondary features and GRU-effect of time series to class balance and advanced Fourier series features. At the final stage, the CatBoost classifier with automatic hyperparameter selection ensures high accuracy and stability even on poorly labeled data.
</p>

---

### **Technologies**
- FastALP: inference API with high throughput 
- SQLAlchemy: loads and persists tabular data from PostgreSQL
- PyTorch: implements and trains the bidirectional GRU for time-series imputation of missing consumption
- Catboost: prediction anomaly detection
- Optuna: for tuning boosting hyperparameters

---
