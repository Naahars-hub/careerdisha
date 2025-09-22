This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

### Location-Aware Authentication
The application now collects location information during the login/signup process to provide personalized content and better user experience. The location data includes:

- **Automatic Detection**: Uses browser geolocation API to automatically detect user's location
- **Manual Input**: Users can manually enter their country, state, and city if location detection is denied
- **Reverse Geocoding**: Converts coordinates to readable location names using BigDataCloud API
- **Timezone Detection**: Automatically detects user's timezone for better scheduling features

### Database Schema
The application uses a `user_profiles` table to store location data:
- `location_country`: User's country
- `location_state`: User's state/province  
- `location_city`: User's city
- `latitude`/`longitude`: Precise coordinates
- `timezone`: User's timezone

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
