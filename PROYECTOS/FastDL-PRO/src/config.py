from pathlib import Path
from dataclasses import dataclass
from typing import Optional

@dataclass
class DownloadConfig:
    max_parallel_connections: int = 16
    chunk_size: int = 1024 * 1024 * 4
    timeout: int = 60
    max_bandwidth: Optional[int] = None
    retry_attempts: int = 5
    resume_downloads: bool = True
    download_folder: Path = Path.home() / "Downloads"
    segment_size: int = 1024 * 1024 * 10
    enable_segmented: bool = True

    def __post_init__(self):
        self.download_folder.mkdir(parents=True, exist_ok=True)

config = DownloadConfig()
