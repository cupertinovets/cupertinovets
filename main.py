import warnings
from fastapi import FastAPI
from threading import Thread
from manager import PipelineManager


# Инициализация FastAPI
app = FastAPI()
warnings.filterwarnings("ignore", category=DeprecationWarning)


# Менеджер
pipeline_manager = PipelineManager()


# Фоновый запуск
def start_pipeline():
    pipeline_manager.run_pipeline()


# Старт при запуске сервера
@app.on_event("startup")
async def startup():
    pipeline_thread = Thread(target=start_pipeline, daemon=True)
    pipeline_thread.start()


# Корневой эндпоинт
@app.get("/")
def read_root():
    return {"message": "Система запущена. Импутация и классификация выполняются."}


# # Git Bash  - консоль
# # #!/bin/bash
# # start "" bash -c "uvicorn main:app --log-level debug; exec bash"
# # start "" bash -c "curl http://127.0.0.1:8000/; exec bash"
