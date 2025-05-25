import json
import optuna
import numpy as np
import pandas as pd
from catboost import CatBoostClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import balanced_accuracy_score


class CatboostSimple:
    """МОДЕЛЬ CATBOOST С ТЮНИНГОМ ДЛЯ РАНЖИРОВАНИЯ КАНДИДАТОВ"""

    def __init__(self, df: pd.DataFrame,
                 feature_cols: list,
                 target_col: str,
                 project_dir: str,
                 optuna_trials: int = 10,
                 test_size: float = 0.2,
                 random_state: int = 42,
                 use_gpu: bool = True,):

        df = df.loc[:, ~df.columns.duplicated()]
        self.df = df.copy()

        unique_feats = []
        for col in feature_cols:
            if col in df.columns and col not in unique_feats:
                unique_feats.append(col)
        self.features = unique_feats

        self.target = target_col
        self.optuna_trials = optuna_trials
        self.test_size = test_size
        self.rs = random_state
        self.task_type = "GPU" if use_gpu else "CPU"

        self.model_dir = os.path.join(project_dir, "model_cb")
        os.makedirs(self.model_dir, exist_ok=True)
        self.model_path = os.path.join(self.model_dir, "model.cbm")
        self.params_path = os.path.join(self.model_dir, "params.json")

    def _split(self):
        X = self.df[self.features]
        y = self.df[self.target].astype(int)
        return train_test_split(
            X, y,
            test_size=self.test_size,
            stratify=y,
            random_state=self.rs
        )

    def _objective(self, trial):
        X_tr, X_val, y_tr, y_val = self._split()

        params = {
            "loss_function": "Logloss",
            "iterations": trial.suggest_int("iterations", 1000, 10000),
            "learning_rate": trial.suggest_float("learning_rate", 1e-3, 1e-1, log=True),
            "depth": trial.suggest_int("depth", 4, 12),
            "l2_leaf_reg": trial.suggest_float("l2_leaf_reg", 0.1, 50.0, log=True),
            "bagging_temperature": trial.suggest_float("bagging_temperature", 0.0, 1.0),
            "random_strength": trial.suggest_float("random_strength", 0.0, 5.0),
            "border_count": trial.suggest_int("border_count", 32, 255),
            "auto_class_weights": "Balanced",
            "eval_metric": "F1",
            "custom_metric": ["Logloss", "Accuracy", "F1"],
            "task_type": self.task_type,
            "devices": "0",
            "verbose": False,
            "od_type": "Iter",
            "od_wait": 50,
        }

        model = CatBoostClassifier(**params)
        model.fit(
            X_tr, y_tr,
            eval_set=(X_val, y_val),
            early_stopping_rounds=100,
            use_best_model=True
        )
        preds = model.predict(X_val)
        return 1 - balanced_accuracy_score(y_val, preds)

    def train(self):
        study = optuna.create_study(direction="minimize")
        study.optimize(self._objective, n_trials=self.optuna_trials)
        best = study.best_params
        # Сохраняем лучшие
        with open(self.params_path, "w") as f:
            json.dump(best, f, indent=2)

        X = self.df[self.features]
        y = self.df[self.target].astype(int)

        final_params = {**best,
                        "auto_class_weights": "Balanced",
                        "task_type": self.task_type,
                        "verbose": 100}
        model = CatBoostClassifier(**final_params)
        model.fit(X, y)
        model.save_model(self.model_path)
        return model

    def test(self, threshold: float = 0.5):
        if not os.path.exists(self.model_path):
            print(f"Модель не найдена {self.model_path}, обучаем.")
            self.train()

        model = CatBoostClassifier()
        model.load_model(self.model_path)
        print("Загрузка модели.")

        X = self.df[self.features]
        proba = model.predict_proba(X)[:, 1]
        preds = (proba > threshold).astype(int)
        self.df["prediction"] = preds

        origin_col = f"origin_{self.target}"
        if origin_col in self.df.columns:
            bal_acc = balanced_accuracy_score(
                self.df[origin_col].astype(int), preds
            )
            print(f"[TEST] Balanced Accuracy @ thr={threshold:.2f}: {bal_acc:.4f}")
        else:
            print("[TEST] No origin target column; skipping metric")

        return self.df

    def find_best_threshold(self, n_candidates: int = 101):
        X_tr, X_val, y_tr, y_val = self._split()
        model = CatBoostClassifier()
        model.load_model(self.model_path)

        proba = model.predict_proba(X_val)[:, 1]
        thrs = np.linspace(0, 1, n_candidates)
        best_thr, best_score = 0.5, 0.0
        for thr in thrs:
            preds = (proba > thr).astype(int)
            score = balanced_accuracy_score(y_val, preds)
            if score > best_score:
                best_score, best_thr = score, thr
        print(f"Best threshold on validation: {best_thr:.3f} -> BalancedAcc={best_score:.4f}")
        return best_thr
