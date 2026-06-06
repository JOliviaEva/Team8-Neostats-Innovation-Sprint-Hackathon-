import os

bind = f"0.0.0.0:{os.getenv('BACKEND_PORT', '8000')}"
workers = 1  # Single worker to share in-memory FAISS indices
worker_class = "uvicorn.workers.UvicornWorker"
timeout = 120
keepalive = 5
accesslog = "-"
errorlog = "-"
loglevel = "info"
