from ml_core.run import run_imputation_pipeline, run_modeling_pipeline


class PipelineManager:
    def __init__(self,
                 raw_data_dir="./data/raw",
                 processed_data_dir="./data/processed",
                 result_dir="./data/result",
                 model_dir="./models"):
        self.raw_data_dir = raw_data_dir
        self.processed_data_dir = processed_data_dir
        self.result_dir = result_dir
        self.model_dir = model_dir

    def run_pipeline(self):
        run_imputation_pipeline(
            raw_data_dir=self.raw_data_dir,
            processed_data_dir=self.processed_data_dir,
            gru_epochs=50,
            gru_batch_size=16,
            gru_val_split=0.1,
            device="cuda"
        )

        run_modeling_pipeline(
            processed_data_dir=self.processed_data_dir,
            result_dir=self.result_dir,
            project_model_dir=self.model_dir,
            optuna_trials=5
        )
