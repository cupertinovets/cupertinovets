import os
import torch
import logging
import numpy as np
import pandas as pd
from typing import List
from torch.serialization import safe_globals
from sklearn.metrics import mean_squared_error
from torch.utils.data import DataLoader, random_split

from ml_core import SeriesImputer
from ml_core import SequenceScaler
from ml_core import YearlySeriesDataset


class GRUImputer:
    """GRU МОДЕЛЬ ДЛЯ ВОССТАНОВЛЕНИЯ NA НА ВРЕМЯННОМ РЯДУ"""

    def __init__(self, id_col: str, sequence_scaler: SequenceScaler, device: str = "cuda", epochs: int = 100,
                 batch_size: int = 16, val_split: float = 0.1, model_dir: str = "./models/gru_imputer"):
        self.id_col = id_col
        self.seq_scaler = sequence_scaler.scaler
        self.device = torch.device(device)
        self.epochs = epochs
        self.batch_size = batch_size
        self.val_split = val_split
        self.model_dir = model_dir
        self.checkpoint_path = os.path.join(model_dir, "model.pth")
        self.log_path = os.path.join(model_dir, "train.log")
        self.history_path = os.path.join(model_dir, "history.json")

        os.makedirs(model_dir, exist_ok=True)
        self._setup_logger()

    def _setup_logger(self):
        logging.basicConfig(filename=self.log_path,
                            filemode="a",
                            format='%(asctime)s - %(levelname)s - %(message)s',
                            level=logging.INFO)
        self.logger = logging.getLogger("GRUImputer")

    def fit_and_impute(self, df: pd.DataFrame, cons_cols: List[str], feature_cols: List[str]) -> pd.DataFrame:
        df = df.copy()
        dataset = YearlySeriesDataset(df, cons_cols, feature_cols, self.id_col, self.seq_scaler)

        n_val = int(len(dataset) * self.val_split)
        train_ds, val_ds = random_split(dataset, [len(dataset) - n_val, n_val])
        train_loader = DataLoader(train_ds, batch_size=self.batch_size, shuffle=True)
        val_loader = DataLoader(val_ds, batch_size=self.batch_size)

        model = SeriesImputer(input_dim=len(feature_cols) + 6).to(self.device)
        optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
        scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=5, factor=0.5)

        start_epoch, history = 1, {"train_rmse": [], "val_rmse": []}
        if os.path.exists(self.checkpoint_path):
            with safe_globals(["numpy.core.multiarray.scalar"]):
                ck = torch.load(self.checkpoint_path, map_location=self.device, weights_only=False)
            model.load_state_dict(ck["model_state"])
            optimizer.load_state_dict(ck["opt_state"])
            start_epoch = ck["epoch"] + 1
            history = ck.get("history", history)
            self.logger.info(f"Resuming from epoch {start_epoch}")

        best_val_rmse = float('inf')
        patience_counter = 0
        patience = 10
        max_grad_norm = 1.0

        for epoch in range(start_epoch, self.epochs + 1):
            model.train()
            preds_tr, targets_tr = [], []

            for batch in train_loader:
                x = batch["x"].to(self.device)
                mask = batch["mask"].to(self.device)
                y = batch["orig"].to(self.device)

                preds = model(x, mask)
                mask_ = mask.squeeze(-1)
                loss = ((preds - y) ** 2 * mask_).sum() / mask_.sum()

                optimizer.zero_grad()
                loss.backward()

                torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=max_grad_norm)
                optimizer.step()

                preds_tr.append((preds * mask_).detach().cpu().numpy().ravel())
                targets_tr.append((y * mask_).detach().cpu().numpy().ravel())

            model.eval()
            preds_val, targets_val = [], []
            with torch.no_grad():
                for batch in val_loader:
                    x = batch["x"].to(self.device)
                    mask = batch["mask"].to(self.device)
                    y = batch["orig"].to(self.device)

                    p = model(x, mask)
                    mask_ = mask.squeeze(-1)
                    preds_val.append((p * mask_).cpu().numpy().ravel())
                    targets_val.append((y * mask_).cpu().numpy().ravel())

            train_rmse = np.sqrt(mean_squared_error(np.concatenate(targets_tr), np.concatenate(preds_tr)))
            val_rmse = np.sqrt(mean_squared_error(np.concatenate(targets_val), np.concatenate(preds_val)))

            scheduler.step(val_rmse)

            history["train_rmse"].append(train_rmse)
            history["val_rmse"].append(val_rmse)

            log_msg = f"Epoch {epoch:03d} | train_RMSE={train_rmse:.4f} | val_RMSE={val_rmse:.4f}"
            print(log_msg)
            self.logger.info(log_msg)

            if val_rmse < best_val_rmse:
                best_val_rmse = val_rmse
                patience_counter = 0

                torch.save({
                    "epoch": epoch,
                    "model_state": model.state_dict(),
                    "opt_state": optimizer.state_dict(),
                    "history": history
                }, self.checkpoint_path)
            else:
                patience_counter += 1
                if patience_counter >= patience:
                    print(f"Early stopping triggered at epoch {epoch}")
                    self.logger.info(f"Early stopping triggered at epoch {epoch}")
                    break

        model.load_state_dict(ck["model_state"])
        model.eval()

        with torch.no_grad():
            for rec in dataset.records:
                key = rec["key"]
                mask_row = (~df.loc[df[self.id_col] == key, cons_cols].isna()).values.flatten()
                T = len(cons_cols)

                series = rec["series"].reshape(-1, 1)
                prev_vals = np.concatenate([[series[0]], series[:-1]]).reshape(-1, 1)
                next_vals = np.concatenate([series[1:], [series[-1]]]).reshape(-1, 1)
                magnitude = np.floor(np.log10(series + 1)).reshape(-1, 1)
                is_zero = (series == 0).astype(float).reshape(-1, 1)
                months = np.arange(1, T + 1).reshape(-1, 1)
                feats_rep = np.repeat(rec["feats_row"][None], T, axis=0)

                raw = np.concatenate([feats_rep, months, series,
                                      prev_vals, next_vals, magnitude, is_zero], axis=1)
                feats = self.seq_scaler.transform(raw)

                x_in = torch.tensor(feats[None], dtype=torch.float32, device=self.device)
                mask_in = torch.tensor(rec["mask"][None, :, None], dtype=torch.float32, device=self.device)
                preds = model(x_in, mask_in).cpu().numpy().ravel()

                for i, col in enumerate(cons_cols):
                    if not mask_row[i]:
                        df.loc[df[self.id_col] == key, col] = preds[i]

        return df
