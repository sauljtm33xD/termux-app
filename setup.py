from setuptools import setup, find_packages

setup(
    name="fastdl",
    version="1.0.0",
    description="High-speed parallel downloader for PC",
    author="FastDL Team",
    packages=find_packages(),
    install_requires=[
        "aiohttp==3.9.1",
        "PyQt6==6.6.1",
        "PyQt6-sip==13.6.0",
        "aiofiles==23.2.1",
        "pydantic==2.5.0",
        "python-dotenv==1.0.0",
    ],
    entry_points={
        "console_scripts": [
            "fastdl=src.main:main",
        ],
    },
    python_requires=">=3.9",
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: End Users/Desktop",
        "Topic :: Communications :: File Sharing",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
)
