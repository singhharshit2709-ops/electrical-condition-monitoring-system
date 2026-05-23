# Neutral Glass — G Tank Electrical Condition Monitoring

Electrical condition monitoring for the G Tank (plant **GT**): current, temperature, and vibration readings with dashboard, bulk entry, alarms, and Google Sheets logging.

## Quick links (production)

| Resource | URL |
|----------|-----|
| Dashboard | https://electrical-condition-monitoring-system.onrender.com/ |
| Add readings | https://electrical-condition-monitoring-system.onrender.com/add-readings |
| View data | https://electrical-condition-monitoring-system.onrender.com/view-data |
| API docs | https://electrical-condition-monitoring-system.onrender.com/docs |
| Health | https://electrical-condition-monitoring-system.onrender.com/health |

See [PRODUCTION_RELEASE.md](./PRODUCTION_RELEASE.md) for deployment, architecture, and equipment coverage.

## Local development

```bash
# Terminal 1 — API
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8000

# Terminal 2 — UI (hot reload)
cd frontend
set REACT_APP_BACKEND_URL=http://127.0.0.1:8000
npm install
npm start
```

Or serve UI from the API:

```bash
./build.sh
cd backend && uvicorn server:app --port 8000
# Open http://127.0.0.1:8000/
```

## Production build (Render)

`render.yaml` runs the same steps as `build.sh`. Ensure the Render service uses this blueprint or set **Build Command** to:

```bash
./build.sh
```

After deploy, confirm `GET /health` returns `"dashboard_ready": "True"`.
