"""
TXT to Day One converter.
Upload a zip of .txt journal entries, get back a Day One-format zip
ready for Mneme's Day One importer. All processing is local;
temp files are wiped after conversion.
"""
import os
import re
import json
import shutil
import uuid
import zipfile
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, request, render_template, send_file, jsonify

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB max

# Common date patterns in filenames
DATE_PATTERNS = [
    (r'(\d{4})-(\d{2})-(\d{2})', lambda m: (int(m.group(1)), int(m.group(2)), int(m.group(3)))),  # 2024-01-15
    (r'(\d{4})_(\d{2})_(\d{2})', lambda m: (int(m.group(1)), int(m.group(2)), int(m.group(3)))),  # 2024_01_15
    (r'(\d{2})-(\d{2})-(\d{4})', lambda m: (int(m.group(3)), int(m.group(1)), int(m.group(2)))),  # 01-15-2024
    (r'(\d{4})(\d{2})(\d{2})', lambda m: (int(m.group(1)), int(m.group(2)), int(m.group(3)))),    # 20240115
]

MONTH_NAMES = {
    'jan': 1, 'january': 1, 'feb': 2, 'february': 2, 'mar': 3, 'march': 3,
    'apr': 4, 'april': 4, 'may': 5, 'jun': 6, 'june': 6,
    'jul': 7, 'july': 7, 'aug': 8, 'august': 8, 'sep': 9, 'sept': 9, 'september': 9,
    'oct': 10, 'october': 10, 'nov': 11, 'november': 11, 'dec': 12, 'december': 12,
}


def parse_date_from_filename(filename: str) -> datetime | None:
    """Try to extract a date from a filename. Returns None if no date found."""
    stem = Path(filename).stem

    # Try numeric patterns
    for pattern, extractor in DATE_PATTERNS:
        m = re.search(pattern, stem)
        if m:
            try:
                year, month, day = extractor(m)
                return datetime(year, month, day, 12, 0, 0, tzinfo=timezone.utc)
            except ValueError:
                continue

    # Try "Jan 15 2024" or "January 15, 2024" patterns
    m = re.search(r'(\w+)\s+(\d{1,2}),?\s+(\d{4})', stem, re.IGNORECASE)
    if m:
        month_str, day_str, year_str = m.groups()
        month = MONTH_NAMES.get(month_str.lower())
        if month:
            try:
                return datetime(int(year_str), month, int(day_str), 12, 0, 0, tzinfo=timezone.utc)
            except ValueError:
                pass

    return None


def secure_delete(path: Path):
    """Overwrite and delete a file or directory tree."""
    try:
        if path.is_file():
            # Overwrite with zeros before deleting
            size = path.stat().st_size
            with open(path, 'wb') as f:
                f.write(b'\x00' * min(size, 1024 * 1024))
            path.unlink()
        elif path.is_dir():
            for item in path.rglob('*'):
                if item.is_file():
                    try:
                        size = item.stat().st_size
                        with open(item, 'wb') as f:
                            f.write(b'\x00' * min(size, 1024 * 1024))
                    except OSError:
                        pass
            shutil.rmtree(path, ignore_errors=True)
    except OSError:
        pass


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/convert', methods=['POST'])
def convert():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    uploaded = request.files['file']
    if not uploaded.filename or not uploaded.filename.lower().endswith('.zip'):
        return jsonify({'error': 'Please upload a .zip file'}), 400

    journal_name = request.form.get('journal_name', 'Imported').strip() or 'Imported'

    work_dir = Path(tempfile.mkdtemp(prefix='txt2dayone_'))
    output_path = None

    try:
        # Save and extract the uploaded zip
        zip_path = work_dir / 'input.zip'
        uploaded.save(str(zip_path))

        extract_dir = work_dir / 'extracted'
        extract_dir.mkdir()

        with zipfile.ZipFile(zip_path, 'r') as zf:
            zf.extractall(extract_dir)

        # Find all .txt files (recursive)
        txt_files = sorted(extract_dir.rglob('*.txt'))
        # Also try .md files
        txt_files += sorted(extract_dir.rglob('*.md'))
        txt_files = sorted(set(txt_files))

        if not txt_files:
            return jsonify({'error': 'No .txt or .md files found in the zip'}), 400

        # Convert each to a Day One entry
        entries = []
        skipped = []
        for txt_path in txt_files:
            try:
                text = txt_path.read_text(encoding='utf-8', errors='replace').strip()
            except OSError:
                skipped.append(txt_path.name)
                continue

            if not text:
                skipped.append(txt_path.name)
                continue

            entry_date = parse_date_from_filename(txt_path.name)
            if entry_date is None:
                # Fall back to file modification time
                mtime = txt_path.stat().st_mtime
                entry_date = datetime.fromtimestamp(mtime, tz=timezone.utc)

            iso_date = entry_date.strftime('%Y-%m-%dT%H:%M:%SZ')

            entries.append({
                'uuid': str(uuid.uuid4()).upper(),
                'creationDate': iso_date,
                'modifiedDate': iso_date,
                'text': text,
                'tags': [],
                'starred': False,
            })

        if not entries:
            return jsonify({'error': 'No readable entries found'}), 400

        # Sort oldest first (Day One expects chronological)
        entries.sort(key=lambda e: e['creationDate'])

        # Build the Day One journal JSON
        journal_data = {
            'metadata': {'version': '1.0'},
            'entries': entries,
        }

        # Package as a Day One-style export zip
        output_path = work_dir / f'{journal_name}.dayone-export.zip'
        json_name = f'{journal_name}.json'
        with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zf:
            zf.writestr(json_name, json.dumps(journal_data, indent=2, ensure_ascii=False))

        # Secure-delete the input files NOW (before sending the result)
        secure_delete(zip_path)
        secure_delete(extract_dir)

        # Send the result; delete it after the response is sent
        def cleanup():
            if output_path and output_path.exists():
                secure_delete(output_path)
            if work_dir.exists():
                secure_delete(work_dir)

        response = send_file(
            str(output_path),
            as_attachment=True,
            download_name=f'{journal_name}.dayone-export.zip',
            mimetype='application/zip',
        )
        # Flask will call this after sending
        @response.call_on_close
        def on_close():
            cleanup()

        return response

    except zipfile.BadZipFile:
        secure_delete(work_dir)
        return jsonify({'error': 'Invalid zip file'}), 400
    except Exception as e:
        secure_delete(work_dir)
        return jsonify({'error': f'Conversion failed: {e}'}), 500


@app.route('/health')
def health():
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8093)
