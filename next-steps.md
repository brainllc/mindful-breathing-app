breathwork.fyi next steps (create a .md doc for cursor to see these next steps).

- For each of these items below, let’s start with building the UI first then we will setup supabase and make the backend work. Proceed with these features in the order that you think makes the most sense. I am not technical, so please advise on the most scalable and secure approach to creating all these features. 
- Create a really nice looking navbar that is responsive. We will now need a nav bar that has a link for what is currently the home page, let’s call it Interactive Breathing Exercises, then another one for the lead magnet we will soon be hosting lets call that “Free Breathwork for Stress Guide”. Then another one for the incoming library of courses, let’s call it “Educational Library (Coming Soon)”. Let’s make the educational library link unclickable for the moment.
- Create user registration ui and flow as well as a user profile and settings page. Include everything required for us to be compliant with data and privacy laws. Also, to be safe, let’s restrict users under 18 from accessing our app for now, so let’s weed them out in the user registration flow. 
- Lock some of the breathing exercise (probably half of each of the exercises for each mood category and then those same ones when looking at the All Exercises page) for unregistered users to encourage users to register.
- The cards for the locked exercises should have a CTA on them that says “Create an account for free to unlock” and then a button that says “Create Account”.
- Create progress tracking and dashboard feature. User should have a really nice looking dashboard to show them how many times they have completed each breath work exercise. They should also be able to see how many times they have done breath work exercises over the past 24 hours, past week, past month, and past year.  It should also show them which exercises they do the most and the least.
- Create the page for the “Free Breathwork for Stress Guide”. The idea of this page is to get users to enter their email and sign up for marketing emails. Make it as enticing as possible. For reference, here is some info on the guide. It is called “The 5-Minute Reset: A Science-Backed Guide to Calming Your Nervous System with Breath”. Subtitle is: Your Instant Toolkit for Less Stress, Better Sleep, and Sharper Focus. Here is a blurb on how the guide helps people: Does life ever feel like it's stuck on "fast-forward"? Between work deadlines, family responsibilities, and the constant ping of notifications, it's easy to feel like you're always "on"—running on a treadmill of stress that never seems to stop. You know you need a moment to pause and regroup, but finding the time or the right tool can feel like just one more thing on your to-do list.
* What if you could hit the reset button on your nervous system, anytime and anywhere, using a tool you already possess?
* That tool is your breath.
* Welcome to The 5-Minute Reset. This guide was created by the experts at breathwork.fyi to give you simple, powerful, and science-backed techniques to take back control of your well-being. In the next 10 minutes, you will learn a set of tools that can shift you from a state of stress to a state of calm in as little as 60 seconds. No experience, special equipment, or lengthy time commitment required.
* You're about to discover how to consciously use your breath to reduce anxiety, sharpen your focus, and prepare your body for restful sleep. Your journey to a calmer, more centered you starts now.

## Recent Fixes & Learnings

### Session Completion Issue (Fixed ✅)
**Problem**: Sessions were being started but not completed properly, causing:
- Stats not updating after exercises
- "In progress" sessions never marked as completed
- Streak calculations failing

**Root Cause**: Frontend was looking for `sessionData.sessionId` but backend returned `sessionData.id`

**Solution**: Changed frontend to use `sessionData.id` instead of `sessionData.sessionId`

**Key Learning**: Always verify API response structure matches frontend expectations

### Streak Calculation Consistency (Fixed ✅)
**Problem**: Dashboard showed streak = 1, but User Settings showed streak = 0

**Root Cause**: 
- Dashboard calculated streaks dynamically from session history
- User Settings used stale `currentStreak` field from database that was never updated

**Solution**: 
1. Created shared streak calculation utility (`client/src/lib/streaks.ts`)
2. Updated both Dashboard and Profile pages to use same calculation logic
3. Both now fetch session history and calculate streaks in real-time

**Key Learning**: Avoid duplicate logic across components - create shared utilities for consistency

### Password Update Timestamp Issue (In Progress 🔄)
**Problem**: Profile page shows "Last updated 30 days ago" even after recent password changes

**Next**: Investigate password update tracking in backend

