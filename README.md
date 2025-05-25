# **TNS-ML-**  
<p style="text-align: center;">This repository contains the ml part of the project. It is currently in the alpha version, so functionality and performance may change significantly as development progresses.

It implements a full-fledged ML pipeline based on deep and ensemble modeling models. Developed ML solution for accurate determination of commercial electricity consumption: from the "smart" KNN-effect of secondary features and GRU-effect of time series to class balance and advanced Fourier series features. At the final stage, the CatBoost classifier with automatic hyperparameter selection ensures high accuracy and stability even on poorly labeled data.
</p>

---

### **Pipeline Overview**
1. **GRU TS Imputation (Torch):**
   - A compact bidirectional GRU network learns from historical monthly consumption data.
   - Predicts missing consumption values by capturing both seasonal patterns and long-term trends.
   - Trains quickly and remains robust on small datasets—ideal for local or rare-case scenarios.

2. **Advanced Feature Engineering:**
   - Generates time-based features such as:
     - `Fourier series` terms to model complex seasonal cycles;
     - Moving averages and trend coefficients (`linear, quadratic, cubic`).
   - Adds aggregates like mean summer consumption to spot period-specific anomalies.
   - Enhances model expressiveness and generalization by uncovering hidden patterns.

3. **Boosting Classifier:**
   - Hyperparameters are optimized via Optuna, with early stopping and balanced class weights.
   - Delivers high accuracy and stable performance with reasonable training and inference times.

### **Bonus Feature**
- Checks addresses through rental aggregators for daily rentals

Inupt:
| Address |
|--------------------------|
| Краснодарский край, г Геленджик, с Архипо-Осиповка, ул Ленина, д. 94  |
| Краснодарский край, р-н Анапский, c Витязево, ул Горького, д. 33  |
| Краснодарский край, р-н Анапский, с Супсех, ул Цветочная, д. 28  |

Output:
| Location | Source | Url |
|----------|---------------|---------|
| г Геленджик | Avito | https://www.avito.ru/maykop/kvartiry/2-k._kvartira... |
| c Витязево | Avito | https://www.avito.ru/maykop/kvartiry/2-k._kvartira... |
| с Супсех | Avito | https://www.avito.ru/maykop/kvartiry/2-k._kvartira... |

---

### **Technologies**
- FastALP: inference API with high throughput 
- SQLAlchemy: loads and persists tabular data from PostgreSQL
- PyTorch: implements and trains the bidirectional GRU for time-series imputation of missing consumption
- Catboost: prediction anomaly detection
- Optuna: for tuning boosting hyperparameters

---
