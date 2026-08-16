import requests

url = "http://localhost:8080/api/alerts/upload-incident"
headers = {"x-drone-api-key": "kolkata-secret-key-12345"}
payload = {
    "droneId": "SKYW-KOL-01",
    "objectType": "PERSON",
    "confidence": "0.99",
    "severity": "CRITICAL",
    "sector": "KOLKATA-EAST",
    "lat": "22.5726",
    "lng": "88.3639"
}
with open("test_inf.py", "rb") as f:
    files = {"file": ("incident.mp4", f.read(), "video/mp4")}
    res = requests.post(url, data=payload, files=files, headers=headers)
    print(res.status_code, res.text)
