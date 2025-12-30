import re
from urllib.parse import urlparse

FEATURE_NAMES = [
    "url_length",
    "hostname_length",
    "path_length",
    "num_dots",
    "num_hyphens",
    "num_at",
    "num_qm",
    "num_eq",
    "num_slash",
    "has_ip",
    "has_https",
    "digit_ratio"
]

def extract_url_features(url: str):
    url = url.strip()
    parsed = urlparse(url)
    hostname = parsed.netloc
    path = parsed.path

    url_length = len(url)
    hostname_length = len(hostname)
    path_length = len(path)
    num_dots = url.count(".")
    num_hyphens = url.count("-")
    num_at = url.count("@")
    num_qm = url.count("?")
    num_eq = url.count("=")
    num_slash = url.count("/")
    has_ip = 1 if re.search(r"\d+\.\d+\.\d+\.\d+", hostname) else 0
    has_https = 1 if url.lower().startswith("https://") else 0
    digits = sum(c.isdigit() for c in url)
    digit_ratio = digits / url_length if url_length > 0 else 0.0

    return [
        url_length,
        hostname_length,
        path_length,
        num_dots,
        num_hyphens,
        num_at,
        num_qm,
        num_eq,
        num_slash,
        has_ip,
        has_https,
        digit_ratio
    ]
