import os
import sys
import base64
import json
import urllib.request

api_key = os.environ.get("OPENAI_API_KEY", "")
if not api_key:
    print("No API key", file=sys.stderr)
    sys.exit(1)

prompt = sys.argv[1]
output_path = sys.argv[2]

# Use the OpenAI images API directly
url = "https://api.openai.com/v1/images/generations"
data = json.dumps({
    "model": "gpt-image-1",
    "prompt": prompt,
    "n": 1,
    "size": "1536x1024",
    "quality": "high"
}).encode("utf-8")

req = urllib.request.Request(url, data=data, headers={
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
})

try:
    with urllib.request.urlopen(req, timeout=180) as resp:
        result = json.loads(resp.read().decode("utf-8"))
    
    # Get the image data
    img_data = result["data"][0]
    if "b64_json" in img_data:
        img_bytes = base64.b64decode(img_data["b64_json"])
    elif "url" in img_data:
        with urllib.request.urlopen(img_data["url"]) as img_resp:
            img_bytes = img_resp.read()
    else:
        print("No image in response", file=sys.stderr)
        sys.exit(1)
    
    with open(output_path, "wb") as f:
        f.write(img_bytes)
    print(f"Saved to {output_path}")
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
