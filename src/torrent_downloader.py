import asyncio
import subprocess
import os
from pathlib import Path
from typing import Optional, Callable, List
from dataclasses import dataclass
import time
import json


@dataclass
class TorrentProgress:
    file_name: str
    progress: float
    download_rate: float
    upload_rate: float
    peers: int
    seeds: int
    state: str


class TorrentDownloader:
    """Simple torrent downloader using qBittorrent CLI or by opening torrent files with default client"""

    def __init__(self, output_folder: Path = None):
        self.output_folder = output_folder or Path.home() / "Downloads"
        self.output_folder.mkdir(parents=True, exist_ok=True)
        self.handles: dict = {}
        self.progress_callback: Optional[Callable] = None
        self.torrent_files: dict = {}

    def add_torrent(self, torrent_path: str, name: str = None) -> str:
        """Add a torrent file or magnet link"""
        torrent_id = str(hash(torrent_path))
        self.torrent_files[torrent_id] = {
            'path': torrent_path,
            'name': name or torrent_path,
            'progress': 0,
            'download_rate': 0,
            'upload_rate': 0,
            'peers': 0,
            'seeds': 0,
            'state': 'added'
        }
        self.handles[torrent_id] = torrent_path
        return torrent_id

    async def download_torrent(self, torrent_path: str, name: str = None) -> bool:
        """Download a torrent file using qBittorrent or default client"""
        try:
            # Try using qBittorrent if available
            if self._has_qbittorrent():
                return await self._download_with_qbittorrent(torrent_path, name)
            else:
                # Fallback: open with default client
                return self._open_with_default_client(torrent_path)
        except Exception as e:
            print(f"Error downloading torrent: {e}")
            return False

    def _has_qbittorrent(self) -> bool:
        """Check if qBittorrent is installed"""
        try:
            subprocess.run(['qbittorrent', '--version'], capture_output=True, check=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False

    async def _download_with_qbittorrent(self, torrent_path: str, name: str = None) -> bool:
        """Use qBittorrent for downloading"""
        try:
            cmd = ['qbittorrent', '--add-paused', torrent_path, '-d', str(self.output_folder)]
            subprocess.run(cmd, check=True, capture_output=True)
            print(f"Torrent added to qBittorrent: {name or torrent_path}")
            return True
        except Exception as e:
            print(f"Error with qBittorrent: {e}")
            return False

    def _open_with_default_client(self, torrent_path: str) -> bool:
        """Open torrent with default client"""
        try:
            import webbrowser
            import platform

            if platform.system() == 'Windows':
                os.startfile(torrent_path)
            elif platform.system() == 'Darwin':
                subprocess.run(['open', torrent_path], check=True)
            else:
                subprocess.run(['xdg-open', torrent_path], check=True)

            print(f"Opened with default torrent client: {torrent_path}")
            return True
        except Exception as e:
            print(f"Error opening torrent: {e}")
            return False

    def pause_torrent(self, torrent_id: str):
        """Pause torrent download"""
        if torrent_id in self.torrent_files:
            self.torrent_files[torrent_id]['state'] = 'paused'

    def resume_torrent(self, torrent_id: str):
        """Resume torrent download"""
        if torrent_id in self.torrent_files:
            self.torrent_files[torrent_id]['state'] = 'downloading'

    def cancel_torrent(self, torrent_id: str):
        """Cancel and remove torrent"""
        if torrent_id in self.torrent_files:
            del self.torrent_files[torrent_id]
        if torrent_id in self.handles:
            del self.handles[torrent_id]

    def get_torrents(self) -> List[dict]:
        """Get list of active torrents"""
        return list(self.torrent_files.values())

    def cleanup(self):
        """Stop all torrents and cleanup"""
        self.handles.clear()
        self.torrent_files.clear()

    def __del__(self):
        self.cleanup()
