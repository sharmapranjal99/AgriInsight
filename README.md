# 🌾 AgriInsight — Seasonal Agriculture Performance Analysis

### VOIS AICTE Batch 1 (2026–2027) | Major Project

AgriInsight is an interactive web-based platform developed for the **Seasonal Agriculture Performance Analysis** major project. It presents a comprehensive analysis of agricultural performance across India's three major cropping seasons: **Kharif, Rabi, and Zaid**.

The platform transforms the project's Jupyter Notebook analysis into an interactive experience, making agricultural trends, statistical findings, resource utilization, environmental patterns, and economic performance easier to explore and understand.

---

## 🌐 Live Website

**Explore AgriInsight — Now Live!**

🔗 **[Visit AgriInsight](https://agri-insight-teal.vercel.app/)**

<sub>Deployed and hosted on Vercel.</sub>

---

## 📊 Project at a Glance

| Project Metric | Details |
|---|---|
| Farm Records | 4,000 |
| Dataset Variables | 28 |
| States | 8 |
| Crops | 8 |
| Districts | 10 |
| Cropping Seasons | Kharif, Rabi, Zaid |
| Platform | Interactive Web Application |
| Deployment | Vercel |

The website covers the complete analytical workflow, including data preprocessing, exploratory data analysis, seasonal comparisons, environmental analysis, resource utilization, economic analysis, regional patterns, statistical hypothesis testing, recommendations, and conclusions.

**Data Integrity:** All analytical figures displayed on the website are derived from the project's source CSV dataset and Jupyter Notebook. No placeholder or invented analytical data is used.

---

## 1. Technology Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 + TypeScript |
| Build Tool & Development Server | Vite 5 |
| Routing | React Router 6 |
| Charts & Visualizations | Recharts, Custom SVG, CSS Grid Heatmaps |
| Animations | Framer Motion |
| Icons | lucide-react |
| Styling | Custom CSS |
| Typography | Fraunces + Inter |
| Data Processing | Python 3, Pandas, NumPy, SciPy |

**Requirements:** Node.js 18 or newer and npm. The project was tested with Node.js v24.13.0 and npm 11.6.2.

Python is required only when regenerating the analytical data file.

---

## 2. Run the Website Locally

Follow these steps to run AgriInsight on your computer.

### Step 1: Open the Project Folder

Open PowerShell or Command Prompt and navigate to the website directory:

```powershell
cd "C:\Users\hp\OneDrive\Desktop\AgriInsight\website"
```

### Step 2: Install Dependencies

Run this command if you are setting up the project for the first time or if `node_modules` is missing:

```powershell
npm install
```

### Step 3: Start the Development Server

```powershell
npm run dev
```

### Step 4: Open the Website

Open the following URL in your browser:

**http://localhost:5173**

Vite automatically opens the browser in most configurations. If it does not, open the URL manually.

---

## 3. Available Development Commands

Run all commands from inside the `website` directory.

| Command | Description |
|---|---|
| `npm install` | Installs all project dependencies |
| `npm run dev` | Starts the local development server |
| `npm run build` | Type-checks and creates the production build |
| `npm run preview` | Previews the production build locally |
| `npm run data` | Regenerates the analytical JSON data file using Python |

**Local URLs:**

| Service | URL |
|---|---|
| Development Server | http://localhost:5173 |
| Production Preview | http://localhost:4173 |

The project commands have been tested, including dependency installation, production build, data regeneration, and local development.

---

## 4. Website Pages & Navigation

AgriInsight contains 14 analytical and informational sections.

| Section | Local URL |
|---|---|
| Home | `/` |
| Problem Statement | `/problem` |
| Objectives | `/objectives` |
| Project Overview | `/overview` |
| Methodology | `/methodology` |
| Dataset & Preprocessing | `/dataset` |
| Exploratory Data Analysis | `/eda` |
| Seasonal Performance Analysis | `/seasonal` |
| Environmental Analysis | `/environment` |
| Resource Utilization | `/resources` |
| Economic & Regional Analysis | `/economics` |
| Statistical Findings | `/statistics` |
| Recommendations | `/recommendations` |
| Conclusion | `/conclusion` |

For local testing, append any route to `http://localhost:5173`.

---

## 5. Stop the Development Server

To stop the local development server:

1. Open the terminal where `npm run dev` is running.
2. Press `Ctrl + C`.
3. If prompted with `Terminate batch job (Y/N)?`, type `Y` and press Enter.

Closing the terminal also stops the server.

If the terminal is unavailable and the server is still running, use:

```powershell
netstat -ano | findstr :5173
```

Identify the process ID (PID), then run:

```powershell
taskkill /PID 12345 /F
```

Replace `12345` with the actual PID.

---

## 6. Restart the Website

After shutting down or restarting your computer, run:

```powershell
cd "C:\Users\hp\OneDrive\Desktop\AgriInsight\website"
npm run dev
```

Then open:

http://localhost:5173

There is no need to reinstall dependencies if the `node_modules` folder is still available.

---

## 7. Reinstall Dependencies

If `node_modules` is missing or corrupted, reinstall the dependencies.

```powershell
cd "C:\Users\hp\OneDrive\Desktop\AgriInsight\website"
npm install
npm run dev
```

For a clean reinstall:

```powershell
cd "C:\Users\hp\OneDrive\Desktop\AgriInsight\website"
Remove-Item -Recurse -Force node_modules
npm install
```

The `package-lock.json` file maintains the project's dependency versions.

Avoid using `npm audit fix --force` without reviewing the changes, as it may introduce incompatible major dependency upgrades.

---

## 8. Environment Variables & Data Configuration

No environment variables, API keys, `.env` files, or database connections are required.

The website is a static frontend application that loads its analytical data from:

```text
website/public/data/insights.json
```

### Regenerating the Analytical Data

If the source CSV or data-processing script changes, regenerate the JSON file using:

```powershell
cd "C:\Users\hp\OneDrive\Desktop\AgriInsight\website"

pip install pandas numpy scipy

npm run data
```

The script reads the root-level dataset:

```text
seasonal_agriculture_performance_dataset.csv
```

It reproduces the project's data-cleaning and statistical-processing steps and generates:

```text
public/data/insights.json
```

The generated file supplies the numerical data displayed throughout the website.

### Internet Requirement

The website loads Fraunces and Inter fonts from Google Fonts. When offline, the application falls back to system fonts.

### Troubleshooting

| Problem | Solution |
|---|---|
| `npm` is not recognized | Install Node.js LTS and reopen the terminal |
| PowerShell blocks npm scripts | Use Command Prompt or `npm.cmd run dev` |
| Vite is not recognized | Run `npm install` |
| Analysis data cannot load | Check `public/data/insights.json` |
| Website opens on port 5174 | Port 5173 may already be occupied; use the URL printed by Vite |
| Opening `index.html` directly shows a blank page | Start the website using `npm run dev` or `npm run preview` |

---

## 9. Project Folder Structure

```text
AgriInsight/
│
├── README.md
├── DATA_PROVENANCE.md
├── PROJECT_PROGRESS.md
├── complete_workflow.png
│
├── Major Project_Seasonal Agriculture Performance Analysis.pdf
├── Seasonal_Agriculture_Performance_Analysis.ipynb
├── seasonal_agriculture_performance_dataset.csv
│
└── website/
    │
    ├── package.json
    ├── package-lock.json
    ├── index.html
    ├── vite.config.ts
    ├── tsconfig.json
    ├── vercel.json
    │
    ├── scripts/
    │   └── build_data.py
    │
    ├── public/
    │   ├── favicon.svg
    │   ├── data/
    │   │   └── insights.json
    │   └── upload/
    │
    └── src/
        │
        ├── App.tsx
        ├── main.tsx
        │
        ├── styles/
        │   └── global.css
        │
        ├── data/
        │   ├── DataContext.tsx
        │   └── types.ts
        │
        ├── lib/
        │   ├── sections.ts
        │   └── format.ts
        │
        ├── components/
        │   ├── Header.tsx
        │   ├── Footer.tsx
        │   ├── PageShell.tsx
        │   ├── Brand.tsx
        │   ├── ui.tsx
        │   ├── Heatmap.tsx
        │   ├── BoxPlot.tsx
        │   ├── Illustrations.tsx
        │   └── Notebook-based chart components
        │
        └── pages/
            ├── Home.tsx
            ├── Problem.tsx
            ├── Objectives.tsx
            ├── Overview.tsx
            ├── Methodology.tsx
            ├── Dataset.tsx
            ├── EDA.tsx
            ├── Seasonal.tsx
            ├── Environment.tsx
            ├── Resources.tsx
            ├── Economics.tsx
            ├── Statistics.tsx
            ├── Recommendations.tsx
            ├── Conclusion.tsx
            └── NotFound.tsx
```

---

## 10. Important Development Guidelines

To maintain consistency and reliability while extending the project, follow these guidelines:

- **Data Accuracy:** Do not hard-code analytical statistics directly into individual pages. Figures should be generated through `scripts/build_data.py` and loaded from `insights.json`.
- **Source Files:** The root-level PDF, notebook, and CSV are the project's source documents and dataset. Keep them unchanged unless an update is explicitly required.
- **Navigation:** The website's section configuration is maintained in `src/lib/sections.ts`. New sections should also be registered in `src/App.tsx`.
- **Data Provenance:** Maintain the distinction between charts reproduced from notebook analysis and additional views computed from the same cleaned dataset.
- **Build Verification:** Run `npm run build` before deployment or project submission to identify TypeScript and production-build errors.
- **Responsive Design:** Test new pages and visualizations on desktop, tablet, and mobile screen sizes.
- **Deployment:** The production build generates a static `dist/` directory. The application uses clean URLs, so hosting platforms must support SPA fallback to `index.html`.

### Statistical Verification Notes

Four statements in the notebook's written text disagree with its computed outputs. The website documents these differences in the Statistical Findings section:

1. Finding 3 states that Rabi's median profit is positive. The computed value is −₹3,187.
2. The notebook describes rainfall and soil moisture as the strongest raw-yield correlations. The raw-yield correlation ranking does not support that statement; the website also displays crop-adjusted correlations.
3. Sections 6 and Recommendation 3 state that the best season varies by crop. The computed results show Kharif as the best season for every crop, for both yield and profit.
4. Every one of the 10 districts appears under all 8 states, so regional analysis is presented at state level only.

These differences are documented for transparency and should be reviewed against the source notebook before final academic submission.

---

## 11. Deployment

AgriInsight is deployed on **Vercel**.

**Live Website:** [https://agri-insight-teal.vercel.app/](https://agri-insight-teal.vercel.app/)

The production website is built using:

```powershell
npm run build
```

The generated `dist/` directory contains the production-ready static files.

For deployment, configure the hosting platform to use the `website` directory as the project root and enable SPA fallback for client-side routes.

---

## 👨‍💻 Project Information

**Project:** Seasonal Agriculture Performance Analysis  
**Platform:** AgriInsight  
**Programme:** VOIS AICTE Batch 1 (2026–2027)  
**Institution:** KIET Group of Institutions  

### ⭐ Project Highlights

- Interactive agricultural analytics website
- Analysis of 4,000 farm-level records
- Seasonal comparisons across Kharif, Rabi, and Zaid
- Environmental and resource utilization analysis
- Economic and regional performance analysis
- Statistical hypothesis testing
- Notebook-based data provenance
- Responsive web interface
- Live deployment on Vercel

---

**AgriInsight — Turning Agricultural Data into Meaningful Insights.**
