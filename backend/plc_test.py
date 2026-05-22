import requests
import random
import time

API_URL = "http://127.0.0.1:8000/api/condition-monitoring"

while True:

    payload = {
        "plant": "Plant A",
        "machine": "A1",
        "motor": "Feeder",

        "current": round(random.uniform(2, 6), 2),

        "temperature": round(random.uniform(30, 80), 2),

        "i2t": round(random.uniform(10, 50), 2),
            "normal_current": 3.0,
    "warning_current": 5.0,
    "normal_temperature": 35.0,
    "warning_temperature": 50.0,
    "normal_i2t": 20.0,
    "warning_i2t": 40.0
    }

    try:

        response = requests.post(API_URL, json=payload)

        print("\n==============================")
        print("DATA SENT:")
        print(payload)

        print("STATUS:", response.status_code)

        try:
            print("RESPONSE:", response.json())
        except:
            print("RAW RESPONSE:", response.text)

    except Exception as e:

        print("ERROR:", e)

    time.sleep(5)
    print("PLC test file running successfully")