import re
import numpy as np
import pandas as pd
from sklearn.impute import KNNImputer
from sklearn.preprocessing import MinMaxScaler, StandardScaler


class DataTransformer:
    """ПРЕПРОЦЕССИНГ: КОДИРОВАНИЕ ФИЧЕЙ И СТАНДАРТИЗАЦИЯ"""

    def __init__(self, cat_features: list, knn_target: list, drop_features: list = None,
                 cons_pattern: str = r"^cons_[a-z]+$", knn_neighbors: int = 5):
        self.cat_features = cat_features
        self.knn_target = knn_target
        self.drop_features = drop_features or []
        self.cons_pattern = cons_pattern
        self.knn_neighbors = knn_neighbors

        self.numeric_cols = None
        self.cons_cols = None
        self.scaler = MinMaxScaler()
        self.fitted = False

    # Разбиваем адресс
    @staticmethod
    def extract_location(df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()

        abbreviations = ["село", "г", "ст", "ст-ца", "п", "пгт", "х", "с", "аул",
                         "г.", "ст.", "п.", "х.", "с.", "пгт.", "тер.", "тер", "снт",
                         "пос.", "ст.Благовещенская"]

        pattern = r'\b(' + '|'.join(re.escape(a) for a in abbreviations) + r')\s+[А-Яа-яA-Za-zёЁ\- ]+'

        def extract_location(address: str) -> str | int:
            if not isinstance(address, str):
                return 0

            address = address.strip()
            match = re.search(pattern, address)
            if match:
                start_idx = match.start()
                rest = address[start_idx:]
                end_idx = rest.find(',')
                location = rest[:end_idx] if end_idx != -1 else rest
                return location.strip()

            return 0

        if "address" not in df.columns:
            raise ValueError("Ожидается колонка 'address' в датафрейме.")
        df["location"] = df["address"].apply(extract_location)
        return df

    # One-hote
    def _one_hot_encode(self, df: pd.DataFrame) -> pd.DataFrame:
        return pd.get_dummies(df, columns=self.cat_features)

    # Алгоритм KNN
    def _knn_impute_targets(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        cols = self.knn_target.copy()

        for col in cols:
            if df[col].isna().any():
                df[col].fillna(df[col].median(), inplace=True)

        scaler = StandardScaler()
        df_scaled = df[cols].copy()
        df_scaled = pd.DataFrame(scaler.fit_transform(df_scaled), columns=cols)

        imputer = KNNImputer(n_neighbors=self.knn_neighbors, weights='distance')
        df_imputed_scaled = imputer.fit_transform(df_scaled)
        df_imputed = pd.DataFrame(scaler.inverse_transform(df_imputed_scaled), columns=cols)
        df[cols] = df_imputed.round().clip(1, 20).astype(int)

        if "building_type_Гараж" in df.columns:
            mask = df["building_type_Гараж"] == 1
            df.loc[mask, cols] = 1

        return df

    # Стандартизация числовых переменных
    def _log_and_scale(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        df_log = df[self.numeric_cols].apply(np.log1p)
        df[self.numeric_cols] = self.scaler.transform(df_log)
        return df

    def fit(self, df: pd.DataFrame):
        df = df.copy()
        df = self.extract_location(df)
        df = self._one_hot_encode(df)
        df.drop(columns=self.drop_features, inplace=True, errors="ignore")
        df = self._knn_impute_targets(df)
        self.cons_cols = [c for c in df.columns if re.match(self.cons_pattern, c)]
        self.numeric_cols = self.knn_target + self.cons_cols
        df_log = df[self.numeric_cols].apply(np.log1p)
        self.scaler.fit(df_log)
        self.fitted = True
        return self

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        df = self.extract_location(df)
        df = self._one_hot_encode(df)
        df.drop(columns=self.drop_features, inplace=True, errors="ignore")
        df = self._knn_impute_targets(df)
        df = self._log_and_scale(df)
        return df

    # Проверка на тип
    def get_consumption_columns(self) -> list:
        return self.cons_cols

    # Проверка на тип
    def get_numeric_columns(self) -> list:
        return self.numeric_cols

    # Основная функция
    def fit_transform(self, df: pd.DataFrame) -> pd.DataFrame:
        return self.fit(df).transform(df)


# # Запуск
# from etl_pipeline import DataExtractor
# if __name__ == "__main__":
#     dt = DataTransformer(cat_features=["building_type"],
#                          knn_target=["rooms_count", "residents_count"],
#                          knn_neighbors=10,
#                          drop_features=["building_type_Сарай", "area"])
#
#     extractor = DataExtractor(["./data/raw"])
#     datasets, _ = extractor.import_data()
#     df0 = datasets["df_test"]
#     df1 = dt.fit_transform(df0)
