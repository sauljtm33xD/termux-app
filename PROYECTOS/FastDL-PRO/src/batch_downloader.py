import asyncio
from pathlib import Path
from typing import List, Optional, Callable
from dataclasses import dataclass
import aiofiles


@dataclass
class BatchDownloadConfig:
    organize_by_type: bool = True
    max_parallel_downloads: int = 4
    skip_duplicates: bool = True


class BatchDownloader:
    def __init__(self, engine, config: BatchDownloadConfig = None):
        self.engine = engine
        self.config = config or BatchDownloadConfig()
        self.urls: List[str] = []
        self.progress_callback: Optional[Callable] = None

    def add_urls_from_list(self, urls: List[str]):
        """Add multiple URLs from a list"""
        for url in urls:
            url = url.strip()
            if url and not url.startswith('#'):
                if self.config.skip_duplicates and url not in self.urls:
                    self.urls.append(url)
                elif not self.config.skip_duplicates:
                    self.urls.append(url)

    async def add_urls_from_file(self, filepath: Path):
        """Load URLs from a text file (one URL per line)"""
        if not filepath.exists():
            raise FileNotFoundError(f"File not found: {filepath}")

        async with aiofiles.open(filepath, 'r') as f:
            content = await f.read()
            urls = [line.strip() for line in content.split('\n') if line.strip() and not line.startswith('#')]
            self.add_urls_from_list(urls)

    async def download_batch(self, output_folder: Optional[Path] = None):
        """Download all URLs with configured parallelism"""
        if not self.urls:
            return

        if output_folder:
            output_folder.mkdir(parents=True, exist_ok=True)
        else:
            output_folder = self.engine.config.download_folder

        # Add all URLs to engine
        tasks = []
        for url in self.urls:
            try:
                task = await self.engine.add_download(url)
                if output_folder:
                    task.output_path = output_folder / task.filename
                tasks.append(task)
            except Exception as e:
                print(f"Error adding URL {url}: {e}")

        # Download with configured parallelism
        self.engine.progress_callback = self.progress_callback

        # Download in batches to respect max_parallel_downloads
        for i in range(0, len(tasks), self.config.max_parallel_downloads):
            batch = tasks[i:i + self.config.max_parallel_downloads]
            download_coros = [self.engine.download_file(task) for task in batch]
            await asyncio.gather(*download_coros)

    def clear_urls(self):
        """Clear the URL list"""
        self.urls = []

    def get_url_count(self) -> int:
        """Get count of URLs to download"""
        return len(self.urls)
