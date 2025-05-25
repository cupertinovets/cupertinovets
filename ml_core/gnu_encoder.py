import torch
import numpy as np
import pandas as pd
from torch import nn
from torch.utils.data import Dataset
from sklearn.preprocessing import MinMaxScaler
from sklearn.preprocessing import StandardScaler


class YearlySeriesDataset(Dataset):
    """МАСКА ПРИЗНАКОВ ЗА ГОД"""

    def __init__(self, df: pd.DataFrame, cons_cols: list, feature_cols: list,
                 id_col: str, scaler: MinMaxScaler):
        self.cons_cols = cons_cols
        self.feature_cols = feature_cols
        self.id_col = id_col
        self.scaler = scaler
        self.records = []

        for key, group in df.groupby(self.id_col):
            row = group.iloc[0]
            orig = row[cons_cols].values.astype(float)
            mask = (~np.isnan(orig)).astype(float)
            series = np.nan_to_num(orig, 0.0)

            prev_vals = np.concatenate([[series[0]], series[:-1]])
            next_vals = np.concatenate([series[1:], [series[-1]]])
            magnitude = np.floor(np.log10(series + 1)).astype(float)
            is_zero = (series == 0).astype(float)

            T = len(series)
            months = np.arange(1, T + 1).reshape(-1, 1)

            feats_row = row[self.feature_cols].values.astype(float)
            feats_rep = np.repeat(feats_row[None, :], T, axis=0)

            raw_feats = np.concatenate([feats_rep, months,
                                        series.reshape(-1, 1),
                                        prev_vals.reshape(-1, 1),
                                        next_vals.reshape(-1, 1),
                                        magnitude.reshape(-1, 1),
                                        is_zero.reshape(-1, 1),], axis=1)

            feats = self.scaler.transform(raw_feats)
            self.records.append({"key": key,
                                 "feats": feats.astype(np.float32),
                                 "mask": mask.astype(np.float32),
                                 "orig": orig.astype(np.float32),
                                 "series": series.astype(np.float32),
                                 "feats_row": feats_row.astype(np.float32)})

    def __len__(self):
        return len(self.records)

    def __getitem__(self, idx):
        rec = self.records[idx]
        return {"key": rec["key"],
                "x": torch.tensor(rec["feats"], dtype=torch.float32),
                "mask": torch.tensor(rec["mask"][:, None], dtype=torch.float32),
                "orig": torch.tensor(rec["orig"], dtype=torch.float32)}


class Attention(nn.Module):
    """AIAYN"""

    def __init__(self, hidden_dim):
        super().__init__()
        self.attn = nn.Linear(hidden_dim, 1)

    def forward(self, x):
        # x: (B, T, H)
        weights = self.attn(x).squeeze(-1)
        weights = torch.softmax(weights, dim=-1)
        context = torch.bmm(weights.unsqueeze(1), x).squeeze(1)
        return context.unsqueeze(1).repeat(1, x.size(1), 1)


class SeriesImputer(nn.Module):
    """ИМПУТАТОР НА ВРЕМЕННОМ РЯДУ"""

    def __init__(self, input_dim: int, hidden_dim: int = 128, dropout: float = 0.3):
        super().__init__()

        self.encoder = nn.GRU(input_size=input_dim + 1, hidden_size=hidden_dim,
                              batch_first=True, bidirectional=True)
        self.attn = Attention(hidden_dim * 2)
        self.decoder = nn.GRU(input_size=hidden_dim * 2, hidden_size=hidden_dim, batch_first=True)
        self.norm = nn.LayerNorm(hidden_dim)
        self.dropout = nn.Dropout(dropout)
        self.output_layer = nn.Linear(hidden_dim, 1)

    def forward(self, x, mask):
        enc_input = torch.cat([x, mask], dim=-1)
        enc_out, _ = self.encoder(enc_input)
        context = self.attn(enc_out)
        dec_out, _ = self.decoder(context)
        res = dec_out + context[:, :, :dec_out.size(-1)]
        out = self.norm(res)
        out = self.dropout(out)
        preds = self.output_layer(out).squeeze(-1)
        preds = torch.relu(preds)
        return preds


class SequenceScaler:
    """ЕДИНОЕ ПРЕДСТАВЛЕНИЕ ПОСЛЕДОВАТЕЛЬНОСТИ"""

    def __init__(self, id_col: str):
        self.id_col = id_col
        self.scaler = StandardScaler()

    #
    def fit(self, df: pd.DataFrame, cons_cols: list, feature_cols: list) -> "SequenceScaler":
        raws = []
        for _, group in df.groupby(self.id_col):
            row = group.iloc[0]
            orig = row[cons_cols].values.astype(float)
            series = np.nan_to_num(orig, 0.0)

            prev_vals = np.concatenate([[series[0]], series[:-1]])
            next_vals = np.concatenate([series[1:], [series[-1]]])
            magnitude = np.floor(np.log10(series + 1)).astype(float)
            is_zero = (series == 0).astype(float)

            T = len(series)
            months = np.arange(1, T + 1).reshape(-1, 1)

            feats_row = row[feature_cols].values.astype(float)
            feats_rep = np.repeat(feats_row[None, :], T, axis=0)

            raw = np.concatenate([
                feats_rep,
                months,
                series.reshape(-1, 1),
                prev_vals.reshape(-1, 1),
                next_vals.reshape(-1, 1),
                magnitude.reshape(-1, 1),
                is_zero.reshape(-1, 1),
            ], axis=1)
            raws.append(raw)

        all_raw = np.vstack(raws)
        self.scaler.fit(all_raw)
        return self
