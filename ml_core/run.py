import os
import re
import sys
from config import CUDAConfig, GRUImputerConfig
from etl_pipeline import MyDataLoader, DataExtractor, DataTransformer
from ml_core import (GRUImputer, SequenceScaler, WideTimeGenerator, IsomapReducer, CatboostSimple)


def run_imputation_pipeline(raw_data_dir: str = "./data/raw",
                            processed_data_dir: str = "./data/processed",
                            gru_epochs: int = 50,
                            gru_batch_size: int = 16,
                            gru_val_split: float = 0.1,
                            device: str = "cuda"):

    # Препроцессинг
    dt = DataTransformer(cat_features=["building_type"],
                         knn_target=["rooms_count", "residents_count"],
                         drop_features=["area", "building_type_Сарай"])

    # Загрузка сырьевых данных
    extractor = DataExtractor([raw_data_dir])
    datasets, _ = extractor.import_data()
    df0 = datasets["df_test"]

    # Fit-transform
    df1 = dt.fit_transform(df0)
    df1["building_type_Дача"] = 0

    cons_cols = [c for c in df1.columns if re.match(r"^cons_[a-z]+$", c)]
    feature_cols = ["rooms_count", "residents_count"] + [
        c for c in df1.columns if c.startswith("building_type_")
    ]
    seq_scaler = (SequenceScaler(id_col="id")
                  .fit(df1, cons_cols=cons_cols, feature_cols=feature_cols))

    # Конфигурация и запуск GRU-импутера
    config = GRUImputerConfig()
    CUDAConfig()

    gru_imp = GRUImputer(id_col="id",
                         sequence_scaler=seq_scaler,
                         device=device,
                         epochs=gru_epochs,
                         batch_size=gru_batch_size,
                         val_split=gru_val_split,
                         model_dir=config.models_dir)

    df_final = gru_imp.fit_and_impute(df1, cons_cols, feature_cols)
    loader = MyDataLoader(processed_data_dir)
    loader.export_data(df_final)


def run_modeling_pipeline(processed_data_dir: str = "./data/processed",
                          result_dir: str = "./data/result",
                          project_model_dir: str = "./models",
                          optuna_trials: int = 5,):
    os.makedirs(result_dir, exist_ok=True)

    # Загрузка
    ext = DataExtractor([processed_data_dir])
    datasets, _ = ext.import_data()
    df0 = datasets.get("df_transformed") or datasets.get("df_final")
    if df0 is None:
        raise RuntimeError("Не найдена таблица df_transformed или df_final в processed_data_dir")

    # Скользящие признаки
    cons = [c for c in df0.columns if re.match(r"^cons_[a-z]+$", c)]
    df1 = WideTimeGenerator(cons_cols=cons, periods=[12, 6, 4]).transform(df0)

    # Isomap
    df2 = IsomapReducer(cons, n_components=1).fit_transform(df1)

    # Корректировка знака по корреляции с target
    corr = df2.corr()["commercial"].drop("commercial")
    neg_feats = corr[corr < 0].index.tolist()
    for col in neg_feats:
        df2[col] = -df2[col]

    # Фича инжиринг
    df2["summer_mean"] = df2[["cons_jun", "cons_jul", "cons_aug"]].mean(axis=1)
    df2["trend_slope_sq"] = df2["trend_slope"] ** 2
    df2["trend_slope_cu"] = df2["trend_slope"] ** 3

    # Подготовка final-фич
    df2.rename(columns={"commercial": "origin_commercial"}, inplace=True)
    df2["commercial"] = df2["origin_commercial"]

    feats = [c
             for c in df2.columns
             if c
             not in {"id", "address", "location", "origin_commercial", "commercial"}]

    # Настройка и запуск CatBoost
    pipe = CatboostSimple(df=df2,
                          feature_cols=feats,
                          target_col="commercial",
                          project_dir=project_model_dir,
                          optuna_trials=optuna_trials)

    # Выбор режима
    mode = sys.argv[1] if len(sys.argv) > 1 else "test"
    if mode == "train":
        pipe.train()
        best_thr = pipe.find_best_threshold()
        print("Лучший threshold:", best_thr)
    else:
        best_thr = 0.80
        out = pipe.test(threshold=best_thr)
        out = out.rename(
            columns={"id": "accountId", "prediction": "isCommercial"}
        )[
            ["accountId", "isCommercial"]
        ]

        output_path = os.path.join(result_dir, "final.json")
        out.to_json(output_path, orient="records", lines=False, force_ascii=False)
        print(f"Результаты тестирования сохранены в {output_path}")


def main():
    run_imputation_pipeline(raw_data_dir="./data/raw",
                            processed_data_dir="./data/processed",
                            gru_epochs=50,
                            gru_batch_size=16,
                            gru_val_split=0.1,
                            device="cuda")

    run_modeling_pipeline(processed_data_dir="./data/processed",
                          result_dir=os.path.join(os.getcwd(), "data", "result"),
                          project_model_dir=os.path.join(os.getcwd(), "models"),
                          optuna_trials=5)


if __name__ == "__main__":
    main()
