# Reclaim LA

We built Reclaim to make the process of remembering and cataloging loss belongings for insurance claims after the LA wildfires faster and simpler with an AI phone agent. More details: [ReclaimLA.org](https://reclaimla.org)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## About The Project

Reclaim LA is a platform designed to help Los Angeles residents who lost their homes in wildfires create comprehensive inventories of their lost possessions for insurance claims. The platform features:

- An AI-powered phone agent that guides users through a room-by-room inventory process
- Automated transcription and categorization of lost items
- CSV generation for easy submission to insurance companies
- Secure data handling with automatic deletion after 30 days
- Mobile-first design for accessibility
- Email delivery of completed inventory lists

## Team & Responsibilities

### Zane
- Twilio Setup
- Text messaging function
- Text recieving function
- Extract JSON from transcript & convert to CSV
- Automatically email user with Resend
- Convesrational pathway adjustments
- Setup Axios meeting
- Testing and bug fixes

### Matthew
- Supabase Setup
- BlandAI Setup
- Setup of primary conversational pathway for phone call
- Edge function to send phone call to user
- Edge function to extract and send transcript on call completion
- Conversational pathway adjustments
- Announcement in 3 local newsletters
- Axios Interview
- Testing and bug fixes

### Tina
- Website Setup
- Copywriting
- GitHub project setup
- Convesrational pathway adjustments
- Axios Interview
- Testing and bug fixes
