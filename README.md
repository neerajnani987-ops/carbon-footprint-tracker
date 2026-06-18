# EcoTrace — AI-Powered Carbon Footprint Smart Assistant

EcoTrace is a premium, accessible, and high-performance sustainability coaching platform. It enables users to calculate their annual greenhouse gas emissions, log daily eco-friendly activities, watch savings trends via interactive visual charts, and receive recommendations from an integrated AI sustainability coach.

## Key Features

1. **Annual Footprint Calculator**: Multi-step forms checking vehicle travel, flights, monthly electricity/gas utilities, clean energy grid share, diet preferences, and waste volumes. Includes a live-calculation projection ticker.
2. **Daily Action Tracker**: Checklists categorized by transport, energy, food, and consumption. Submitting logs saves carbon scores and updates streak levels. Includes smartphone charge savings equivalencies and random eco-tips.
3. **AI Assistant**: A context-aware coaching chatbot that inspects user calculator metrics to generate personalized recommendations.
4. **Achievements & Badges**: Quests and achievements that unlock badges on streaks, savings, recycling rates, and vegan days.
5. **Advanced Analytics**: Line graphs and comparative bar charts checking metrics against national target benchmarks.
6. **Settings & Localization**: Preferences page with theme switching and multilingual support (English & Telugu).

---

## Technical Specifications

- **Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS (with default glassmorphism styling layers)
- **Charts**: Chart.js, React-Chartjs-2
- **Animations**: Framer Motion
- **Testing**: Vitest, JSDOM, Testing Library
- **Containerization**: Docker, Nginx

---

## Local Verification Commands

To install dependencies:
```bash
npm install
```

To run the local development server (with HMR):
```bash
npm run dev
```

To build and compile static assets for production:
```bash
npm run build
```

To run unit and calculation tests:
```bash
npm run test
```

---

## Deployment to Google Cloud Platform

### Option 1: Direct Cloud Shell Deployment (Recommended)

Since Google Cloud Shell pre-installs `gcloud`, `node`, and `docker`, it is the fastest way to deploy without installing tools locally:

1. Open [Google Cloud Shell](https://shell.cloud.google.com).
2. Upload this project folder.
3. Authenticate and select your project ID:
   ```bash
   gcloud config set project my-project-59239
   ```
4. Build the container image via Google Cloud Build:
   ```bash
   gcloud builds submit --tag gcr.io/my-project-59239/carbon-tracker
   ```
5. Deploy the image to Google Cloud Run:
   ```bash
   gcloud run deploy carbon-tracker \
     --image gcr.io/my-project-59239/carbon-tracker \
     --platform managed \
     --allow-unauthenticated \
     --region us-central1 \
     --port 8080
   ```

### Option 2: Local Command Line Deployment

Once the Google Cloud SDK is installed locally and in your system PATH:

1. Authenticate with your Google account:
   ```bash
   gcloud auth login
   ```
2. Set your active project ID:
   ```bash
   gcloud config set project my-project-59239
   ```
3. Submit the build and deploy:
   ```bash
   gcloud builds submit --tag gcr.io/my-project-59239/carbon-tracker
   ```
   ```bash
   gcloud run deploy carbon-tracker --image gcr.io/my-project-59239/carbon-tracker --platform managed --allow-unauthenticated --region us-central1 --port 8080
   ```
