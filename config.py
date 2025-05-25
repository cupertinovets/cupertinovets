import os
from pathlib import Path


BASE_DIR = os.path.dirname(os.path.abspath("."))


class BDConfig:
    """КОНФИГУРАЦИЯ ПУТЕЙ И ПАРАМЕТРОВ ПОДКЛЮЧЕНИЯ"""

    def __init__(self):
        self.test_raw = "./data/raw/df_test.csv"
        self.train_raw = "./data/raw/df_train.csv"
        self.output_csv = "./data/leo.csv"

        self.db_user = "root"
        self.db_password = "root"
        self.db_host = "176.113.83.14"
        self.db_port = 5432
        self.db_name = "ai_data"

        self.post_url = "http://176.113.83.14:3000/ml-result"

        Path(self.test_raw).parent.mkdir(parents=True, exist_ok=True)
        Path(self.train_raw).parent.mkdir(parents=True, exist_ok=True)
        Path(self.output_csv).parent.mkdir(parents=True, exist_ok=True)


class CUDAConfig:
    """КОНФИГУРАЦИЯ ДЛЯ CUDA"""

    def __init__(self):
        self.cuda_settings = {
            "CUDA_AUTO_BOOST": "1",
            "CUDA_MODULE_LOADING": "LAZY",
            "CUDA_FORCE_PRELOAD_LIBRARIES": "1",
            "CUDA_DEVICE_MAX_CONNECTIONS": "32",
            "CUDA_CACHE_MAXSIZE": "12884901888",
            "PYTORCH_CUDA_ALLOC_CONF": "expandable_segments:True",
        }
        self.apply_cuda_settings()

    def apply_cuda_settings(self):
        for key, value in self.cuda_settings.items():
            os.environ[key] = value


class GRUImputerConfig:
    """Конфигурация для GRUImputer"""

    def __init__(self, base_dir: str = "./models/gru_imputer"):
        self.models_dir = base_dir
        self.checkpoint_path = os.path.join(self.models_dir, "model.pth")
        self.train_log = os.path.join(self.models_dir, "train.log")
        self.history_path = os.path.join(self.models_dir, "history.json")

        os.makedirs(self.models_dir, exist_ok=True)


class BoostConfig:
    """КОНФИГУРАЦИЯ ДЛЯ CATBOOST"""

    def __init__(self):
        self.models_dir = "./models/catboost_model"
        self.model_file = os.path.join(self.models_dir, "model.cbm")
        self.catboost_info_dir = os.path.join(self.models_dir, "catboost_info")
        self.best_params_file = os.path.join(self.models_dir, "best_params.json")

        os.makedirs(self.models_dir, exist_ok=True)
        os.makedirs(self.catboost_info_dir, exist_ok=True)
