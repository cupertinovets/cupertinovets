import re
import numpy as np
import pandas as pd
from sklearn.manifold import Isomap
from scipy.signal import argrelextrema
from sklearn.linear_model import LinearRegression


class WideTimeGenerator:
    """РАЗЛОЖЕНИЕ ВРМЕННОГО РЯДА"""

    def __init__(self, cons_cols: list = None, periods=None):

        if periods is None:
            periods = [12, 6, 4]
        if cons_cols is None:
            self.cons_cols = ["cons_jan", "cons_feb", "cons_mar", "cons_apr",
                              "cons_may", "cons_jun", "cons_jul", "cons_aug",
                              "cons_sep", "cons_oct", "cons_nov", "cons_dec"]
        else:
            self.cons_cols = cons_cols
        self.periods = periods
        self._t = np.arange(1, len(self.cons_cols) + 1).reshape(-1, 1)

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        arr = df[self.cons_cols].values
        n, T = arr.shape
        t = np.arange(1, T + 1)

        for P in self.periods:
            sin_term = np.sin(2 * np.pi * t / P)
            cos_term = np.cos(2 * np.pi * t / P)

            df[f"fourier_sin_{P}"] = (arr * sin_term).sum(axis=1)
            df[f"fourier_cos_{P}"] = (arr * cos_term).sum(axis=1)

        lr = LinearRegression()
        slopes = []
        for row in arr:
            lr.fit(self._t, row.reshape(-1, 1))
            slopes.append(lr.coef_[0][0])
        df["trend_slope"] = slopes

        df["cons_mean"] = arr.mean(axis=1)
        df["cons_std"] = arr.std(axis=1)
        df["cons_min"] = arr.min(axis=1)
        df["cons_max"] = arr.max(axis=1)

        diffs1 = np.diff(arr, n=1, axis=1)
        df["diff1_mean"] = diffs1.mean(axis=1)
        df["diff1_last"] = diffs1[:, -1]

        cons_cols = [c for c in df.columns if re.match(r"^cons_[a-z]+$", c)]
        arr = df[cons_cols].values
        maxima_counts = [len(argrelextrema(row, np.greater)[0]) for row in arr]
        df["n_local_max"] = maxima_counts

        return df


class IsomapReducer:
    """СНИЖЕНИЕ РАЗМЕРНОСТИ"""

    def __init__(self, cons_cols: list, n_components: int = 1, n_neighbors: int = 5):
        self.cons_cols = cons_cols
        self.n_components = n_components
        self.n_neighbors = n_neighbors
        self.reducer = Isomap(n_components=self.n_components, n_neighbors=self.n_neighbors)

    def fit_transform(self, df: pd.DataFrame) -> pd.DataFrame:
        X = df[self.cons_cols].values
        X_reduced = self.reducer.fit_transform(X)
        col_names = [f"isomap_{i + 1}" for i in range(self.n_components)]
        df_reduced = pd.DataFrame(X_reduced, columns=col_names, index=df.index)
        return pd.concat([df, df_reduced], axis=1)


# # Запуск
# from etl_pipeline import DataExtractor
#
# if __name__ == "__main__":
#     extractor = DataExtractor(["./data/processed"])
#     datasets, _ = extractor.import_data()
#     df0 = datasets["df_transformed"]
#     cons_cols = [c for c in df0.columns if re.match(r"^cons_[a-z]+$", c)]
#     wtfg = WideTimeGenerator(cons_cols=cons_cols, periods=[12, 6, 4])
#     reducer = IsomapReducer(cons_cols, n_components=2)
#     df1 = reducer.fit_transform(df0)
#     df_feat = wtfg.transform(df1)
