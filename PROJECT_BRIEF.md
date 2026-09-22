# Momentum — Project Brief

Keep your job search moving.

## Problem

Job searching has a broken feedback loop — you can work hard for weeks
and have almost nothing to show for it. Most trackers log activity
without showing whether the approach is working or what to do next.

## Main User

Someone actively job-hunting who wants to see where their search
stands, notice what's stuck, and always know their next useful action.

## What The User Does

Logs applications through a real pipeline including an honest
"Waiting" state, checks job-search habits, and gets a suggested next
action based on their own data.

## Main Features (MVP)

- Pipeline: Applied, Waiting, Interviewing, Offer, Rejected
- Rules-based Next Move suggestion (no AI needed)
- Activity calendar rather than a punishing streak counter
- Insights: response rate, interview rate, breakdown by role
- Filter/search applications by status or company

## Screens

1. Dashboard
2. Applications (list, filterable)
3. Application Detail (/applications/:id)
4. Add Application (/applications/new)
5. Momentum (activity + habits)
6. Insights

Plus small utility pages: About, Not Found.

## Data Model (MVP)

- Application: { id, company, role, status, dateApplied, interviewDate, applicationUrl, notes, activities: [] }
- Activity: { id, type, date, applicationId, note }
- Habit: { id, name, frequency, completedDates: [] }

## Route Map

| Route | Screen |
|---|---|
| / | Dashboard |
| /applications | Applications list |
| /applications/new | Add Application |
| /applications/:id | Application Detail (dynamic) |
| /momentum | Activity + habits |
| /insights | Search insights |
| /about | About |
| * | Not Found |
| /login (future) | Guards write actions once auth is added (Next.js phase) |

## Explicitly Deferred (Future, Not This Capstone)

Career/Onboarding/Timeline modes, 30/60/90-day system, AI-driven
insights, calendar/email integration. Real roadmap ideas, out of
scope for the time remaining.
