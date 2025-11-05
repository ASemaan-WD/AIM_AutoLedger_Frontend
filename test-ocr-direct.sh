#!/bin/bash

# Test OCR POST endpoint directly
curl -X POST https://acom-aim-hmejbme4c-matinesfahani-3361s-projects.vercel.app/api/ocr2/process \
  -H "Content-Type: application/json" \
  -d '{
    "record_id": "recTEST123",
    "file_url": "https://2iiyhkhlggndtkmx.public.blob.vercel-storage.com/upload-1762229086186.pdf"
  }' \
  -v


