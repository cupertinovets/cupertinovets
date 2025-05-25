import os
import pandas as pd


class MyDataLoader:
    """ЭКСПОРТ ОБРАБОТАННЫХ ДАТАСЕТОВ"""

    def __init__(self, output_dir: str, file_prefix: str = "df_", include_index: bool = False):
        self.output_dir = output_dir
        self.file_prefix = file_prefix
        self.include_index = include_index

    def export_data(self, df: pd.DataFrame) -> None:
        if not os.path.exists(self.output_dir):
            raise FileNotFoundError(f"Директория '{self.output_dir}' не существует.")

        output_file = os.path.join(self.output_dir, f"{self.file_prefix}transformed.csv")
        df.to_csv(output_file, index=self.include_index)


# from etl_pipeline import DataLoader
# # Запуск
# if __name__ == "__main__":
#     loader = MyDataLoader("your_output_dir")
#     loader.export_data("your_output_df")
