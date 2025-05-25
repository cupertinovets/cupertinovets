import os
import logging
import pandas as pd
from janitor import clean_names


class DataExtractor:
    """ИМПРОТ СОБРАННЫХ ДАТАСЕТОВ"""

    def __init__(self, directories):
        self.directories = directories

    def import_data(self):
        files = []
        for directory in self.directories:
            if not os.path.exists(directory):
                raise FileNotFoundError(f"Директории '{directory}' не существует.")
            files.extend([os.path.join(directory, file)
                          for file in os.listdir(directory) if file.endswith(".csv")])

        if not files:
            raise ValueError("Нету CSV-файлов.")

        data_dict = {}
        na_counts = {}

        for file in files:
            df = clean_names(pd.read_csv(file, na_values=str(["N/A", "NA", ".", ""])))

            if "date" in df.columns:
                df["date"] = pd.to_datetime(df["date"].str.replace("T", " ").str.replace("Z", ""),
                                            errors="coerce")

            dataset_name = os.path.splitext(os.path.basename(file))[0]
            data_dict[dataset_name] = df
            na_counts[dataset_name] = df.isna().sum().sum()

            logging.info(
                f"Загружен файл: {file}, "
                f"строк: {df.shape[0]}, "
                f"столбцов: {df.shape[1]}, "
                f"пропущенных значений: {na_counts[dataset_name]}"
            )

        na_df = pd.DataFrame(list(na_counts.items()), columns=["dataset", "na_count"])
        return data_dict, na_df


# from etl_pipeline import DataExtractor
# # Запуск
# if __name__ == "__main__":
#     directories = ["./data/raw"]
#     extractor = DataExtractor(directories)
#     datasets, na_statistics = extractor.import_data()
