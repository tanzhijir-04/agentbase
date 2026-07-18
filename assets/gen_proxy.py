import os, sys, base64
from openai import OpenAI

api_key = os.environ.get("OPENAI_API_KEY", "")
base_url = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1")
client = OpenAI(api_key=api_key, base_url=base_url)

prompt = sys.argv[1]
output_path = sys.argv[2]

try:
    result = client.images.generate(
        model="gpt-image-1",
        prompt=prompt,
        n=1,
        size="1536x1024",
        quality="high"
    )
    
    img_data = result.data[0]
    if hasattr(img_data, 'b64_json') and img_data.b64_json:
        img_bytes = base64.b64decode(img_data.b64_json)
    elif hasattr(img_data, 'url') and img_data.url:
        import urllib.request
        with urllib.request.urlopen(img_data.url) as resp:
            img_bytes = resp.read()
    else:
        print(f"No image data. Attrs: {[a for a in dir(img_data) if not a.startswith('_')]}", file=sys.stderr)
        sys.exit(1)
    
    with open(output_path, "wb") as f:
        f.write(img_bytes)
    print(f"Saved: {output_path} ({len(img_bytes)} bytes)")
except Exception as e:
    print(f"Error: {type(e).__name__}: {e}", file=sys.stderr)
    sys.exit(1)
