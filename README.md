_Please switch to the 'zueMain' branch to access our new project: Zue Research. You will find a detailed README for that project there._


# Reclaim LA

We built Reclaim to make the process of remembering and cataloging loss belongings for insurance claims after the LA wildfires faster and simpler with an AI phone agent. More details: [ReclaimLA.org](https://reclaimla.org)

### ▶️ Demo video:
Click to watch
[![Reclaim LA Demo - AI insurance claims phone agent](https://img.youtube.com/vi/HAVhsWxebUQ/0.jpg)](https://www.youtube.com/watch?v=HAVhsWxebUQ)

## Getting Started

Install requirements:

```bash
npm install
```

Run the development server:

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

## Team & Responsibilities (Sprint 1)

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
- User interviews and product research --> led to focus on phone call rather than images and receipts
- Supabase Setup
- BlandAI Setup
- Creation of primary conversational pathway for phone call (https://drive.google.com/file/d/12G6Gy6ssIGjeT951RGOuK9k08dhJ4u5P/view?usp=sharing)
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

## Team & Responsibilities (Sprint 2) - Big focus on conversational pathway, market research, and media outreach

### Zane
- Implemented advanced AI features for better item recognition, ensuring accurate interpretation and cataloging of items mentioned by users.
- Conducted user feedback sessions to gather insights, which informed adjustments to the prompts, making them more intuitive and user-friendly.
- Continued testing and bug fixes
- Media and outreach for the project

### Matthew
- Expanded user research to include feedback from insurance companies, refining AI prompts to align with industry standards for inventory documentation.
- Developed new conversational pathways based on user feedback, ensuring the AI could handle a wider range of scenarios and user needs.
- Added context for people asking about what the project is about, and how it works
- Continued testing and bug fixes
- Media and outreach for the project

### Tina
- Updated website to make it easier to access the call and understand the outcome
- Updated copywriting to ensure AI prompts were empathetic and supportive, reflecting the project's mission to assist those affected by the wildfires.
- Added further context for questions about the project
- Managed GitHub issues and pull requests, overseeing the project's repository to ensure smooth implementation of changes to prompts and pathways.
- Continued testing and bug fixes
- Media and outreach for the project


## Team & Responsibilities (Sprint 4) - Tagging Images to catalog, portal to log in

### Zane
- Updated SMS process to accept and store images with Twilio
  - Enhanced the existing SMS functionality to handle image attachments via MMS
  - Implemented secure storage for user-submitted images of lost items
  - Modified database schema to associate uploaded images with specific inventory items
  - Integrated with the Twilio API to process incoming media messages

### Matthew
- Added edge function to tag images to items in the CSV
  - Created a sophisticated edge function that processes uploaded images and associates them with items in the user's inventory
  - Implemented GPT-4o vision capabilities to analyze images and identify items
  - Added image optimization with resizing functionality to handle large images efficiently
  - Built a matching system to connect uploaded photos with specific inventory items
- Created deck for final pitch
  - Developed comprehensive presentation highlighting the project's mission, technical architecture, user journey, and impact metrics

### Tina
- Added portal on website where people can access their inventory
  - Developed a secure dashboard interface with authentication
  - Created inventory display component to visualize cataloged items
  - Implemented call history tracking to show past interactions
  - Added CSV export functionality for insurance submission
  - Integrated user context management for secure data handling
- Created demo video for final presentation
  - Produced comprehensive demonstration showcasing the complete user journey
  - Highlighted the AI phone agent in action and inventory cataloging process
  - Demonstrated how users can access their inventory through the portal
  - Explained how the system helps wildfire victims with insurance claims
