# SwingStats — read-only Swing Music library stats for Homepage.
# Serves {"tracks": N, "albums": N, "artists": N} at GET /stats on port 5001.
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1

WORKDIR /app
COPY swingstats.py ./

EXPOSE 5001
CMD ["python3", "swingstats.py"]
