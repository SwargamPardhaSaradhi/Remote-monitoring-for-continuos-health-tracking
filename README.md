# Health Monitor AI

Remote Monitoring for Continuous Health Tracking using AI

## Features

### Active Features
- **User Authentication**: Secure login and signup using Supabase
- **Health Metrics Input**: Record vital signs including:
  - Heart Rate (BPM)
  - Blood Pressure (Systolic/Diastolic)
  - Oxygen Saturation (SpO₂)
  - Body Temperature
- **AI-Powered Health Analysis**: Uses Google Gemini AI to provide:
  - Early disease risk prediction based on current and historical data
  - Personalized diet recommendations for better health
- **Historical Data Tracking**: View your last 5 health measurements
- **Real-time Dashboard**: Beautiful, responsive interface for health monitoring

### Coming Soon (Dummy Features)
- **Live Doctor-Patient Video Consultation**: Integrated video calls with healthcare professionals
- **Preventive Healthcare Focus**: Enhanced remote monitoring for rural and underserved regions

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Update the `.env` file with your actual credentials:

```env
VITE_SUPABASE_URL=your_actual_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
VITE_GEMINI_API_KEY=your_actual_gemini_api_key
```

**Getting your credentials:**

- **Supabase**: Visit your [Supabase Dashboard](https://app.supabase.com) and copy the URL and anon key from your project settings
- **Gemini API**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 3. Configure Gemini API Key in Supabase

The edge function needs access to the Gemini API key. Configure it as a secret:

1. Go to your Supabase Dashboard
2. Navigate to Edge Functions → Settings
3. Add a new secret:
   - Name: `GEMINI_API_KEY`
   - Value: Your Gemini API key

### 4. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## How It Works

1. **Sign Up / Login**: Create an account or sign in with existing credentials
2. **Enter Health Data**: Input your current vital signs in the dashboard
3. **AI Analysis**: Click "Submit & Analyze" to get AI-powered health insights
4. **View Results**:
   - Disease risk predictions based on your data patterns
   - Personalized diet recommendations
   - Historical tracking of your measurements

## Technology Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (Authentication + Database + Edge Functions)
- **AI**: Google Gemini Pro API
- **Icons**: Lucide React

## Database Schema

The application uses two main tables:

- `health_metrics`: Stores user vital signs and measurements
- `ai_analyses`: Stores AI-generated predictions and recommendations

All tables are protected with Row Level Security (RLS) to ensure users can only access their own data.

## Security

- Row Level Security (RLS) enabled on all tables
- User data is isolated and secure
- API keys stored as environment variables
- JWT-based authentication

## Support

For issues or questions, please check your:
- Environment variables are correctly set
- Supabase project is active
- Gemini API key is valid and has quota remaining
